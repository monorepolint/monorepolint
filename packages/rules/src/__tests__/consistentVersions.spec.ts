/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { WorkspaceContextImpl } from "@monorepolint/core";
import { Host, PackageJson, SimpleHost } from "@monorepolint/utils";
import * as path from "path";
import * as tmp from "tmp";
import { consistentVersions, Options } from "../consistentVersions.js";
import { makeDirectoryRecursively } from "../util/makeDirectory.js";
import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";

describe("consistentVersions", () => {
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

  function makeWorkspace(fix = false) {
    const host: Host = new SimpleHost();
    const workspaceContext = new WorkspaceContextImpl(
      cwd!,
      {
        rules: [],
        fix,
        verbose: false,
        silent: true,
      },
      host
    );
    const addErrorSpy = jest.spyOn(workspaceContext, "addError");

    function check(options: Options = { matchDependencyVersions: {} }) {
      consistentVersions({ options }).check(workspaceContext);
    }

    return { addErrorSpy, check, host };
  }

  function addPackageJson(host: Host, filePath: string, packageJson: PackageJson) {
    const dirPath = path.resolve(cwd!, path.dirname(filePath));
    const resolvedFilePath = path.resolve(cwd!, filePath);

    makeDirectoryRecursively(dirPath);
    host.writeJson(resolvedFilePath, packageJson);
    return (): PackageJson => {
      return host.readJson(resolvedFilePath);
    };
  }

  describe("standard tests", () => {
    let testPackageJson: PackageJson;

    beforeEach(() => {
      testPackageJson = {
        name: "test",
        dependencies: {
          greatLib: "^15",
          both: "1",
        },
        peerDependencies: {
          whatever: "15",
        },
        devDependencies: {
          else: "27.2.1",
          both: "1",
        },
      };
    });

    it("Does nothing when arguments are empty", async () => {
      const { addErrorSpy, check, host } = makeWorkspace();
      addPackageJson(host, "./package.json", testPackageJson);

      check();
      expect(addErrorSpy).toHaveBeenCalledTimes(0);
      check({ matchDependencyVersions: {} });
      expect(addErrorSpy).toHaveBeenCalledTimes(0);
    });

    it("Fixes packages that have an incorrect dependency version", async () => {
      const { addErrorSpy, check, host } = makeWorkspace(true);
      const readTestPackageJson = addPackageJson(host, "./package.json", testPackageJson);

      const requiredGreatLibVersion = "1.2.3";
      expect(addErrorSpy).toHaveBeenCalledTimes(0);
      check({
        matchDependencyVersions: { both: testPackageJson.dependencies!.both, greatLib: requiredGreatLibVersion },
      });
      expect(addErrorSpy).toHaveBeenCalledTimes(1);
      expect(readTestPackageJson().dependencies!.greatLib).toEqual(requiredGreatLibVersion);
    });

    it("Ignores packages that have a correct dependency version", async () => {
      const { addErrorSpy, check, host } = makeWorkspace();
      addPackageJson(host, "./package.json", testPackageJson);

      expect(addErrorSpy).toHaveBeenCalledTimes(0);
      check({
        matchDependencyVersions: {
          both: testPackageJson.dependencies!.both,
          greatLib: testPackageJson.dependencies!.greatLib,
        },
      });
      expect(addErrorSpy).toHaveBeenCalledTimes(0);
    });

    it("Fixes packages that have an incorrect devDependency version", async () => {
      const { addErrorSpy, check, host } = makeWorkspace(true);
      const readTestPackageJson = addPackageJson(host, "./package.json", testPackageJson);

      const requiredElseLibVersion = "1.2.3";
      expect(addErrorSpy).toHaveBeenCalledTimes(0);
      check({ matchDependencyVersions: { both: testPackageJson.dependencies!.both, else: requiredElseLibVersion } });
      expect(addErrorSpy).toHaveBeenCalledTimes(1);
      expect(readTestPackageJson().devDependencies!.else).toEqual(requiredElseLibVersion);
    });

    it("Ignores packages that have a correct devDependency version", async () => {
      const { addErrorSpy, check, host } = makeWorkspace();
      addPackageJson(host, "./package.json", testPackageJson);

      expect(addErrorSpy).toHaveBeenCalledTimes(0);
      check({
        matchDependencyVersions: {
          both: testPackageJson.dependencies!.both,
          greatLib: testPackageJson.dependencies!.greatLib,
        },
      });
      expect(addErrorSpy).toHaveBeenCalledTimes(0);
    });

    it("Fixes packages that have an incorrect dependency and devDependency versions", async () => {
      const { addErrorSpy, check, host } = makeWorkspace(true);
      const readTestPackageJson = addPackageJson(host, "./package.json", testPackageJson);

      const requiredBothVersion = "1.2.3";
      expect(addErrorSpy).toHaveBeenCalledTimes(0);
      check({ matchDependencyVersions: { both: requiredBothVersion } });
      expect(addErrorSpy).toHaveBeenCalledTimes(2);
      expect(readTestPackageJson().dependencies!.both).toEqual(requiredBothVersion);
      expect(readTestPackageJson().devDependencies!.both).toEqual(requiredBothVersion);
    });
  });

  describe("Multiple accepted versions tests", () => {
    let testPackageJson: PackageJson;

    beforeEach(() => {
      testPackageJson = {
        name: "test",
        dependencies: {
          greatLib: "^15",
          both: "1",
        },
        peerDependencies: {
          whatever: "15",
        },
        devDependencies: {
          else: "27.2.1",
          both: "1",
        },
      };
    });

    it("Accepts a match when multiple versions are configured", async () => {
      const { addErrorSpy, check, host } = makeWorkspace();
      addPackageJson(host, "./package.json", testPackageJson);

      expect(addErrorSpy).toHaveBeenCalledTimes(0);
      check({ matchDependencyVersions: { greatLib: [testPackageJson.dependencies!.greatLib] } });
      expect(addErrorSpy).toHaveBeenCalledTimes(0);
      check({ matchDependencyVersions: { greatLib: ["1", "2", testPackageJson.dependencies!.greatLib] } });
      expect(addErrorSpy).toHaveBeenCalledTimes(0);
      check({ matchDependencyVersions: { greatLib: ["1", "2", testPackageJson.dependencies!.greatLib, "99", "100"] } });
      expect(addErrorSpy).toHaveBeenCalledTimes(0);
      check({ matchDependencyVersions: { greatLib: [testPackageJson.dependencies!.greatLib, "99", "100"] } });
      expect(addErrorSpy).toHaveBeenCalledTimes(0);
    });

    it("Errors when version does not match", async () => {
      const { addErrorSpy, check, host } = makeWorkspace();
      addPackageJson(host, "./package.json", testPackageJson);

      expect(addErrorSpy).toHaveBeenCalledTimes(0);
      check({ matchDependencyVersions: { greatLib: ["1", "2"] } });
      expect(addErrorSpy).toHaveBeenCalledTimes(1);
      addErrorSpy.mockReset();

      expect(addErrorSpy).toHaveBeenCalledTimes(0);
      check({ matchDependencyVersions: { both: ["99", "100"] } });
      expect(addErrorSpy).toHaveBeenCalledTimes(2);
      expect(addErrorSpy.mock.calls[0][0].message).toEqual(
        `Expected dependency on both to match one of '["99","100"]', got '${
          testPackageJson.dependencies!.both
        }' instead.`
      );
      expect(addErrorSpy.mock.calls[1][0].message).toEqual(
        `Expected devDependency on both to match one of '["99","100"]', got '${
          testPackageJson.devDependencies!.both
        }' instead.`
      );
    });
  });
});
