/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { WorkspaceContext } from "@monorepolint/core";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import * as path from "path";
import * as tmp from "tmp";
import { consistentDependencies } from "../consistentDependencies";

function jsonToString(obj: {}) {
  return JSON.stringify(obj, undefined, 2) + "\n";
}

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
    const dir: tmp.DirResult = tmp.dirSync();
    cleanupJobs.push(() => dir.removeCallback());

    const workspaceContext = new WorkspaceContext(dir.name, {
      rules: [],
      fix,
      verbose: false,
    });

    function checkAndSpy(q: string) {
      const context = workspaceContext.createChildContext(path.resolve(dir.name, q));
      const addErrorSpy = jest.spyOn(context, "addError");
      consistentDependencies.check(context, undefined);
      return { context, addErrorSpy };
    }

    function addFile(filePath: string, content: string) {
      const dirPath = path.resolve(dir.name, path.dirname(filePath));
      const resolvedFilePath = path.resolve(dir.name, filePath);

      // node < 10 doesn't support mkdirSync w/ recursive: true
      // so we manually do it instead
      const dirSegments = dirPath.split(path.sep);
      for (let i = 2; i <= dirSegments.length; i++) {
        // we skip the empty segment
        const curDirPath = dirSegments.slice(0, i).join(path.sep);
        if (!existsSync(curDirPath)) {
          mkdirSync(curDirPath);
        }
      }

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
    addFile("./packages/star/package.json", PACKAGE_CHILD_WITH_STAR);
    addFile("./packages/right/package.json", PACKAGE_CHILD_WITH_RIGHT_VERSION);
    addFile("./packages/wrong/package.json", PACKAGE_CHILD_WITH_WRONG_VERSION);

    consistentDependencies.check(workspaceContext, undefined);

    const star = checkAndSpy("./packages/star");
    expect(star.addErrorSpy).toHaveBeenCalledTimes(0);

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
});
