/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// tslint:disable:no-console
import { Context, Failure } from "@monorepolint/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { packageScript } from "../packageScript.js";
import { REMOVE } from "../REMOVE.js";
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
        }),
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
        }),
      );

      expect(JSON.parse(workspace.readFile("package.json")!).scripts).toEqual(
        {},
      );
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
            `Expected standardized script entry for '${MISSING_SCRIPT_NAME}'`,
          ) as unknown as string,
        }),
      );

      expect(
        JSON.parse(workspace.readFile("package.json")!)
          .scripts[MISSING_SCRIPT_NAME],
      ).toEqual(
        MISSING_SCRIPT_VALUE,
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

      expect(JSON.parse(workspace.readFile("package.json")!).scripts).toEqual(
        {},
      );
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

      expect(JSON.parse(workspace.readFile("package.json")!).scripts).toEqual(
        {},
      );
    });
  });

  describe("Missing package.json handling", () => {
    let workspace: TestingWorkspace;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: false,
        host: hostFactory.make(),
      });
    });

    it("handles gracefully when package.json does not exist", () => {
      // Don't create a package.json file in the current directory
      // Create a child context that points to a directory without package.json
      const childContext = workspace.context.getWorkspaceContext().createChildContext(
        workspace.getFilePath("packages/missing"),
      );

      expect(() => {
        packageScript({
          options: {
            scripts: {
              build: "tsc",
            },
          },
        }).check(childContext);
      }).toThrow(); // Should throw when trying to get package.json
    });
  });

  describe("Invalid package.json structure", () => {
    let workspace: TestingWorkspace;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: false,
        host: hostFactory.make(),
      });
    });

    it("handles package.json with non-object scripts", () => {
      workspace.writeFile(
        "package.json",
        json({
          name: "test-package",
          scripts: "invalid-scripts", // Should be an object
        }),
      );

      // This actually won't throw - the rule will just add an error for missing scripts block
      // since scripts is not an object, it will be treated as undefined
      const spy = vi.spyOn(workspace.context, "addError");

      packageScript({
        options: {
          scripts: {
            build: "tsc",
          },
        },
      }).check(workspace.context);

      // Should add an error because scripts is not a proper object
      expect(spy).toHaveBeenCalled();
    });

    it("handles malformed JSON in package.json", () => {
      workspace.writeFile("package.json", "{ invalid json }");

      expect(() => {
        packageScript({
          options: {
            scripts: {
              build: "tsc",
            },
          },
        }).check(workspace.context);
      }).toThrow(); // Should throw when parsing invalid JSON
    });
  });

  describe("REMOVE symbol usage", () => {
    let workspace: TestingWorkspace;
    let spy: AddErrorSpy;
    let context: Context;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: true,
        host: hostFactory.make(),
      });
      spy = vi.spyOn(workspace.context, "addError");
      context = workspace.context;
    });

    it("can remove a script using REMOVE in options array", () => {
      workspace.writeFile("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript({
        options: {
          scripts: {
            [SCRIPT_NAME]: {
              options: ["different-value", REMOVE], // Current value doesn't match either option
              fixValue: REMOVE,
            },
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
            `Expected standardized script entry for '${SCRIPT_NAME}'`,
          ) as unknown as string,
        }),
      );

      // Verify script was removed
      expect(JSON.parse(workspace.readFile("package.json")!).scripts).toEqual({});
    });

    it("handles REMOVE on non-existent script", () => {
      workspace.writeFile("package.json", PACKAGE_WITHOUT_SCRIPTS);

      packageScript({
        options: {
          scripts: {
            nonExistent: {
              options: ["value", REMOVE],
              fixValue: REMOVE,
            },
          },
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(1); // Only one for no scripts block - the rule returns early
    });
  });

  describe("Direct REMOVE syntax", () => {
    let workspace: TestingWorkspace;
    let spy: AddErrorSpy;
    let context: Context;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: true,
        host: hostFactory.make(),
      });
      spy = vi.spyOn(workspace.context, "addError");
      context = workspace.context;
    });

    it("removes existing script using direct REMOVE syntax", () => {
      workspace.writeFile("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript({
        options: {
          scripts: {
            [SCRIPT_NAME]: REMOVE,
          },
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: `Script '${SCRIPT_NAME}' should be removed`,
        }),
      );

      // Verify script was removed
      expect(JSON.parse(workspace.readFile("package.json")!).scripts).toEqual({});
    });

    it("does not error when REMOVE is specified for non-existent script", () => {
      workspace.writeFile("package.json", PACKAGE_WITH_SCRIPTS);

      packageScript({
        options: {
          scripts: {
            nonExistentScript: REMOVE,
          },
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(0);

      // Original scripts should remain unchanged
      expect(JSON.parse(workspace.readFile("package.json")!).scripts).toEqual({
        [SCRIPT_NAME]: SCRIPT_VALUE,
      });
    });

    it("handles mix of REMOVE and regular script values", () => {
      const packageWithMultipleScripts = json({
        name: "package-with-multiple-scripts",
        scripts: {
          build: "tsc",
          test: "jest",
          lint: "eslint",
        },
      });

      workspace.writeFile("package.json", packageWithMultipleScripts);

      packageScript({
        options: {
          scripts: {
            build: REMOVE, // Remove existing script
            test: "vitest", // Change existing script
            start: "node index.js", // Add new script
            lint: REMOVE, // Remove another existing script
          },
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(4); // build removal, test change, start addition, lint removal

      const failures = spy.mock.calls.map(call => call[0]);

      // We expect 4 failures: build removal, test change, start addition, lint removal
      // The order might vary, so let's check by message content instead of position
      const errorMessages = failures.map(f => f.message);

      expect(errorMessages).toContain("Script 'build' should be removed");
      expect(errorMessages).toContain("Script 'lint' should be removed");
      expect(
        errorMessages.some(msg => msg.includes("Expected standardized script entry for 'test'")),
      ).toBe(true);
      expect(
        errorMessages.some(msg => msg.includes("Expected standardized script entry for 'start'")),
      ).toBe(true);

      // Verify final scripts state
      expect(JSON.parse(workspace.readFile("package.json")!).scripts).toEqual({
        test: "vitest",
        start: "node index.js",
      });
    });

    it("handles REMOVE when scripts block doesn't exist", () => {
      workspace.writeFile("package.json", PACKAGE_WITHOUT_SCRIPTS);

      packageScript({
        options: {
          scripts: {
            build: REMOVE,
          },
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(1); // Only for missing scripts block

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: "No scripts block in package.json",
        }),
      );
    });
  });

  describe("Options Validation", () => {
    it("should accept valid options", () => {
      const ruleModule = packageScript({
        options: { scripts: { "build": "tsc" } },
      });

      expect(() =>
        ruleModule.validateOptions({
          scripts: {
            "build": "tsc",
            "test": {
              options: ["jest", "vitest", undefined],
              fixValue: "jest",
            },
          },
        })
      ).not.toThrow();

      expect(() =>
        ruleModule.validateOptions({
          scripts: {
            "start": "node index.js",
            "outdated": REMOVE, // Direct REMOVE syntax
          },
        })
      ).not.toThrow();

      expect(() =>
        ruleModule.validateOptions({
          scripts: {
            "build": REMOVE,
            "test": "jest",
            "lint": {
              options: ["eslint", REMOVE],
              fixValue: REMOVE,
            },
          },
        })
      ).not.toThrow();
    });

    it("should reject invalid options", () => {
      const ruleModule = packageScript({ options: { scripts: { "build": "tsc" } } });

      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({})).toThrow();
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({ scripts: { "build": 123 } })).toThrow();
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({ scripts: "invalid" })).toThrow();
    });
  });
});
