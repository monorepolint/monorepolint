/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// tslint:disable:no-console

import { Context, Failure } from "@monorepolint/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createExpectedEntryErrorMessage,
  createRemovalEntryErrorMessage,
  createStandardizedEntryErrorMessage,
  packageEntry,
} from "../packageEntry.js";
import { REMOVE } from "../REMOVE.js";
import { AddErrorSpy, createTestingWorkspace, HOST_FACTORIES, TestingWorkspace } from "./utils.js";

const PACKAGE_MISSING_ENTRY = JSON.stringify(
  {
    name: "package",
    version: {},
    scripts: {},
    dependencies: {},
  },
  undefined,
  2,
) + "\n";

const PACKAGE_LICENSE = JSON.stringify(
  {
    name: "package",
    version: {},
    scripts: {},
    dependencies: {},
    license: "UNLICENSED",
  },
  undefined,
  2,
) + "\n";

const PACKAGE_REPOSITORY = JSON.stringify(
  {
    name: "package",
    version: {},
    scripts: {},
    dependencies: {},
    repository: {
      type: "git",
      url: "https://github.com:foo/foo",
    },
  },
  undefined,
  2,
) + "\n";

const PACKAGE_WITH_SCRIPTS = JSON.stringify(
  {
    name: "package",
    version: {},
    scripts: {
      build: "tsc",
      test: "jest",
    },
    dependencies: {},
    license: "UNLICENSED",
  },
  undefined,
  2,
) + "\n";

const PACKAGE_WITHOUT_SCRIPTS = JSON.stringify(
  {
    name: "package",
    version: {},
    dependencies: {},
    license: "UNLICENSED",
  },
  undefined,
  2,
) + "\n";

