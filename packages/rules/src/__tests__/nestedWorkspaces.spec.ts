/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { WorkspaceContext } from "@monorepolint/core";
import { writeFileSync } from "fs";
import * as path from "path";
import * as tmp from "tmp";
import { nestedWorkspaces } from "../nestedWorkspaces";
import { makeDirectoryRecursively } from "../util/makeDirectory";
import { jsonToString } from "./utils";

const EMPTY_PACKAGE = jsonToString({});

const PACKAGE_ROOT_WITH_PACKAGES_STAR = jsonToString({
  workspaces: {
    packages: ["packages/*"],
  },
});

const PACKAGE_ROOT_WITH_TWO_LEVEL = jsonToString({
  workspaces: {
    packages: ["packages/*", "packages/deep/*"],
  },
});

const PACKAGE_ROOT_WITH_THREE_LEVEL = jsonToString({
  workspaces: {
    packages: ["packages/*", "packages/deep/*", "packages/very/deep/*"],
  },
});

describe("nestedWorkspaces", () => {
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

    async function checkAndSpy() {
      const addErrorSpy = jest.spyOn(workspaceContext, "addError");

      await nestedWorkspaces.check(workspaceContext, undefined);
      return { addErrorSpy };
    }

    function addFile(filePath: string, content: string) {
      const dirPath = path.resolve(cwd!, path.dirname(filePath));
      const resolvedFilePath = path.resolve(cwd!, filePath);

      makeDirectoryRecursively(dirPath);
      writeFileSync(resolvedFilePath, content);
    }

    return { addFile, workspaceContext, checkAndSpy };
  }

  it("checks correctly when no packages", async () => {
    const { addFile, checkAndSpy } = makeWorkspace();
    addFile("./package.json", EMPTY_PACKAGE);

    expect((await checkAndSpy()).addErrorSpy).toHaveBeenCalledTimes(0);
  });

  it("checks correctly when one level packages", async () => {
    const { addFile, checkAndSpy } = makeWorkspace();
    addFile("./package.json", PACKAGE_ROOT_WITH_PACKAGES_STAR);
    addFile("./packages/star/package.json", EMPTY_PACKAGE);

    expect((await checkAndSpy()).addErrorSpy).toHaveBeenCalledTimes(0);
  });

  it("checks fail when one level packages with no workspaces field", async () => {
    const { addFile, checkAndSpy } = makeWorkspace();
    addFile("./package.json", EMPTY_PACKAGE);
    addFile("./packages/star/package.json", EMPTY_PACKAGE);

    expect((await checkAndSpy()).addErrorSpy).toHaveBeenCalledTimes(1);
  });

  it("checks correctly when two level packages with two level workspaces field", async () => {
    const { addFile, checkAndSpy } = makeWorkspace();
    addFile("./package.json", PACKAGE_ROOT_WITH_TWO_LEVEL);
    addFile("./packages/star/package.json", EMPTY_PACKAGE);
    addFile("./packages/deep/star/package.json", EMPTY_PACKAGE);

    expect((await checkAndSpy()).addErrorSpy).toHaveBeenCalledTimes(0);
  });

  it("checks fail when two level packages with one level workspaces field", async () => {
    const { addFile, checkAndSpy } = makeWorkspace();
    addFile("./package.json", PACKAGE_ROOT_WITH_PACKAGES_STAR);
    addFile("./packages/star/package.json", EMPTY_PACKAGE);
    addFile("./packages/deep/star/package.json", EMPTY_PACKAGE);

    expect((await checkAndSpy()).addErrorSpy).toHaveBeenCalledTimes(1);
  });

  it("checks correctly when three level packages with three level workspaces field", async () => {
    const { addFile, checkAndSpy } = makeWorkspace();
    addFile("./package.json", PACKAGE_ROOT_WITH_THREE_LEVEL);
    addFile("./packages/star/package.json", EMPTY_PACKAGE);
    addFile("./packages/deep/star/package.json", EMPTY_PACKAGE);
    addFile("./packages/very/deep/star/package.json", EMPTY_PACKAGE);

    expect((await checkAndSpy()).addErrorSpy).toHaveBeenCalledTimes(0);
  });
});
