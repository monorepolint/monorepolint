/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { WorkspaceContextImpl } from "@monorepolint/core";
import { SimpleHost } from "@monorepolint/utils";
import { readFileSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import * as tmp from "tmp";
import { afterEach, describe, expect, it, vi } from "vitest";
import { requireDependency } from "../requireDependency.js";
import { makeDirectoryRecursively } from "../util/makeDirectory.js";
import { jsonToString } from "./utils.js";

const PACKAGE_ROOT = jsonToString({
  workspaces: {
    packages: ["packages/*"],
  },
  dependencies: {
    foo: "5",
  },
});

const PACKAGE_WITH_NO_ENTRIES = jsonToString({});

const PACKAGE_WITH_ENTRIES_MISSING = jsonToString({
  dependencies: {},
  devDependencies: {},
});

const PACKAGE_WITH_WRONG_ENTRIES = jsonToString({
  dependencies: {
    foo: "0.1.0",
  },
  devDependencies: {
    bar: "1.0.0",
    baz: "1.0.0",
  },
});

const PACKAGE_WITH_RIGHT_ENTRIES = jsonToString({
  dependencies: {
    foo: "1.0.0",
  },
  devDependencies: {
    bar: "^2.0.0",
  },
});

const OPTIONS = {
  dependencies: {
    foo: "1.0.0",
  },
  devDependencies: {
    bar: "^2.0.0",
    baz: undefined,
  },
} as const;

const CORRECT_OUTPUT = jsonToString(OPTIONS);

describe("requireDependency", () => {
  tmp.setGracefulCleanup();

  let cleanupJobs: Array<() => void> = [];

  afterEach(() => {
    for (const cleanupJob of cleanupJobs) {
      cleanupJob();
    }
    cleanupJobs = [];
  });

  function makeWorkspace({ fix }: { fix: boolean }) {
    const dir: tmp.DirResult = tmp.dirSync({ unsafeCleanup: true });
    cleanupJobs.push(() => dir.removeCallback());

    const workspaceContext = new WorkspaceContextImpl(
      dir.name,
      {
        rules: [],
        fix,
        verbose: false,
        silent: true,
      },
      new SimpleHost(),
    );

    function checkAndSpy(q: string) {
      const context = workspaceContext.createChildContext(
        path.resolve(dir.name, q),
      );
      const addErrorSpy = vi.spyOn(context, "addError");
      requireDependency({ options: OPTIONS }).check(context);
      return { context, addErrorSpy };
    }

    function addFile(filePath: string, content: string) {
      const dirPath = path.resolve(dir.name, path.dirname(filePath));
      const resolvedFilePath = path.resolve(dir.name, filePath);

      makeDirectoryRecursively(dirPath);
      writeFileSync(resolvedFilePath, content);
    }

    function readFile(filePath: string) {
      return readFileSync(path.resolve(dir.name, filePath)).toString();
    }

    return { addFile, readFile, workspaceContext, checkAndSpy };
  }

  it("checks correctly", () => {
    const { addFile, workspaceContext, checkAndSpy } = makeWorkspace({
      fix: false,
    });
    addFile("./package.json", PACKAGE_ROOT);
    addFile("./packages/none/package.json", PACKAGE_WITH_NO_ENTRIES);
    addFile("./packages/missing/package.json", PACKAGE_WITH_ENTRIES_MISSING);
    addFile("./packages/wrong/package.json", PACKAGE_WITH_WRONG_ENTRIES);
    addFile("./packages/right/package.json", PACKAGE_WITH_RIGHT_ENTRIES);

    requireDependency({ options: OPTIONS }).check(workspaceContext);

    const none = checkAndSpy("./packages/none");
    expect(none.addErrorSpy).toHaveBeenCalledTimes(2);

    const missing = checkAndSpy("./packages/missing");
    expect(missing.addErrorSpy).toHaveBeenCalledTimes(2);

    const wrong = checkAndSpy("./packages/wrong");
    expect(wrong.addErrorSpy).toHaveBeenCalledTimes(3);

    const right = checkAndSpy("./packages/right");
    expect(right.addErrorSpy).toHaveBeenCalledTimes(0);
  });

  it("fixes correctly", () => {
    const { addFile, readFile, checkAndSpy } = makeWorkspace({ fix: true });
    addFile("./package.json", PACKAGE_ROOT);
    addFile("./packages/missing/package.json", PACKAGE_WITH_ENTRIES_MISSING);
    addFile("./packages/wrong/package.json", PACKAGE_WITH_WRONG_ENTRIES);

    const missing = checkAndSpy("./packages/missing");
    expect(missing.addErrorSpy).toHaveBeenCalledTimes(2);

    const wrong = checkAndSpy("./packages/wrong");
    expect(wrong.addErrorSpy).toHaveBeenCalledTimes(3);

    const missingContents = readFile("./packages/missing/package.json");
    expect(missingContents).toEqual(CORRECT_OUTPUT);

    const contents = readFile("./packages/wrong/package.json");
    expect(contents).toEqual(CORRECT_OUTPUT);
  });

  describe("Options Validation", () => {
    it("should accept valid options", () => {
      const ruleModule = requireDependency({ options: {} });

      expect(() => ruleModule.validateOptions({})).not.toThrow();
      expect(() => ruleModule.validateOptions({ dependencies: { "react": "^18.0.0" } })).not
        .toThrow();
      expect(() =>
        ruleModule.validateOptions({
          devDependencies: { "typescript": "^5.0.0" },
          peerDependencies: { "react": ">=16.0.0" },
        })
      ).not.toThrow();

      // Optional versions (undefined)
      expect(() =>
        ruleModule.validateOptions({
          dependencies: { "react": undefined },
        })
      ).not.toThrow();
    });

    it("should reject invalid options", () => {
      const ruleModule = requireDependency({ options: {} });

      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({ dependencies: "react" })).toThrow();
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({ dependencies: { "react": 123 } })).toThrow();
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({ devDependencies: [] })).toThrow();
    });
  });
});
