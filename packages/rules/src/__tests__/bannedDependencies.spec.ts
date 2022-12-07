/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { WorkspaceContextImpl } from "@monorepolint/core";
import { SimpleHost } from "@monorepolint/utils";
import { writeFileSync } from "fs";
import * as path from "path";
import * as tmp from "tmp";
import { bannedDependencies, Options } from "../bannedDependencies.js";
import { makeDirectoryRecursively } from "../util/makeDirectory.js";
import { jsonToString } from "./utils.js";
const EMPTY_PACKAGE = jsonToString({});

describe("bannedDependencies", () => {
  tmp.setGracefulCleanup();

  let cleanupJobs: Array<() => void> = [];
  let cwd: string | undefined;

  beforeEach(() => {
    const dir = tmp.dirSync({ unsafeCleanup: true });
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
    const workspaceContext = new WorkspaceContextImpl(
      cwd!,
      {
        rules: [],
        fix: false,
        verbose: false,
        silent: true,
      },
      new SimpleHost()
    );

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

  it("Flags banned dependencies correctly w legacy globs", async () => {
    const { addFile, checkAndSpy } = makeWorkspace();
    const rootPackageJson = jsonToString({
      dependencies: {
        aaa: "0.0.1",
        ccc: "0.0.1",
      },
    });
    addFile("./package.json", rootPackageJson);

    const { addErrorSpy: addErrorSpy1 } = checkAndSpy({ bannedDependencies: ["c*c"] });
    expect(addErrorSpy1).toHaveBeenCalledTimes(1);
    addErrorSpy1.mockReset();

    const { addErrorSpy: addErrorSpy2 } = checkAndSpy({ bannedDependencies: ["d*d"] });
    expect(addErrorSpy2).toHaveBeenCalledTimes(0);
    addErrorSpy2.mockReset();

    const { addErrorSpy: addErrorSpy3 } = checkAndSpy({ bannedDependencies: ["c*c", "d*d"] });
    expect(addErrorSpy3).toHaveBeenCalledTimes(1);
    addErrorSpy3.mockReset();
  });

  it("Flags banned dependencies correctly w new globs", async () => {
    const { addFile, checkAndSpy } = makeWorkspace();
    const rootPackageJson = jsonToString({
      dependencies: {
        aaa: "0.0.1",
        ccc: "0.0.1",
      },
    });
    addFile("./package.json", rootPackageJson);

    const { addErrorSpy: addErrorSpy1 } = checkAndSpy({ bannedDependencies: { glob: ["c*c"] } });
    expect(addErrorSpy1).toHaveBeenCalledTimes(1);
    addErrorSpy1.mockReset();

    const { addErrorSpy: addErrorSpy2 } = checkAndSpy({ bannedDependencies: { glob: ["d*d"] } });
    expect(addErrorSpy2).toHaveBeenCalledTimes(0);
    addErrorSpy2.mockReset();

    const { addErrorSpy: addErrorSpy3 } = checkAndSpy({ bannedDependencies: { glob: ["c*c", "d*d"] } });
    expect(addErrorSpy3).toHaveBeenCalledTimes(1);
    addErrorSpy3.mockReset();
  });

  it("Flags banned dependencies correctly w exact", async () => {
    const { addFile, checkAndSpy } = makeWorkspace();
    const rootPackageJson = jsonToString({
      dependencies: {
        aaa: "0.0.1",
        ccc: "0.0.1",
      },
    });
    addFile("./package.json", rootPackageJson);

    const { addErrorSpy: addErrorSpy1 } = checkAndSpy({ bannedDependencies: { exact: ["ccc"] } });
    expect(addErrorSpy1).toHaveBeenCalledTimes(1);
    addErrorSpy1.mockReset();

    const { addErrorSpy: addErrorSpy2 } = checkAndSpy({ bannedDependencies: { exact: ["ddd"] } });
    expect(addErrorSpy2).toHaveBeenCalledTimes(0);
    addErrorSpy2.mockReset();

    const { addErrorSpy: addErrorSpy3 } = checkAndSpy({ bannedDependencies: { exact: ["ccc", "ddd"] } });
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
    addFile("./node_modules/aaa/package.json", aaaPackageJson);
    const bbbPackageJson = jsonToString({
      dependencies: {
        ddd: "0.0.1",
      },
    });
    addFile("./node_modules/aaa/node_modules/bbb/package.json", bbbPackageJson);
    addFile("./node_modules/aaa/node_modules/bbb/node_modules/ddd/package.json", EMPTY_PACKAGE);
    addFile("./node_modules/aaa/node_modules/ccc/package.json", EMPTY_PACKAGE);

    expect(checkAndSpy({ bannedTransitiveDependencies: ["ccc", "ddd"] }).addErrorSpy).toHaveBeenCalledTimes(2);
  });
});
