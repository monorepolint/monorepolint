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
import { REMOVE } from "../REMOVE.js";
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
    baz: REMOVE,
  },
} as const;

const CORRECT_OUTPUT = jsonToString({
  dependencies: {
    foo: "1.0.0",
  },
  devDependencies: {
    bar: "^2.0.0",
  },
});

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

  describe("Missing package.json handling", () => {
    it("handles gracefully when package.json does not exist", () => {
      const { workspaceContext } = makeWorkspace({ fix: false });
      // Don't create a package.json file

      expect(() => {
        requireDependency({ options: { dependencies: { foo: "1.0.0" } } }).check(workspaceContext);
      }).toThrow(); // Should throw when trying to get package.json
    });
  });

  describe("Invalid package.json structure", () => {
    it("handles package.json with non-object dependencies", () => {
      const { addFile, checkAndSpy } = makeWorkspace({ fix: false });
      addFile("./package.json", PACKAGE_ROOT);
      addFile(
        "./packages/test/package.json",
        jsonToString({
          name: "test-package",
          dependencies: "invalid-dependencies", // Should be an object
        }),
      );

      // This won't throw - it will treat dependencies as undefined and add an error
      const { addErrorSpy } = checkAndSpy("./packages/test");
      requireDependency({ options: { dependencies: { foo: "1.0.0" } } }).check(
        checkAndSpy("./packages/test").context,
      );

      // Should add error for missing dependencies block
      expect(addErrorSpy).toHaveBeenCalled();
    });

    it("handles malformed JSON in package.json", () => {
      const { addFile, workspaceContext } = makeWorkspace({ fix: false });
      addFile("./package.json", "{ invalid json }");

      expect(() => {
        requireDependency({ options: { dependencies: { foo: "1.0.0" } } }).check(workspaceContext);
      }).toThrow(); // Should throw when parsing invalid JSON
    });
  });

  describe("REMOVE symbol edge cases", () => {
    it("handles REMOVE on non-existent dependency", () => {
      const { addFile, workspaceContext } = makeWorkspace({ fix: true });
      addFile("./package.json", PACKAGE_ROOT);
      addFile(
        "./packages/test/package.json",
        jsonToString({
          name: "test",
          dependencies: {},
        }),
      );

      const context = workspaceContext.createChildContext(
        path.resolve(workspaceContext.packageDir, "packages/test"),
      );
      const addErrorSpy = vi.spyOn(context, "addError");

      requireDependency({
        options: {
          dependencies: {
            nonExistent: REMOVE,
          },
        },
      }).check(context);

      // Should not add any errors since the dependency doesn't exist (desired state achieved)
      expect(addErrorSpy).toHaveBeenCalledTimes(0);
    });

    it("handles multiple REMOVE operations", () => {
      const { addFile, readFile, workspaceContext } = makeWorkspace({ fix: true });
      addFile("./package.json", PACKAGE_ROOT);
      addFile(
        "./packages/test/package.json",
        jsonToString({
          name: "test",
          dependencies: {
            toRemove1: "1.0.0",
            toRemove2: "2.0.0",
            toKeep: "3.0.0",
          },
          devDependencies: {
            devToRemove: "1.0.0",
          },
        }),
      );

      const context = workspaceContext.createChildContext(
        path.resolve(workspaceContext.packageDir, "packages/test"),
      );
      const addErrorSpy = vi.spyOn(context, "addError");

      requireDependency({
        options: {
          dependencies: {
            toRemove1: REMOVE,
            toRemove2: REMOVE,
          },
          devDependencies: {
            devToRemove: REMOVE,
          },
        },
      }).check(context);

      expect(addErrorSpy).toHaveBeenCalledTimes(3); // Three removals

      const updatedPackage = JSON.parse(readFile("./packages/test/package.json"));
      expect(updatedPackage.dependencies).toEqual({ toKeep: "3.0.0" });
      expect(updatedPackage.devDependencies).toEqual({});
    });

    it("handles REMOVE when dependency section doesn't exist", () => {
      const { addFile, workspaceContext } = makeWorkspace({ fix: false });
      addFile("./package.json", PACKAGE_ROOT);
      addFile(
        "./packages/test/package.json",
        jsonToString({
          name: "test",
          // No dependencies section at all
        }),
      );

      const context = workspaceContext.createChildContext(
        path.resolve(workspaceContext.packageDir, "packages/test"),
      );
      const addErrorSpy = vi.spyOn(context, "addError");

      requireDependency({
        options: {
          dependencies: {
            nonExistent: REMOVE,
          },
        },
      }).check(context);

      // The rule will add an error for missing dependencies block since we require a dependency
      // but want to REMOVE it - but since there's no block, it creates one (but filtered to exclude REMOVE)
      expect(addErrorSpy).toHaveBeenCalledTimes(1);
    });
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

      // Optional versions (REMOVE)
      expect(() =>
        ruleModule.validateOptions({
          dependencies: { "react": REMOVE },
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
