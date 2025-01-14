/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// tslint:disable:no-console
import { describe, expect, it, beforeEach, vi } from "vitest";
import { Context, Failure } from "@monorepolint/config";
import { packageScript } from "../packageScript.js";
import { AddErrorSpy, createTestingWorkspace, HOST_FACTORIES, TestingWorkspace } from "./utils.js";

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

describe.each(HOST_FACTORIES)("expectPackageScript ($name)", (hostFactory) => {
  describe("fix: false", () => {
    let workspace: TestingWorkspace;
    let spy: AddErrorSpy;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: false,
        host: hostFactory.make(),
      });

      spy = vi.spyOn(workspace.context, "addError");
    });

    it("handles an empty script section", () => {
      workspace.writeFile("package.json", PACKAGE_WITHOUT_SCRIPTS);

      packageScript({
        options: {
          scripts: {
            foo: "bar",
          },
        },
      }).check(workspace.context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: "No scripts block in package.json",
        })
      );
    });
  });

  describe("fix: true", () => {
    let workspace: TestingWorkspace;
    let spy: AddErrorSpy;
    let context: Context;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: true,
        host: hostFactory.make(),
      });

      spy = vi.spyOn(workspace.context, "addError");
      context = workspace.context; // minimizing delta
    });

    it("fixes an empty script section", () => {
      workspace.writeFile("package.json", PACKAGE_WITHOUT_SCRIPTS);

      packageScript({
        options: {
          scripts: {
            foo: "bar",
          },
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: "No scripts block in package.json",
        })
      );

      expect(JSON.parse(workspace.readFile("package.json")!).scripts).toEqual({});
    });

    it("adds a script", () => {
      workspace.writeFile("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript({
        options: {
          scripts: {
            [MISSING_SCRIPT_NAME]: MISSING_SCRIPT_VALUE,
          },
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: expect.stringContaining(
            `Expected standardized script entry for '${MISSING_SCRIPT_NAME}'`
          ) as unknown as string,
        })
      );

      expect(JSON.parse(workspace.readFile("package.json")!).scripts[MISSING_SCRIPT_NAME]).toEqual(
        MISSING_SCRIPT_VALUE
      );
    });

    it("does nothing if the value exists", () => {
      workspace.writeFile("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript({
        options: {
          scripts: {
            [SCRIPT_NAME]: SCRIPT_VALUE,
          },
        },
      }).check(context);

      expect(spy).not.toHaveBeenCalled();

      expect(JSON.parse(workspace.readFile("package.json")!).scripts).toEqual({
        [SCRIPT_NAME]: SCRIPT_VALUE,
      });
    });

    it("errors if long form is used and no value matches and there is no fixValue", () => {
      workspace.writeFile("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript({
        options: {
          scripts: {
            foo: {
              options: ["a", "b"],
            },
          },
        },
      }).check(context);

      const errors = spy.mock.calls;

      expect(errors.length).toBe(1);
      expect(errors[0][0].fixer).toBeUndefined();
    });

    it("uses the fixValue for fixing if provided", () => {
      workspace.writeFile("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript({
        options: {
          scripts: {
            foo: {
              options: ["a", "b"],
              fixValue: "a",
            },
          },
        },
      }).check(context);

      const errors = spy.mock.calls;

      expect(errors.length).toBe(1);
      expect(errors[0][0].fixer).toBeDefined();

      expect(JSON.parse(workspace.readFile("package.json")!).scripts).toEqual({
        [SCRIPT_NAME]: SCRIPT_VALUE,
        foo: "a",
      });
    });

    it("can fix to empty", () => {
      workspace.writeFile("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript({
        options: {
          scripts: {
            [SCRIPT_NAME]: {
              options: ["a", undefined],
              fixValue: undefined,
            },
          },
        },
      }).check(context);

      const errors = spy.mock.calls;

      expect(errors.length).toBe(1);
      expect(errors[0][0].fixer).toBeDefined();

      expect(JSON.parse(workspace.readFile("package.json")!).scripts).toEqual({});
    });

    it("can allow only empty", () => {
      workspace.writeFile("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript({
        options: {
          scripts: {
            [SCRIPT_NAME]: {
              options: [undefined],
              fixValue: undefined,
            },
          },
        },
      }).check(context);

      const errors = spy.mock.calls;

      expect(errors.length).toBe(1);
      expect(errors[0][0].fixer).toBeDefined();

      expect(JSON.parse(workspace.readFile("package.json")!).scripts).toEqual({});
    });
  });
});
