/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { WorkspaceContext } from "@monorepolint/core";
import { PackageJson } from "@monorepolint/utils";
import { writeFileSync } from "fs";
import * as path from "path";
import * as tmp from "tmp";
import { ALLOWED_RANGE_REGEX, doesASatisfyB, mustSatisfyPeerDependencies } from "../mustSatisfyPeerDependencies";
import { makeDirectoryRecursively } from "../util/makeDirectory";
import { jsonToString } from "./utils";

describe("mustSatisfyPeerDependencies", () => {
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

    async function checkAndSpy(skipUnparseableRanges: boolean) {
      const addErrorSpy = jest.spyOn(workspaceContext, "addError");
      mustSatisfyPeerDependencies.check(workspaceContext, {
        skipUnparseableRanges,
      });
      return { addErrorSpy };
    }

    function addPackageJson(filePath: string, packageJson: PackageJson) {
      const dirPath = path.resolve(cwd!, path.dirname(filePath));
      const resolvedFilePath = path.resolve(cwd!, filePath);

      makeDirectoryRecursively(dirPath);
      writeFileSync(resolvedFilePath, jsonToString(packageJson));
      return resolvedFilePath;
    }

    return { addPackageJson, workspaceContext, checkAndSpy };
  }

  it("Properly matches allowed range regex", async () => {
    const passTests = [
      "15",
      "^15",
      "15.x",
      "^15.x",
      "15.2",
      "^15.2",
      "15.2.x",
      "^15.2.x",
      "15.x.x",
      "^15.x.x",
      "15 || 16",
      "^15 || 16",
      "15 || ^16",
      "^15 || ^16",
      "15.2 || 16",
      "^15.2 || 16",
      "15.2 || ^16",
      "15.x || 16",
      "^15.x || 16",
      "15.x || ^16",
      "^15.x || ^16",
      "15.2.x || 16.2",
      "^15.2.x || 16.2",
      "15.2.x || ^16.2",
      "^15.2.x || ^16.2",
      "15 || 16 || 17",
      "15 || ^16 || 17",
      "15 || 16 || 17.2.x",
      "15 || ^16 || 17.2.x",
      "15 || 16 || ^17.2.x",
      "15.2 || 16 || 17.2.x",
      "15.2 || ^16 || ^17.2.x",
      "^15.2 || ^16 || ^17.2.x",
    ];
    for (const passTest of passTests) {
      expect(ALLOWED_RANGE_REGEX.test(passTest)).toBeTruthy();
    }
    const failTests = [
      "x",
      "^x",
      "x.2",
      "^x.2",
      "^.2",
      "15.xx",
      "15^",
      "15.x.2",
      "15.x.2 || 16.2",
      "^15.x.2 || 16.2",
      "15.x.2 || ^16.2",
      "^15.x.2 || ^16.2",
      "15 || x",
      "15.x || x",
      "15 | 16",
      "15.x.16.x",
    ];
    for (const failTest of failTests) {
      expect(ALLOWED_RANGE_REGEX.test(failTest)).toBeFalsy();
    }
  });

  it("Determines dependencies satisfaction correctly", async () => {
    expect(doesASatisfyB("15", "15 || 16")).toBeTruthy();
    expect(doesASatisfyB("15", "^15 || 16")).toBeTruthy();
    expect(doesASatisfyB("15", "15 || ^16")).toBeTruthy();
    expect(doesASatisfyB("14", "15 || 16")).toBeFalsy();
    expect(doesASatisfyB("^15", "15 || 16")).toBeFalsy();
  });

  it("Flags conflicting peer dependencies", async () => {
    const { addPackageJson, checkAndSpy } = makeWorkspace();

    const rootPackageJson = {
      name: "root",
      dependencies: {
        aaa: "0.0.1",
        bbb: "0.0.1",
      },
      peerDependencies: {
        greatLib: "15 || 16",
      },
    };
    addPackageJson("./package.json", rootPackageJson);

    const aaaPackageJson = {
      name: "a",
      peerDependencies: {
        greatLib: "15 || 16",
      },
    };
    addPackageJson("./aaa/package.json", aaaPackageJson);
    const bbbPackageJson = {
      name: "b",
      peerDependencies: {
        greatLib: "^16",
      },
    };
    addPackageJson("./bbb/package.json", bbbPackageJson);

    const { addErrorSpy } = await checkAndSpy(false);
    expect(addErrorSpy).toHaveBeenCalledTimes(1);
    expect(addErrorSpy.mock.calls[0][0].message).toEqual(
      `[1] Package ${rootPackageJson.name} has conflicting inherited greatLib peer depdendencies.`
    );
    expect(addErrorSpy.mock.calls[0][0].longMessage).toEqual(
      `Dependency ${bbbPackageJson.name} requires ${bbbPackageJson.peerDependencies.greatLib} and dependency ${aaaPackageJson.name} requires ${aaaPackageJson.peerDependencies.greatLib}.`
    );
  });

  it("Flags missing peer dependencies", async () => {
    const { addPackageJson, checkAndSpy } = makeWorkspace();

    const rootPackageJson = {
      name: "root",
      dependencies: {
        aaa: "0.0.1",
        bbb: "0.0.1",
      },
    };
    addPackageJson("./package.json", rootPackageJson);

    const aaaPackageJson = {
      name: "a",
      peerDependencies: {
        greatLib: "15 || ^16",
      },
    };
    addPackageJson("./aaa/package.json", aaaPackageJson);
    const bbbPackageJson = {
      name: "b",
      peerDependencies: {
        greatLib: "^16",
      },
    };
    addPackageJson("./bbb/package.json", bbbPackageJson);

    const { addErrorSpy } = await checkAndSpy(false);
    expect(addErrorSpy).toHaveBeenCalledTimes(1);
    expect(addErrorSpy.mock.calls[0][0].message).toEqual(
      `[2] Package ${rootPackageJson.name} is missing greatLib peer dependency.`
    );
  });

  it("Flags unsatisfied peer dependencies", async () => {
    const { addPackageJson, checkAndSpy } = makeWorkspace();

    const rootPackageJson = {
      name: "root",
      dependencies: {
        aaa: "0.0.1",
        bbb: "0.0.1",
      },
      peerDependencies: {
        greatLib: "^15 || ^16",
      },
    };
    addPackageJson("./package.json", rootPackageJson);

    const aaaPackageJson = {
      name: "a",
      peerDependencies: {
        greatLib: "15 || ^16",
      },
    };
    addPackageJson("./aaa/package.json", aaaPackageJson);
    const bbbPackageJson = {
      name: "b",
      peerDependencies: {
        greatLib: "^16",
      },
    };
    addPackageJson("./bbb/package.json", bbbPackageJson);

    const { addErrorSpy } = await checkAndSpy(false);
    expect(addErrorSpy).toHaveBeenCalledTimes(1);
    expect(addErrorSpy.mock.calls[0][0].message).toEqual(
      `[3] Package ${rootPackageJson.name} peer dependency on greatLib is not strict enough.`
    );
  });
});
