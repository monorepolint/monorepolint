/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { WorkspaceContextImpl } from "@monorepolint/core";
import { SimpleHost } from "@monorepolint/utils";
import { writeFileSync } from "fs";
import * as path from "path";
import * as tmp from "tmp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nestedWorkspaces } from "../nestedWorkspaces.js";
import { makeDirectoryRecursively } from "../util/makeDirectory.js";
import { jsonToString } from "./utils.js";

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
    const dir = tmp.dirSync({ unsafeCleanup: true });
    cleanupJobs.push(() => dir.removeCallback());
    cwd = dir.name;

    const spy = vi.spyOn(process, "cwd");
    spy.mockReturnValue(cwd);
  });

  afterEach(() => {
    for (const cleanupJob of cleanupJobs) {
      cleanupJob();
    }
    cleanupJobs = [];
  });

  function makeWorkspace() {
    const host = new SimpleHost();
    const workspaceContext = new WorkspaceContextImpl(
      cwd!,
      {
        rules: [],
        fix: false,
        verbose: false,
        silent: true,
      },
      host,
    );

    async function checkAndSpy() {
      const addErrorSpy = vi.spyOn(workspaceContext, "addError");

      await nestedWorkspaces({}).check(workspaceContext);
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
    const packageJsonPath = addFile("./package.json", EMPTY_PACKAGE);
    addFile("./packages/star/package.json", EMPTY_PACKAGE);

    const spy = (await checkAndSpy()).addErrorSpy;
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      file: packageJsonPath,
      message:
        "The \"workspace\" field is missing, even though there are workspaces in the repository.",
    });
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
    const packageJsonPath = addFile(
      "./package.json",
      PACKAGE_ROOT_WITH_PACKAGES_STAR,
    );
    addFile("./packages/star/package.json", EMPTY_PACKAGE);
    addFile("./packages/deep/star/package.json", EMPTY_PACKAGE);

    const spy = (await checkAndSpy()).addErrorSpy;
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      file: packageJsonPath,
      message: "The \"workspace\" field is missing one or more values: packages/deep/star. "
        + "You may be able to use a glob to avoid listing each workspace individually, e.g. \"packages/nested-workspace/*\".",
    });
  });

  it("checks correctly when three level packages with three level workspaces field", async () => {
    const { addFile, checkAndSpy } = makeWorkspace();
    addFile("./package.json", PACKAGE_ROOT_WITH_THREE_LEVEL);
    addFile("./packages/star/package.json", EMPTY_PACKAGE);
    addFile("./packages/deep/star/package.json", EMPTY_PACKAGE);
    addFile("./packages/very/deep/star/package.json", EMPTY_PACKAGE);

    expect((await checkAndSpy()).addErrorSpy).toHaveBeenCalledTimes(0);
  });

  describe("Options Validation", () => {
    it("should accept undefined options", () => {
      const ruleModule = nestedWorkspaces({ options: undefined });
      expect(() => ruleModule.validateOptions(undefined)).not.toThrow();
    });

    it("should reject non-undefined options", () => {
      const ruleModule = nestedWorkspaces({ options: undefined });
      expect(() => ruleModule.validateOptions({})).toThrow();
      expect(() => ruleModule.validateOptions("string")).toThrow();
      expect(() => ruleModule.validateOptions([])).toThrow();
    });
  });
});
