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
  doesASatisfyB as doesASatisfyBTyped,
  isValidRange,
  MATCH_ANY_VERSION_RANGE,
  MATCH_GREATER_OR_EQUAL_VERSION_RANGE,
  MATCH_MAJOR_VERSION_RANGE,
  mustSatisfyPeerDependencies,
  Options,
  RANGE_REGEX,
} from "../mustSatisfyPeerDependencies";
import { makeDirectoryRecursively } from "../util/makeDirectory";

const doesASatisfyB = (a: string, b: string) => {
  if (!isValidRange(a)) {
    throw new Error(`${a} is not a valid range.`);
  }
  if (!isValidRange(b)) {
    throw new Error(`${b} is not a valid range.`);
  }
  return doesASatisfyBTyped(a, b);
};

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

    function checkAndSpy(options: Options) {
      const addErrorSpy = jest.spyOn(workspaceContext, "addError");
      check(options);
      return { addErrorSpy };
    }

    function check(options: Options) {
      mustSatisfyPeerDependencies.check(workspaceContext, options);
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

    return { addPackageJson, workspaceContext, check, checkAndSpy };
  }

  describe("regex tests", () => {
    const anyVersionRangePassTests = ["*", "x"];
    const greaterOrEqualVersionRangePassTests = [
      ">=15",
      ">=15.2",
      ">=15.2.2",
      ">=15.2.2-0",
      ">=15.2.2-alpha",
      ">=15.2.2-alpha.1",
      ">=15.2.2-alpha.beta",
      ">=15.2.2-beta",
      ">=15.2.2-beta.2",
      ">=15.2.2-beta.11",
      ">=15.2.2-rc",
      ">=15.2.2-rc.1",
      ">=15.2.2-rc.1+001",
      ">=15.2.2+20130313144700",
      ">=15.2.2+20130313144700.sha",
      ">=15.2.2-rc.1+exp.sha.5114f85",
      ">=15.2.2+sha-1",
    ];
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
      "^15.2.2-0",
      "^15.2.2-alpha",
      "^15.2.2-alpha.1",
      "^15.2.2-alpha.beta",
      "^15.2.2-beta",
      "^15.2.2-beta.2",
      "^15.2.2-beta.11",
      "^15.2.2-rc",
      "^15.2.2-rc.1",
      "^15.2.2-rc.1+001",
      "^15.2.2+20130313144700",
      "^15.2.2+20130313144700.sha",
      "^15.2.2-rc.1+exp.sha.5114f85",
      "^15.2.2+sha-1",
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
      "15.x.2-0",
      "15.x.2+0",
      "15.x.2 || 16.2",
      "15.x.2 || 16.2-0",
      "15.x.2 || 16.2+0",
      "^15.x.2 || 16.2",
      "15.x.2 || ^16.2",
      "^15.x.2 || ^16.2",
      "15 || x",
      "15 || x+0",
      "15.x || x",
      "15 | 16",
      "15sha | 16",
      "15.alpha | 16",
      "15+rc | 16",
      "15.x.16.x",
      ">15",
      ">= 15",
      "^>=15",
      ">=^15",
      "^ >=15",
    ];

    it("Properly matches any version range regex", async () => {
      const passTests = [...anyVersionRangePassTests];
      for (const passTest of passTests) {
        expect(MATCH_ANY_VERSION_RANGE.test(passTest)).toBeTruthy();
      }
      const failTests = [
        ...greaterOrEqualVersionRangePassTests,
        ...majorVersionRangePassTests,
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

    it("Properly matches greator or equal version range regex", async () => {
      const passTests = [...greaterOrEqualVersionRangePassTests];
      for (const passTest of passTests) {
        expect(MATCH_GREATER_OR_EQUAL_VERSION_RANGE.test(passTest)).toBeTruthy();
      }
      const failTests = [
        ...anyVersionRangePassTests,
        ...majorVersionRangePassTests,
        ...failEverythingTests,
        ">=",
        ">=x",
        ">=4.x",
        ">=4.x.x",
        ">=4 || 5",
        ">=4 || *",
        "4.2.x",
        "4.2.2",
        "4.2.2-0",
        "4.2.2-rc",
        "4.2.2-rc.0",
        "4.2.2-alpha.beta",
        "4.2.2+sha",
      ];
      for (const failTest of failTests) {
        expect(MATCH_GREATER_OR_EQUAL_VERSION_RANGE.test(failTest)).toBeFalsy();
      }
    });

    it("Properly matches major version range regex", async () => {
      const passTests = [...majorVersionRangePassTests];
      for (const passTest of passTests) {
        expect(MATCH_MAJOR_VERSION_RANGE.test(passTest)).toBeTruthy();
      }
      const failTests = [
        ...anyVersionRangePassTests,
        ...greaterOrEqualVersionRangePassTests,
        ...failEverythingTests,
        "4.2.x",
        "4.2.2",
        "4.2.2-0",
        "4.2.2-rc",
        "4.2.2-rc.0",
        "4.2.2-alpha.beta",
        "4.2.2+sha",
      ];
      for (const failTest of failTests) {
        expect(MATCH_MAJOR_VERSION_RANGE.test(failTest)).toBeFalsy();
      }
    });

    it("Properly matches allowed range regex", async () => {
      const passTests = [
        ...anyVersionRangePassTests,
        ...greaterOrEqualVersionRangePassTests,
        ...majorVersionRangePassTests,
        "15.2",
        "15.2.3",
        "15.2.3-0",
        "15.2.3+0",
        "15.2.3-rc",
        "15.2.3-rc.0",
        "15.2.3+sha",
        "15.2.3+sha.1234.9999",
        "15.2.3-0+sha",
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
        "15.2.2 || 16 || 17.2.x",
        "15.2.2-0 || 16 || 17.2.x",
        "15.2.2-rc || 16 || 17.2.x",
        "15.2.2-rc.0 || 16 || 17.2.x",
        "15.2.2+sha || 16 || 17.2.x",
        "15.2.2-rc.0 || 16.6.6 || 17.2.x",
        "15.2.2-rc.0 || 16.6.6-0 || 17.2.x",
        "15.2.2-rc.0 || 16.6.6-rc || 17.2.x",
        "15.2.2-rc.0 || 16.6.6-rc.0 || 17.2.x",
        "15.2.2-rc.0 || 16.6.6+sha || 17.2.x",
        "15.2 || ^16 || ^17.2.x",
        "15.2.2 || ^16 || ^17.2.x",
        "15.2.2-0 || ^16 || ^17.2.x",
        "15.2.2-rc || ^16 || ^17.2.x",
        "15.2.2-rc.0 || ^16 || ^17.2.x",
        "15.2.2+sha || ^16 || ^17.2.x",
        "15.2.2-rc.0 || ^16.6.6 || ^17.2.x",
        "15.2.2-rc.0 || ^16.6.6-0 || ^17.2.x",
        "15.2.2-rc.0 || ^16.6.6-rc || ^17.2.x",
        "15.2.2-rc.0 || ^16.6.6-rc.0 || ^17.2.x",
        "15.2.2-rc.0 || ^16.6.6+sha || ^17.2.x",
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

    it("version satisfies a greator or equal version range", async () => {
      const version = "15.0.0";
      const range = ">=15";
      expect(doesASatisfyB(version, range)).toBeTruthy();
      expect(doesASatisfyB(range, version)).toBeFalsy();
      const equivalentRange1 = ">=15.0";
      expect(doesASatisfyB(version, equivalentRange1)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange1, version)).toBeFalsy();
      const equivalentRange2 = ">=15.0.0";
      expect(doesASatisfyB(version, equivalentRange2)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange2, version)).toBeFalsy();
    });

    it("higher version satisfies a greator or equal version range", async () => {
      const higherVersion = "15.0.2";
      const range = ">=15";
      expect(doesASatisfyB(higherVersion, range)).toBeTruthy();
      expect(doesASatisfyB(range, higherVersion)).toBeFalsy();
      const equivalentRange1 = ">=15.0";
      expect(doesASatisfyB(higherVersion, equivalentRange1)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange1, higherVersion)).toBeFalsy();
      const equivalentRange2 = ">=15.0.0";
      expect(doesASatisfyB(higherVersion, equivalentRange2)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange2, higherVersion)).toBeFalsy();
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

    it("greator or equal version range satisfies 'any' range", async () => {
      const range = ">=15";
      const anyRange = "*";
      expect(doesASatisfyB(range, anyRange)).toBeTruthy();
      expect(doesASatisfyB(anyRange, range)).toBeFalsy();
      const equivalentRange = "x";
      expect(doesASatisfyB(range, equivalentRange)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange, range)).toBeFalsy();
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

    it("union range satisfies 'any' range", async () => {
      const unionRange = "^15 || ^16";
      const anyRange = "*";
      expect(doesASatisfyB(unionRange, anyRange)).toBeTruthy();
      expect(doesASatisfyB(anyRange, unionRange)).toBeFalsy();
      const equivalentRange = "x";
      expect(doesASatisfyB(unionRange, equivalentRange)).toBeTruthy();
      expect(doesASatisfyB(equivalentRange, unionRange)).toBeFalsy();
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

    it("union satisfies greator or equal version range", async () => {
      const rangeVersionUnion = "^15 || 16.0.0";
      const range = ">=15";
      expect(doesASatisfyB(rangeVersionUnion, range)).toBeTruthy();
      expect(doesASatisfyB(range, rangeVersionUnion)).toBeFalsy();
      const rangeRangeUnion = "^15 || ^16";
      expect(doesASatisfyB(rangeRangeUnion, range)).toBeTruthy();
      expect(doesASatisfyB(range, rangeRangeUnion)).toBeFalsy();
    });

    it("greator or equal version range satisfies greator or equal version range", async () => {
      const range = ">=15";
      expect(doesASatisfyB(range, range)).toBeTruthy();
      const stricterRange = ">=16";
      expect(doesASatisfyB(stricterRange, range)).toBeTruthy();
      expect(doesASatisfyB(range, stricterRange)).toBeFalsy();
    });

    it("equivalent greator or equal version ranges satisfy each other", async () => {
      const rangeA = ">=15";
      const rangeB = ">=15.0";
      const rangeC = ">=15.0.0";
      expect(doesASatisfyB(rangeA, rangeB)).toBeTruthy();
      expect(doesASatisfyB(rangeB, rangeA)).toBeTruthy();
      expect(doesASatisfyB(rangeA, rangeC)).toBeTruthy();
      expect(doesASatisfyB(rangeC, rangeA)).toBeTruthy();

      expect(doesASatisfyB(rangeB, rangeC)).toBeTruthy();
      expect(doesASatisfyB(rangeC, rangeB)).toBeTruthy();
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

    const { addErrorSpy } = checkAndSpy({});
    expect(addErrorSpy).toHaveBeenCalledTimes(1);
    expect(addErrorSpy.mock.calls[0][0].message).toEqual(
      `[0] Package ${testPackageJson.name} has overloaded greatLib dependencies.\n\t` +
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

    const { addErrorSpy } = checkAndSpy({});
    expect(addErrorSpy).toHaveBeenCalledTimes(1);
    expect(addErrorSpy.mock.calls[0][0].message).toEqual(
      `[1] Package ${testPackageJson.name} has conflicting inherited greatLib peer dependencies.\n\t` +
        `Dependency ${bbbPackageJson.name} requires '${bbbPackageJson.peerDependencies.greatLib}' but dependency ${aaaPackageJson.name} requires '${aaaPackageJson.peerDependencies.greatLib}'.`
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

    const { addErrorSpy } = checkAndSpy({});
    expect(addErrorSpy).toHaveBeenCalledTimes(1);
    expect(addErrorSpy.mock.calls[0][0].message).toEqual(
      `[2] Package ${testPackageJson.name} dependency on greatLib '${testPackageJson.dependencies.greatLib}' does not satisfy inherited peer dependencies.\n\t` +
        `Dependency ${bbbPackageJson.name} requires '${bbbPackageJson.peerDependencies.greatLib}' or stricter.`
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

    const { addErrorSpy } = checkAndSpy({});
    expect(addErrorSpy).toHaveBeenCalledTimes(1);
    expect(addErrorSpy.mock.calls[0][0].message).toEqual(
      `[3] Package ${testPackageJson.name} is missing required greatLib dependency.\n\t` +
        `Dependency ${bbbPackageJson.name} requires '${bbbPackageJson.peerDependencies.greatLib}' or stricter.`
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

    const { addErrorSpy } = checkAndSpy({});
    expect(addErrorSpy).toHaveBeenCalledTimes(1);
    expect(addErrorSpy.mock.calls[0][0].message).toEqual(
      `[4] Package ${testPackageJson.name} peer dependency on greatLib '${testPackageJson.peerDependencies.greatLib}' is not strict enough.\n\t` +
        `Dependency ${bbbPackageJson.name} requires '${bbbPackageJson.peerDependencies.greatLib}' or stricter.`
    );
    expect(readTestPackageJson().peerDependencies!.greatLib).toEqual(bbbPackageJson.peerDependencies.greatLib);
  });

  it("Honors dependencyWhitelist", async () => {
    const { addPackageJson, check, checkAndSpy } = makeWorkspace();

    const testPackageJson = {
      name: "test",
      dependencies: {
        aaa: "0.0.1",
        bbb: "0.0.1",
        greatLib: "^15",
      },
      peerDependencies: {
        startHere: "15",
        greatLib: "15",
      },
    };
    addPackageJson("./package.json", testPackageJson);

    const startHerePackageJson = {
      name: "startHere",
    };
    addPackageJson("./startHere/package.json", startHerePackageJson);
    const greatLibPackageJson = {
      name: "greatLib",
    };
    addPackageJson("./greatLib/package.json", greatLibPackageJson);
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

    const { addErrorSpy } = checkAndSpy({ dependencyWhitelist: ["startHere"] });
    expect(addErrorSpy).toHaveBeenCalledTimes(0);
    check({ dependencyWhitelist: ["startHere", "greatLib"] });
    expect(addErrorSpy).toHaveBeenCalledTimes(2);
  });

  it("Honors dependencyBlacklist", async () => {
    const { addPackageJson, check, checkAndSpy } = makeWorkspace();

    const testPackageJson = {
      name: "test",
      dependencies: {
        aaa: "0.0.1",
        bbb: "0.0.1",
        greatLib: "^15",
      },
      peerDependencies: {
        startHere: "15",
        greatLib: "15",
      },
    };
    addPackageJson("./package.json", testPackageJson);

    const startHerePackageJson = {
      name: "startHere",
    };
    addPackageJson("./startHere/package.json", startHerePackageJson);
    const greatLibPackageJson = {
      name: "greatLib",
    };
    addPackageJson("./greatLib/package.json", greatLibPackageJson);
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

    const { addErrorSpy } = checkAndSpy({ dependencyBlacklist: ["greatLib"] });
    expect(addErrorSpy).toHaveBeenCalledTimes(0);
    addErrorSpy.mockReset();

    check({ dependencyBlacklist: ["greatLib"], dependencyWhitelist: ["greatLib"] });
    expect(addErrorSpy).toHaveBeenCalledTimes(0);
    addErrorSpy.mockReset();

    check({});
    expect(addErrorSpy).toHaveBeenCalledTimes(2);
    addErrorSpy.mockReset();
  });
});
