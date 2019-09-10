/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// tslint:disable:no-console
import { createMockFiles } from "./utils";

// done first since this also mocks 'fs'
const mockFiles: Map<string, string> = createMockFiles();

import { Failure, PackageContext } from "@monorepolint/core";
import { packageScript } from "../packageScript";

const json = (a: unknown) => JSON.stringify(a, undefined, 2) + "\n";

const PACKAGE_WITHOUT_SCRIPTS = json({
  name: "package-without-scripts",
});

const MISSING_SCRIPT_NAME = "missing";
const MISSING_SCRIPT_VALUE = "missing value";

const SCRIPT_NAME = "exists";
const SCRIPT_VALUE = "exists value";

const PACKAGE_WITH_SCRIPTS = json({
  name: "package-with-scripts",
  scripts: {
    [SCRIPT_NAME]: SCRIPT_VALUE,
  },
});

describe("expectPackageScript", () => {
  afterEach(() => {
    mockFiles.clear();
  });

  describe("fix: false", () => {
    const context = new PackageContext(".", {
      rules: [],
      fix: false,
      verbose: false,
      silent: true,
    });

    const spy = jest.spyOn(context, "addError");

    afterEach(() => {
      spy.mockClear();
    });

    it("handles an empty script section", () => {
      mockFiles.set("package.json", PACKAGE_WITHOUT_SCRIPTS);

      packageScript.check(context, {
        scripts: {
          foo: "bar",
        },
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe("No scripts block in package.json");
    });
  });

  describe("fix: true", () => {
    const context = new PackageContext(".", {
      rules: [],
      fix: true,
      verbose: false,
      silent: true,
    });
    const spy = jest.spyOn(context, "addError");

    afterEach(() => {
      spy.mockClear();
    });

    it("fixes an empty script section", () => {
      mockFiles.set("package.json", PACKAGE_WITHOUT_SCRIPTS);

      packageScript.check(context, {
        scripts: {
          foo: "bar",
        },
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe("No scripts block in package.json");

      expect(JSON.parse(mockFiles.get("package.json")!).scripts).toEqual({});
    });

    it("adds a script", () => {
      mockFiles.set("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript.check(context, {
        scripts: {
          [MISSING_SCRIPT_NAME]: MISSING_SCRIPT_VALUE,
        },
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toMatch(`Expected standardized script entry for '${MISSING_SCRIPT_NAME}'`);

      expect(JSON.parse(mockFiles.get("package.json")!).scripts[MISSING_SCRIPT_NAME]).toEqual(MISSING_SCRIPT_VALUE);
    });

    it("does nothing if the value exists", () => {
      mockFiles.set("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript.check(context, {
        scripts: {
          [SCRIPT_NAME]: SCRIPT_VALUE,
        },
      });

      expect(spy).not.toHaveBeenCalled();

      expect(JSON.parse(mockFiles.get("package.json")!).scripts).toEqual({
        [SCRIPT_NAME]: SCRIPT_VALUE,
      });
    });

    it("errors if long form is used and no value matches and there is no fixValue", () => {
      mockFiles.set("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript.check(context, {
        scripts: {
          foo: {
            options: ["a", "b"],
          },
        },
      });

      const errors = spy.mock.calls;

      expect(errors.length).toBe(1);
      expect(errors[0][0].fixer).toBeUndefined();
    });

    it("uses the fixValue for fixing if provided", () => {
      mockFiles.set("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript.check(context, {
        scripts: {
          foo: {
            options: ["a", "b"],
            fixValue: "a",
          },
        },
      });

      const errors = spy.mock.calls;

      expect(errors.length).toBe(1);
      expect(errors[0][0].fixer).toBeDefined();

      expect(JSON.parse(mockFiles.get("package.json")!).scripts).toEqual({
        [SCRIPT_NAME]: SCRIPT_VALUE,
        foo: "a",
      });
    });

    it("can fix to empty", () => {
      mockFiles.set("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript.check(context, {
        scripts: {
          [SCRIPT_NAME]: {
            options: ["a", undefined],
            fixValue: undefined,
          },
        },
      });

      const errors = spy.mock.calls;

      expect(errors.length).toBe(1);
      expect(errors[0][0].fixer).toBeDefined();

      expect(JSON.parse(mockFiles.get("package.json")!).scripts).toEqual({});
    });
  });
});