describe.each(HOST_FACTORIES)("expectPackageEntries ($name)", (hostFactory) => {
  describe("fix: true", () => {
    let workspace: TestingWorkspace;
    let spy: AddErrorSpy;
    let context: Context;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: true,
        host: hostFactory.make(),
      });
      context = workspace.context; // minimizing delta

      spy = vi.spyOn(workspace.context, "addError");
    });

    afterEach(() => {
      spy.mockClear();
    });

    it("fixes missing entries", () => {
      workspace.writeFile("package.json", PACKAGE_MISSING_ENTRY);

      packageEntry({
        options: {
          entries: {
            license: "UNLICENSED",
          },
          entriesExist: undefined,
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: createStandardizedEntryErrorMessage("license"),
        }),
      );

      expect(workspace.readFile("package.json")).toEqual(PACKAGE_LICENSE);
    });

    it("fixes missing nested entries", () => {
      workspace.writeFile("package.json", PACKAGE_MISSING_ENTRY);

      packageEntry({
        options: {
          entries: {
            repository: {
              type: "git",
              url: "https://github.com:foo/foo",
            },
          },
          entriesExist: undefined,
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: createStandardizedEntryErrorMessage("repository"),
        }),
      );

      expect(workspace.readFile("package.json")).toEqual(PACKAGE_REPOSITORY);
    });

    it("doesn't error for nested entries that are defined", () => {
      workspace.writeFile("package.json", PACKAGE_REPOSITORY);

      packageEntry({
        options: {
          entries: {
            repository: {
              type: "git",
              url: "https://github.com:foo/foo",
            },
          },
          entriesExist: undefined,
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(0);
      expect(workspace.readFile("package.json")).toEqual(PACKAGE_REPOSITORY);
    });

    it("errors for keys that are missing", () => {
      workspace.writeFile("package.json", PACKAGE_REPOSITORY);

      packageEntry({
        options: {
          entries: undefined,
          entriesExist: ["bugs"],
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: false,
          message: createExpectedEntryErrorMessage("bugs"),
        }),
      );
      expect(workspace.readFile("package.json")).toEqual(PACKAGE_REPOSITORY);
    });

    it("handles both entries and entriesExist", () => {
      workspace.writeFile("package.json", PACKAGE_MISSING_ENTRY);

      packageEntry({
        options: {
          entries: {
            repository: {
              type: "git",
              url: "https://github.com:foo/foo",
            },
          },
          entriesExist: ["bugs"],
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(2);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: createStandardizedEntryErrorMessage("repository"),
        }),
      );

      const failure2: Failure = spy.mock.calls[1][0];
      expect(failure2).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: false,
          message: createExpectedEntryErrorMessage("bugs"),
        }),
      );

      expect(workspace.readFile("package.json")).toEqual(PACKAGE_REPOSITORY);
    });

    it("removes existing entries when REMOVE is specified", () => {
      workspace.writeFile("package.json", PACKAGE_WITH_SCRIPTS);

      packageEntry({
        options: {
          entries: {
            scripts: REMOVE,
          },
          entriesExist: undefined,
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: createRemovalEntryErrorMessage("scripts"),
        }),
      );

      expect(workspace.readFile("package.json")).toEqual(PACKAGE_WITHOUT_SCRIPTS);
    });

    it("does not error when REMOVE is specified for non-existent entry", () => {
      workspace.writeFile("package.json", PACKAGE_WITHOUT_SCRIPTS);

      packageEntry({
        options: {
          entries: {
            scripts: REMOVE,
          },
          entriesExist: undefined,
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(0);
      expect(workspace.readFile("package.json")).toEqual(PACKAGE_WITHOUT_SCRIPTS);
    });

    it("handles mix of REMOVE and regular entries", () => {
      workspace.writeFile("package.json", PACKAGE_WITH_SCRIPTS);

      packageEntry({
        options: {
          entries: {
            scripts: REMOVE,
            description: "A test package",
          },
          entriesExist: undefined,
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(2);

      const failure1: Failure = spy.mock.calls[0][0];
      expect(failure1).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: createRemovalEntryErrorMessage("scripts"),
        }),
      );

      const failure2: Failure = spy.mock.calls[1][0];
      expect(failure2).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: createStandardizedEntryErrorMessage("description"),
        }),
      );

      const expectedPackage = JSON.stringify(
        {
          name: "package",
          version: {},
          dependencies: {},
          license: "UNLICENSED",
          description: "A test package",
        },
        undefined,
        2,
      ) + "\n";

      expect(workspace.readFile("package.json")).toEqual(expectedPackage);
    });

    it("handles REMOVE with entriesExist", () => {
      workspace.writeFile("package.json", PACKAGE_WITH_SCRIPTS);

      packageEntry({
        options: {
          entries: {
            scripts: REMOVE,
          },
          entriesExist: ["license"],
        },
      }).check(context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: createRemovalEntryErrorMessage("scripts"),
        }),
      );

      expect(workspace.readFile("package.json")).toEqual(PACKAGE_WITHOUT_SCRIPTS);
    });
  });

  describe("Options Validation", () => {
    it("should accept valid options", () => {
      const ruleModule = packageEntry({ options: { entries: { name: "@scope/package" } } });

      expect(() =>
        ruleModule.validateOptions({ entries: { name: "@scope/package", version: "1.0.0" } })
      ).not.toThrow();
      expect(() => ruleModule.validateOptions({ entriesExist: ["name", "version"] })).not.toThrow();
      expect(() =>
        ruleModule.validateOptions({
          entries: { license: "MIT" },
          entriesExist: ["description"],
        })
      ).not.toThrow();
      expect(() =>
        ruleModule.validateOptions({
          entries: { scripts: REMOVE, name: "@scope/package" },
        })
      ).not.toThrow();
    });

    it("should reject invalid options", () => {
      const ruleModule = packageEntry({ options: { entries: { name: "@scope/package" } } });

      expect(() => ruleModule.validateOptions({})).toThrow();

      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({ entriesExist: "name" })).toThrow();
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({ entries: "invalid" })).toThrow();
    });
  });
});
