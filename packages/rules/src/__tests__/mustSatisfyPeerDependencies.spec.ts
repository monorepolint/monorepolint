/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { WorkspaceContext } from "@monorepolint/core";
import { PackageJson, readJson, writeJson } from "@monorepolint/utils";
import * as path from "path";
import * as tmp from "tmp";
import {
  doesASatisfyB,
  MATCH_ANY_VERSION_RANGE,
  MATCH_MAJOR_VERSION_RANGE,
  mustSatisfyPeerDependencies,
  RANGE_REGEX,
} from "../mustSatisfyPeerDependencies";
import { makeDirectoryRecursively } from "../util/makeDirectory";

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

  function makeWorkspace(fix = false) {
    const workspaceContext = new WorkspaceContext(cwd!, {
      rules: [],
      fix,
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
      writeJson(resolvedFilePath, packageJson);
      return getPackageJsonReader(resolvedFilePath);
    }

    function getPackageJsonReader(resolvedFilePath: string) {
      return (): PackageJson => {
        return readJson(resolvedFilePath);
      };
    }

    return { addPackageJson, workspaceContext, checkAndSpy };
  }

  describe("regex tests", () => {
    const anyVersionRangePassTests = ["*", "x"];
    const majorVersionRangePassTests = [
      "15",
      "^15",
      "15.x",
      "^15.x",
      "15.x.x",
      "^15.x.x",
      "^15.2",
      "^15.2.x",
      "^15.2.2",
    ];
    const failEverythingTests = [
      "",
      ".",
      "xx",
      "x.x",
      "^x",
      "*x",
      "x.*",
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

    it("Properly matches any version range regex", async () => {
      const passTests = [...anyVersionRangePassTests];
      for (const passTest of passTests) {
        expect(MATCH_ANY_VERSION_RANGE.test(passTest)).toBeTruthy();
      }
      const failTests = [
        ...failEverythingTests,
        "* || x",
        "* || *",
        "x || x",
        "x || 4",
        "4",
        "4.2",
        "^4",
        "^4.2",
        "4.x",
        "^4.x",
        "4.2.x",
        "^4.2.x",
      ];
      for (const failTest of failTests) {
        expect(MATCH_ANY_VERSION_RANGE.test(failTest)).toBeFalsy();
      }
    });

    it("Properly matches major version range regex", async () => {
      const passTests = [...majorVersionRangePassTests];
      for (const passTest of passTests) {
        expect(MATCH_MAJOR_VERSION_RANGE.test(passTest)).toBeTruthy();
      }
      const failTests = [...failEverythingTests, "4.2.x", "4.2.2"];
      for (const failTest of failTests) {
        expect(MATCH_MAJOR_VERSION_RANGE.test(failTest)).toBeFalsy();
      }
    });

    it("Properly matches allowed range regex", async () => {
      const passTests = [
        ...anyVersionRangePassTests,
        ...majorVersionRangePassTests,
        "15.2",
        "15.2.x",
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
        expect(RANGE_REGEX.test(passTest)).toBeTruthy();
      }
      const failTests = [...failEverythingTests];
      for (const failTest of failTests) {
        expect(RANGE_REGEX.test(failTest)).toBeFalsy();
      }
    });
  });

  describe("Determines dependencies satisfaction correctly", () => {
    it("version is version", async () => {
      const version = "15.0.0";
      expect(doesASatisfyB(version, version)).toBeTruthy();
    });

    it("version satisfies a range", async () => {
      const version = "15.0.0";
      const range = "15";
      expect(doesASatisfyB(version, range)).toBeTruthy();
      expect(doesASatisfyB(range, version)).toBeFalsy();
      const equivalentRange1 = "^15";
      expect(doesASatisfyB(version, equivalentRange1)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange1, version)).toBeFalsy();
      const equivalentRange2 = "^15.0.0";
      expect(doesASatisfyB(version, equivalentRange2)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange2, version)).toBeFalsy();
      const equivalentRange3 = "15.x";
      expect(doesASatisfyB(version, equivalentRange3)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange3, version)).toBeFalsy();
      const equivalentRange4 = "^15.x";
      expect(doesASatisfyB(version, equivalentRange4)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange4, version)).toBeFalsy();
      const equivalentRange5 = "15.x.x";
      expect(doesASatisfyB(version, equivalentRange5)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange5, version)).toBeFalsy();
      const equivalentRange6 = "^15.x.x";
      expect(doesASatisfyB(version, equivalentRange6)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange6, version)).toBeFalsy();
    });

    it("higher version satisfies a range", async () => {
      const higherVersion = "15.0.2";
      const range = "15";
      expect(doesASatisfyB(higherVersion, range)).toBeTruthy();
      expect(doesASatisfyB(range, higherVersion)).toBeFalsy();
      const equivalentRange1 = "^15";
      expect(doesASatisfyB(higherVersion, equivalentRange1)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange1, higherVersion)).toBeFalsy();
      const equivalentRange2 = "^15.0.0";
      expect(doesASatisfyB(higherVersion, equivalentRange2)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange2, higherVersion)).toBeFalsy();
      const equivalentRange3 = "15.x";
      expect(doesASatisfyB(higherVersion, equivalentRange3)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange3, higherVersion)).toBeFalsy();
      const equivalentRange4 = "^15.x";
      expect(doesASatisfyB(higherVersion, equivalentRange4)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange4, higherVersion)).toBeFalsy();
      const equivalentRange5 = "15.x.x";
      expect(doesASatisfyB(higherVersion, equivalentRange5)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange5, higherVersion)).toBeFalsy();
      const equivalentRange6 = "^15.x.x";
      expect(doesASatisfyB(higherVersion, equivalentRange6)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange6, higherVersion)).toBeFalsy();
    });

    it("version satisfies 'any' range", async () => {
      const version = "15.0.0";
      const anyRange = "*";
      expect(doesASatisfyB(version, anyRange)).toBeTruthy();
      expect(doesASatisfyB(anyRange, version)).toBeFalsy();
      const equivalentRange = "x";
      expect(doesASatisfyB(version, equivalentRange)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange, version)).toBeFalsy();
    });

    it("range satisfies 'any' range", async () => {
      const range = "^15";
      const anyRange = "*";
      expect(doesASatisfyB(range, anyRange)).toBeTruthy();
      expect(doesASatisfyB(anyRange, range)).toBeFalsy();
      const equivalentRange = "x";
      expect(doesASatisfyB(range, equivalentRange)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange, range)).toBeFalsy();
    });

    it("version found in union start", async () => {
      const version = "15.0.0";
      const versionVersionUnion = "15.0.0 || 16.0.0";
      expect(doesASatisfyB(version, versionVersionUnion)).toBeTruthy();
      expect(doesASatisfyB(versionVersionUnion, version)).toBeFalsy();
      const versionRangeUnion = "15.0.0 || ^16";
      expect(doesASatisfyB(version, versionRangeUnion)).toBeTruthy();
      expect(doesASatisfyB(versionRangeUnion, version)).toBeFalsy();
    });

    it("version found in union end", async () => {
      const version = "15.0.0";
      const versionVersionUnion = "14.0.0 || 15.0.0";
      expect(doesASatisfyB(version, versionVersionUnion)).toBeTruthy();
      expect(doesASatisfyB(versionVersionUnion, version)).toBeFalsy();
      const rangeVersionUnion = "^14 || 15.0.0";
      expect(doesASatisfyB(version, rangeVersionUnion)).toBeTruthy();
      expect(doesASatisfyB(rangeVersionUnion, version)).toBeFalsy();
    });

    it("version satisfies a range in union start", async () => {
      const version = "15.0.0";
      const rangeVersionUnion = "^15 || 16.0.0";
      expect(doesASatisfyB(version, rangeVersionUnion)).toBeTruthy();
      expect(doesASatisfyB(rangeVersionUnion, version)).toBeFalsy();
      const rangeRangeUnion = "^15 || ^16";
      expect(doesASatisfyB(version, rangeRangeUnion)).toBeTruthy();
      expect(doesASatisfyB(rangeRangeUnion, version)).toBeFalsy();
    });

    it("version satisfies a range in union end", async () => {
      const version = "15.0.0";
      const versionRangeUnion = "14.0.0 || ^15";
      expect(doesASatisfyB(version, versionRangeUnion)).toBeTruthy();
      expect(doesASatisfyB(versionRangeUnion, version)).toBeFalsy();
      const rangeRangeUnion = "^14 || ^15";
      expect(doesASatisfyB(version, rangeRangeUnion)).toBeTruthy();
      expect(doesASatisfyB(rangeRangeUnion, version)).toBeFalsy();
    });

    it("higher version satisfies a range in union start", async () => {
      const higherVersion = "15.0.2";
      const rangeVersionUnion = "^15 || 16.0.0";
      expect(doesASatisfyB(higherVersion, rangeVersionUnion)).toBeTruthy();
      expect(doesASatisfyB(rangeVersionUnion, higherVersion)).toBeFalsy();
      const rangeRangeUnion = "^15 || ^16";
      expect(doesASatisfyB(higherVersion, rangeRangeUnion)).toBeTruthy();
      expect(doesASatisfyB(rangeRangeUnion, higherVersion)).toBeFalsy();
    });

    it("higher version satisfies a range in union end", async () => {
      const higherVersion = "15.0.2";
      const versionRangeUnion = "14.0.0 || ^15";
      expect(doesASatisfyB(higherVersion, versionRangeUnion)).toBeTruthy();
      expect(doesASatisfyB(versionRangeUnion, higherVersion)).toBeFalsy();
      const rangeRangeUnion = "^14 || ^15";
      expect(doesASatisfyB(higherVersion, rangeRangeUnion)).toBeTruthy();
      expect(doesASatisfyB(rangeRangeUnion, higherVersion)).toBeFalsy();
    });

    it("range found in union start", async () => {
      const range = "^15";
      const rangeVersionUnion = "^15 || 16.0.0";
      expect(doesASatisfyB(range, rangeVersionUnion)).toBeTruthy();
      expect(doesASatisfyB(rangeVersionUnion, range)).toBeFalsy();
      const rangeRangeUnion = "^15 || ^16";
      expect(doesASatisfyB(range, rangeRangeUnion)).toBeTruthy();
      expect(doesASatisfyB(rangeRangeUnion, range)).toBeFalsy();
    });

    it("range found in union end", async () => {
      const range = "^15";
      const versionRangeUnion = "14.0.0 || ^15";
      expect(doesASatisfyB(range, versionRangeUnion)).toBeTruthy();
      expect(doesASatisfyB(versionRangeUnion, range)).toBeFalsy();
      const rangeRangeUnion = "^14 || ^15";
      expect(doesASatisfyB(range, rangeRangeUnion)).toBeTruthy();
      expect(doesASatisfyB(rangeRangeUnion, range)).toBeFalsy();
    });

    it("higher range satisfies a range in union start", async () => {
      const higherRange = "^15.2";
      const rangeVersionUnion = "^15 || 16.0.0";
      expect(doesASatisfyB(higherRange, rangeVersionUnion)).toBeTruthy();
      expect(doesASatisfyB(rangeVersionUnion, higherRange)).toBeFalsy();
      const rangeRangeUnion = "^15 || ^16";
      expect(doesASatisfyB(higherRange, rangeRangeUnion)).toBeTruthy();
      expect(doesASatisfyB(rangeRangeUnion, higherRange)).toBeFalsy();
    });

    it("higher range satisfies a range in union end", async () => {
      const higherRange = "^15.2";
      const versionRangeUnion = "14.0.0 || ^15";
      expect(doesASatisfyB(higherRange, versionRangeUnion)).toBeTruthy();
      expect(doesASatisfyB(versionRangeUnion, higherRange)).toBeFalsy();
      const rangeRangeUnion = "^14 || ^15";
      expect(doesASatisfyB(higherRange, rangeRangeUnion)).toBeTruthy();
      expect(doesASatisfyB(rangeRangeUnion, higherRange)).toBeFalsy();
    });

    it("equivalent 'any' ranges satisfy each other", async () => {
      const rangeA = "*";
      const rangeB = "x";
      expect(doesASatisfyB(rangeA, rangeB)).toBeTruthy();
      expect(doesASatisfyB(rangeB, rangeA)).toBeTruthy();
    });

    it("equivalent major ranges satisfy each other", async () => {
      const rangeA = "15";
      const rangeB = "^15";
      const rangeC = "^15.0.0";
      const rangeD = "15.x";
      const rangeE = "^15.x";
      const rangeF = "15.x.x";
      const rangeG = "^15.x.x";
      expect(doesASatisfyB(rangeA, rangeB)).toBeTruthy();
      expect(doesASatisfyB(rangeB, rangeA)).toBeTruthy();
      expect(doesASatisfyB(rangeA, rangeC)).toBeTruthy();
      expect(doesASatisfyB(rangeC, rangeA)).toBeTruthy();
      expect(doesASatisfyB(rangeA, rangeD)).toBeTruthy();
      expect(doesASatisfyB(rangeD, rangeA)).toBeTruthy();
      expect(doesASatisfyB(rangeA, rangeE)).toBeTruthy();
      expect(doesASatisfyB(rangeE, rangeA)).toBeTruthy();
      expect(doesASatisfyB(rangeA, rangeF)).toBeTruthy();
      expect(doesASatisfyB(rangeF, rangeA)).toBeTruthy();
      expect(doesASatisfyB(rangeA, rangeG)).toBeTruthy();
      expect(doesASatisfyB(rangeG, rangeA)).toBeTruthy();

      expect(doesASatisfyB(rangeB, rangeC)).toBeTruthy();
      expect(doesASatisfyB(rangeC, rangeB)).toBeTruthy();
      expect(doesASatisfyB(rangeB, rangeD)).toBeTruthy();
      expect(doesASatisfyB(rangeD, rangeB)).toBeTruthy();
      expect(doesASatisfyB(rangeB, rangeE)).toBeTruthy();
      expect(doesASatisfyB(rangeE, rangeB)).toBeTruthy();
      expect(doesASatisfyB(rangeB, rangeF)).toBeTruthy();
      expect(doesASatisfyB(rangeF, rangeB)).toBeTruthy();
      expect(doesASatisfyB(rangeB, rangeG)).toBeTruthy();
      expect(doesASatisfyB(rangeG, rangeB)).toBeTruthy();

      expect(doesASatisfyB(rangeC, rangeD)).toBeTruthy();
      expect(doesASatisfyB(rangeD, rangeC)).toBeTruthy();
      expect(doesASatisfyB(rangeC, rangeE)).toBeTruthy();
      expect(doesASatisfyB(rangeE, rangeC)).toBeTruthy();
      expect(doesASatisfyB(rangeC, rangeF)).toBeTruthy();
      expect(doesASatisfyB(rangeF, rangeC)).toBeTruthy();
      expect(doesASatisfyB(rangeC, rangeG)).toBeTruthy();
      expect(doesASatisfyB(rangeG, rangeC)).toBeTruthy();

      expect(doesASatisfyB(rangeD, rangeE)).toBeTruthy();
      expect(doesASatisfyB(rangeE, rangeD)).toBeTruthy();
      expect(doesASatisfyB(rangeD, rangeF)).toBeTruthy();
      expect(doesASatisfyB(rangeF, rangeD)).toBeTruthy();
      expect(doesASatisfyB(rangeD, rangeG)).toBeTruthy();
      expect(doesASatisfyB(rangeG, rangeD)).toBeTruthy();

      expect(doesASatisfyB(rangeE, rangeF)).toBeTruthy();
      expect(doesASatisfyB(rangeF, rangeE)).toBeTruthy();
      expect(doesASatisfyB(rangeE, rangeG)).toBeTruthy();
      expect(doesASatisfyB(rangeG, rangeE)).toBeTruthy();

      expect(doesASatisfyB(rangeF, rangeG)).toBeTruthy();
      expect(doesASatisfyB(rangeG, rangeF)).toBeTruthy();
    });

    it("version missing in union", async () => {
      const version = "14";
      const versionVersionUnion = "15 || 16";
      expect(doesASatisfyB(version, versionVersionUnion)).toBeFalsy();
      expect(doesASatisfyB(versionVersionUnion, version)).toBeFalsy();
    });

    it("range missing in union", async () => {
      const range = "^14";
      const versionVersionUnion = "15 || 16";
      expect(doesASatisfyB(range, versionVersionUnion)).toBeFalsy();
      expect(doesASatisfyB(versionVersionUnion, range)).toBeFalsy();
      const versionRangeUnion = "15 || ^16";
      expect(doesASatisfyB(range, versionRangeUnion)).toBeFalsy();
      expect(doesASatisfyB(versionRangeUnion, range)).toBeFalsy();
      const rangeRangeUnion = "^15 || ^16";
      expect(doesASatisfyB(range, rangeRangeUnion)).toBeFalsy();
      expect(doesASatisfyB(rangeRangeUnion, range)).toBeFalsy();
    });
  });

  it("Flags overloaded dependency (entry in regular dependencies and peer dependencies)", async () => {
    const { addPackageJson, checkAndSpy } = makeWorkspace();

    const testPackageJson = {
      name: "test",
      dependencies: {
        greatLib: "^15",
      },
      peerDependencies: {
        greatLib: "15",
      },
    };
    addPackageJson("./package.json", testPackageJson);

    const greatLibPackageJson = {
      name: "greatLib",
    };
    addPackageJson("./greatLib/package.json", greatLibPackageJson);

    const { addErrorSpy } = await checkAndSpy(false);
    expect(addErrorSpy).toHaveBeenCalledTimes(1);
    expect(addErrorSpy.mock.calls[0][0].message).toEqual(
      `[0] Package ${testPackageJson.name} has overloaded greatLib dependencies.`
    );
    expect(addErrorSpy.mock.calls[0][0].longMessage).toEqual(
      `Peer dependency '${testPackageJson.peerDependencies.greatLib}' and regular dependency '${testPackageJson.dependencies.greatLib}'.`
    );
  });

  it("Flags conflicting peer dependencies", async () => {
    const { addPackageJson, checkAndSpy } = makeWorkspace();

    const testPackageJson = {
      name: "test",
      dependencies: {
        aaa: "0.0.1",
        bbb: "0.0.1",
      },
      peerDependencies: {
        greatLib: "15",
      },
    };
    addPackageJson("./package.json", testPackageJson);

    const aaaPackageJson = {
      name: "a",
      peerDependencies: {
        greatLib: "15",
      },
    };
    addPackageJson("./aaa/package.json", aaaPackageJson);
    const bbbPackageJson = {
      name: "b",
      peerDependencies: {
        greatLib: "16",
      },
    };
    addPackageJson("./bbb/package.json", bbbPackageJson);

    const { addErrorSpy } = await checkAndSpy(false);
    expect(addErrorSpy).toHaveBeenCalledTimes(1);
    expect(addErrorSpy.mock.calls[0][0].message).toEqual(
      `[1] Package ${testPackageJson.name} has conflicting inherited greatLib peer dependencies.`
    );
    expect(addErrorSpy.mock.calls[0][0].longMessage).toEqual(
      `Dependency ${bbbPackageJson.name} requires ${bbbPackageJson.peerDependencies.greatLib} and dependency ${aaaPackageJson.name} requires ${aaaPackageJson.peerDependencies.greatLib}.`
    );
  });

  it("Flags unsatisfied peer dependencies (test package has regular dep)", async () => {
    const { addPackageJson, checkAndSpy } = makeWorkspace();

    const testPackageJson = {
      name: "test",
      dependencies: {
        aaa: "0.0.1",
        bbb: "0.0.1",
        greatLib: "^15",
      },
    };
    addPackageJson("./package.json", testPackageJson);

    const greatLibPackageJson = {
      name: "greatLib",
    };
    addPackageJson("./greatLib/package.json", greatLibPackageJson);
    const aaaPackageJson = {
      name: "a",
      peerDependencies: {
        greatLib: "^15.2 || ^16",
      },
    };
    addPackageJson("./aaa/package.json", aaaPackageJson);
    const bbbPackageJson = {
      name: "b",
      peerDependencies: {
        greatLib: "^15.2.3 || ^16",
      },
    };
    addPackageJson("./bbb/package.json", bbbPackageJson);

    const { addErrorSpy } = await checkAndSpy(false);
    expect(addErrorSpy).toHaveBeenCalledTimes(1);
    expect(addErrorSpy.mock.calls[0][0].message).toEqual(
      `[2] Package ${testPackageJson.name} dependency on greatLib does not satisfy inherited peer dependencies.`
    );
    expect(addErrorSpy.mock.calls[0][0].longMessage).toEqual(
      `Dependency ${bbbPackageJson.name} requires ${bbbPackageJson.peerDependencies.greatLib} or stricter.`
    );
  });

  it("Flags missing peer dependencies (NO regular dependency present)", async () => {
    const { addPackageJson, checkAndSpy } = makeWorkspace(true);

    const testPackageJson = {
      name: "test",
      dependencies: {
        aaa: "0.0.1",
        bbb: "0.0.1",
      },
    };
    const readTestPackageJson = addPackageJson("./package.json", testPackageJson);

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
      `[3] Package ${testPackageJson.name} is missing required greatLib dependency.`
    );
    expect(readTestPackageJson().peerDependencies!.greatLib).toEqual(bbbPackageJson.peerDependencies.greatLib);
  });

  it("Flags unsatisfied peer dependencies (test package has peer dep)", async () => {
    const { addPackageJson, checkAndSpy } = makeWorkspace(true);

    const testPackageJson = {
      name: "test",
      dependencies: {
        aaa: "0.0.1",
        bbb: "0.0.1",
      },
      peerDependencies: {
        greatLib: "^15 || ^16",
      },
    };
    const readTestPackageJson = addPackageJson("./package.json", testPackageJson);

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
      `[4] Package ${testPackageJson.name} peer dependency on greatLib is not strict enough.`
    );
    expect(readTestPackageJson().peerDependencies!.greatLib).toEqual(bbbPackageJson.peerDependencies.greatLib);
  });
});
