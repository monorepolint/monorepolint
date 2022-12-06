/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { WorkspaceContextImpl } from "@monorepolint/core";
import { SimpleHost } from "@monorepolint/utils";
import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import * as tmp from "tmp";
import { requireDependency } from "../requireDependency";
import { makeDirectoryRecursively } from "../util/makeDirectory";
import { jsonToString } from "./utils";

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
      new SimpleHost()
    );

    function checkAndSpy(q: string) {
      const context = workspaceContext.createChildContext(path.resolve(dir.name, q));
      const addErrorSpy = jest.spyOn(context, "addError");
      requireDependency.check(context, OPTIONS);
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
    const { addFile, workspaceContext, checkAndSpy } = makeWorkspace({ fix: false });
    addFile("./package.json", PACKAGE_ROOT);
    addFile("./packages/none/package.json", PACKAGE_WITH_NO_ENTRIES);
    addFile("./packages/missing/package.json", PACKAGE_WITH_ENTRIES_MISSING);
    addFile("./packages/wrong/package.json", PACKAGE_WITH_WRONG_ENTRIES);
    addFile("./packages/right/package.json", PACKAGE_WITH_RIGHT_ENTRIES);

    requireDependency.check(workspaceContext, OPTIONS);

    const none = checkAndSpy("./packages/none");
    expect(none.addErrorSpy).toHaveBeenCalledTimes(2);

    const missing = checkAndSpy("./packages/missing");
    expect(missing.addErrorSpy).toHaveBeenCalledTimes(2);

    const wrong = checkAndSpy("./packages/wrong");
    expect(wrong.addErrorSpy).toHaveBeenCalledTimes(2);

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
    expect(wrong.addErrorSpy).toHaveBeenCalledTimes(2);

    const missingContents = readFile("./packages/missing/package.json");
    expect(missingContents).toEqual(CORRECT_OUTPUT);

    const contents = readFile("./packages/wrong/package.json");
    expect(contents).toEqual(CORRECT_OUTPUT);
  });
});
