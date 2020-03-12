/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { WorkspaceContext } from "@monorepolint/core";
import { stringify } from "@yarnpkg/lockfile";
import { writeFileSync } from "fs";
import * as path from "path";
import * as tmp from "tmp";
import { bannedTransitiveDependencies } from "../bannedTransitiveDependencies";
import { makeDirectoryRecursively } from "../util/makeDirectory";
import { jsonToString } from "./utils";

const EMPTY_PACKAGE = jsonToString({});

describe("bannedTransitiveDependencies", () => {
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

    async function checkAndSpy(bannedDependencies: string[]) {
      const addErrorSpy = jest.spyOn(workspaceContext, "addError");
      bannedTransitiveDependencies.check(workspaceContext, {
        bannedTransitiveDependencies: bannedDependencies,
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

  it("Flags banned packages correctly", async () => {
    const { addFile, checkAndSpy } = makeWorkspace();
    addFile("./package.json", EMPTY_PACKAGE);
    addFile(
      "./yarn.lock",
      stringify({
        aaa: {
          version: "0.0.1",
          resolved: "aaa",
          dependencies: [],
        },
        bbb: {
          version: "0.0.1",
          resolved: "bbb",
          dependencies: [],
        },
        ccc: {
          version: "0.0.1",
          resolved: "ccc",
          dependencies: ["aaa"],
        },
      })
    );

    expect((await checkAndSpy(["aaa", "bbb"])).addErrorSpy).toHaveBeenCalledTimes(2);
  });
});
