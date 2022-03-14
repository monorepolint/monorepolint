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
import { packageEntry } from "../packageEntry";
import { SimpleHost } from "@monorepolint/utils";

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

describe("expectPackageEntries", () => {
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
      new SimpleHost()
    );
    const spy = jest.spyOn(context, "addError");

    afterEach(() => {
      spy.mockClear();
    });

    it("fixes missing entries", () => {
      mockFiles.set("package.json", PACKAGE_MISSING_ENTRY);

      packageEntry.check(context, {
        entries: {
          license: "UNLICENSED",
        },
        entriesExist: undefined,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe("Expected standardized entry for 'license'");

      expect(mockFiles.get("package.json")).toEqual(PACKAGE_LICENSE);
    });

    it("fixes missing nested entries", () => {
      mockFiles.set("package.json", PACKAGE_MISSING_ENTRY);

      packageEntry.check(context, {
        entries: {
          repository: {
            type: "git",
            url: "https://github.com:foo/foo",
          },
        },
        entriesExist: undefined,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe("Expected standardized entry for 'repository'");

      expect(mockFiles.get("package.json")).toEqual(PACKAGE_REPOSITORY);
    });

    it("doesn't error for nested entries that are defined", () => {
      mockFiles.set("package.json", PACKAGE_REPOSITORY);

      packageEntry.check(context, {
        entries: {
          repository: {
            type: "git",
            url: "https://github.com:foo/foo",
          },
        },
        entriesExist: undefined,
      });

      expect(spy).toHaveBeenCalledTimes(0);
      expect(mockFiles.get("package.json")).toEqual(PACKAGE_REPOSITORY);
    });

    it("errors for keys that are missing", () => {
      mockFiles.set("package.json", PACKAGE_REPOSITORY);

      packageEntry.check(context, {
        entries: undefined,
        entriesExist: ["bugs"],
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).toBeUndefined();
      expect(failure.message).toBe("Expected entry for 'bugs' to exist");
      expect(mockFiles.get("package.json")).toEqual(PACKAGE_REPOSITORY);
    });

    it("handles both entries and entriesExist", () => {
      mockFiles.set("package.json", PACKAGE_MISSING_ENTRY);

      packageEntry.check(context, {
        entries: {
          repository: {
            type: "git",
            url: "https://github.com:foo/foo",
          },
        },
        entriesExist: ["bugs"],
      });

      expect(spy).toHaveBeenCalledTimes(2);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe("Expected standardized entry for 'repository'");

      const failure2: Failure = spy.mock.calls[1][0];
      expect(failure2.file).toBe("package.json");
      expect(failure2.fixer).toBeUndefined();
      expect(failure2.message).toBe("Expected entry for 'bugs' to exist");

      expect(mockFiles.get("package.json")).toEqual(PACKAGE_REPOSITORY);
    });
  });
});
