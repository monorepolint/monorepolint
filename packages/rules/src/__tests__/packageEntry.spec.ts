/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// tslint:disable:no-console

import { Context, Failure } from "@monorepolint/config";
import { createExpectedEntryErrorMessage, createStandardizedEntryErrorMessage, packageEntry } from "../packageEntry.js";
import { AddErrorSpy, createTestingWorkspace, HOST_FACTORIES, TestingWorkspace } from "./utils.js";
import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";

const PACKAGE_MISSING_ENTRY =
  JSON.stringify(
    {
      name: "package",
      version: {},
      scripts: {},
      dependencies: {},
    },
    undefined,
    2
  ) + "\n";

const PACKAGE_LICENSE =
  JSON.stringify(
    {
      name: "package",
      version: {},
      scripts: {},
      dependencies: {},
      license: "UNLICENSED",
    },
    undefined,
    2
  ) + "\n";

const PACKAGE_REPOSITORY =
  JSON.stringify(
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
    2
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

      spy = jest.spyOn(workspace.context, "addError");
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
        })
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
        })
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
        })
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
        })
      );

      const failure2: Failure = spy.mock.calls[1][0];
      expect(failure2).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: false,
          message: createExpectedEntryErrorMessage("bugs"),
        })
      );

      expect(workspace.readFile("package.json")).toEqual(PACKAGE_REPOSITORY);
    });
  });
});
