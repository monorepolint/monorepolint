/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// tslint:disable:no-console
import { createMockFiles, jsonToString } from "./utils";

// done first since this also mocks 'fs'
const mockFiles: Map<string, string> = createMockFiles();

import { Failure, PackageContext } from "@monorepolint/core";
import { NormalFileSystem } from "@monorepolint/utils";
import { alphabeticalScripts } from "../alphabeticalScripts";

const PACKAGE_SCRIPTS_SORTED = jsonToString({
  scripts: {
    a: "a-",
    b: "b-",
    c: "c-",
  },
});

const PACKAGE_SCRIPTS_UNSORTED = jsonToString({
  scripts: {
    c: "c-",
    a: "a-",
    b: "b-",
  },
});

describe("alphabeticalScripts", () => {
  afterEach(() => {
    mockFiles.clear();
  });

  describe("fix: true", () => {
    const context = new PackageContext(
      ".",
      {
        rules: [],
        fix: true,
        verbose: false,
        silent: true,
      },
      new NormalFileSystem()
    );
    const spy = jest.spyOn(context, "addError");

    afterEach(() => {
      spy.mockClear();
    });

    it("fixes unsorted scripts", () => {
      mockFiles.set("package.json", PACKAGE_SCRIPTS_UNSORTED);

      alphabeticalScripts.check(context, undefined);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe("Incorrect order of scripts in package.json");

      expect(mockFiles.get("package.json")).toEqual(PACKAGE_SCRIPTS_SORTED);
    });

    it("does nothing if already sorted", () => {
      mockFiles.set("package.json", PACKAGE_SCRIPTS_SORTED);

      alphabeticalScripts.check(context, undefined);

      expect(spy).toHaveBeenCalledTimes(0);
    });
  });
});
