/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { WorkspaceContext } from "@monorepolint/core";
import { writeFileSync } from "fs";
import * as path from "path";
import * as tmp from "tmp";
import { bannedDependencies, Options } from "../bannedDependencies";
import { makeDirectoryRecursively } from "../util/makeDirectory";
import { jsonToString } from "./utils";

const EMPTY_PACKAGE = jsonToString({});

describe("bannedDependencies", () => {
  tmp.setGracefulCleanup();

  let cleanupJobs: Array<() => void> = [];
  let cwd: string | undefined;

  beforeEach(() => {
    const dir = tmp.dirSync();
    cleanupJobs.push(() => dir.removeCallback());
    cwd = dir.name;

    const spy = jest.spyOn(process, "cwd");
    spy.mockReturnValue(cwd);
  });

  afterEach(() => {
    for (const cleanupJob of cleanupJobs) {
      cleanupJob();
    }
    cleanupJobs = [];
  });

  function makeWorkspace() {
    const workspaceContext = new WorkspaceContext(cwd!, {
      rules: [],
      fix: false,
      verbose: false,
      silent: true,
    });

    function checkAndSpy(options: Options) {
      const addErrorSpy = jest.spyOn(workspaceContext, "addError");
      bannedDependencies.check(workspaceContext, {
        ...options,
      });
      return { addErrorSpy };
    }

    function addFile(filePath: string, content: string) {
      const dirPath = path.resolve(cwd!, path.dirname(filePath));
      const resolvedFilePath = path.resolve(cwd!, filePath);

      makeDirectoryRecursively(dirPath);
      writeFileSync(resolvedFilePath, content);
      return resolvedFilePath;
    }

    return { addFile, workspaceContext, checkAndSpy };
  }

  it("Flags banned dependencies correctly", async () => {
    const { addFile, checkAndSpy } = makeWorkspace();
    const rootPackageJson = jsonToString({
      dependencies: {
        aaa: "0.0.1",
        ccc: "0.0.1",
      },
    });
    addFile("./package.json", rootPackageJson);

    const { addErrorSpy: addErrorSpy1 } = checkAndSpy({ bannedDependencies: ["ccc"] });
    expect(addErrorSpy1).toHaveBeenCalledTimes(1);
    addErrorSpy1.mockReset();

    const { addErrorSpy: addErrorSpy2 } = checkAndSpy({ bannedDependencies: ["ddd"] });
    expect(addErrorSpy2).toHaveBeenCalledTimes(0);
    addErrorSpy2.mockReset();

    const { addErrorSpy: addErrorSpy3 } = checkAndSpy({ bannedDependencies: ["ccc", "ddd"] });
    expect(addErrorSpy3).toHaveBeenCalledTimes(1);
    addErrorSpy3.mockReset();
  });

  it("Flags banned transitives correctly", async () => {
    const { addFile, checkAndSpy } = makeWorkspace();
    const rootPackageJson = jsonToString({
      dependencies: {
        aaa: "0.0.1",
      },
    });
    addFile("./package.json", rootPackageJson);

    const aaaPackageJson = jsonToString({
      dependencies: {
        bbb: "0.0.1",
        ccc: "0.0.1",
      },
    });
    addFile("./aaa/package.json", aaaPackageJson);
    const bbbPackageJson = jsonToString({
      dependencies: {
        ddd: "0.0.1",
      },
    });
    addFile("./aaa/bbb/package.json", bbbPackageJson);
    addFile("./aaa/bbb/ddd/package.json", EMPTY_PACKAGE);
    addFile("./aaa/ccc/package.json", EMPTY_PACKAGE);

    expect(checkAndSpy({ bannedTransitiveDependencies: ["ccc", "ddd"] }).addErrorSpy).toHaveBeenCalledTimes(2);
  });
});
