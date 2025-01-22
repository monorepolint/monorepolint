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
import { afterEach, describe, expect, it, vi } from "vitest";
import { consistentDependencies, Options } from "../consistentDependencies.js";
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

const PACKAGE_CHILD_WITH_STAR = jsonToString({
  dependencies: {
    foo: "*",
  },
});

const PACKAGE_CHILD_WITH_LATEST = jsonToString({
  dependencies: {
    foo: "latest",
  },
});

const PACKAGE_CHILD_WITH_RIGHT_VERSION = jsonToString({
  dependencies: {
    foo: "5",
  },
});

const PACKAGE_CHILD_WITH_WRONG_VERSION = jsonToString({
  dependencies: {
    foo: "4",
  },
});

describe("consistentDependencies", () => {
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

    function checkAndSpy(q: string, opts?: Options) {
      const context = workspaceContext.createChildContext(
        path.resolve(dir.name, q),
      );
      const addErrorSpy = vi.spyOn(context, "addError");
      consistentDependencies({ options: opts }).check(context);
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
    addFile("./packages/star/package.json", PACKAGE_CHILD_WITH_STAR);
    addFile("./packages/latest/package.json", PACKAGE_CHILD_WITH_LATEST);
    addFile("./packages/right/package.json", PACKAGE_CHILD_WITH_RIGHT_VERSION);
    addFile("./packages/wrong/package.json", PACKAGE_CHILD_WITH_WRONG_VERSION);

    consistentDependencies({}).check(workspaceContext);

    const star = checkAndSpy("./packages/star");
    expect(star.addErrorSpy).toHaveBeenCalledTimes(0);

    const latest = checkAndSpy("./packages/latest");
    expect(latest.addErrorSpy).toHaveBeenCalledTimes(0);

    const right = checkAndSpy("./packages/right");
    expect(right.addErrorSpy).toHaveBeenCalledTimes(0);

    const wrong = checkAndSpy("./packages/wrong");
    expect(wrong.addErrorSpy).toHaveBeenCalledTimes(1);
  });

  it("fixes correctly", () => {
    const { addFile, readFile, checkAndSpy } = makeWorkspace({ fix: true });
    addFile("./package.json", PACKAGE_ROOT);
    addFile("./packages/wrong/package.json", PACKAGE_CHILD_WITH_WRONG_VERSION);

    const wrong = checkAndSpy("./packages/wrong");
    expect(wrong.addErrorSpy).toHaveBeenCalledTimes(1);

    const contents = readFile("./packages/wrong/package.json");
    expect(contents).toEqual(PACKAGE_CHILD_WITH_RIGHT_VERSION);
  });

  it("ignores ignored dependencies", () => {
    const { addFile, checkAndSpy } = makeWorkspace({ fix: false });
    addFile("./package.json", PACKAGE_ROOT);
    addFile("./packages/wrong/package.json", PACKAGE_CHILD_WITH_WRONG_VERSION);

    const ignored = checkAndSpy("./packages/wrong", {
      ignoredDependencies: ["foo"],
    });
    expect(ignored.addErrorSpy).toHaveBeenCalledTimes(0);
  });
});
