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

import { Context, Failure, PackageContext } from "@monorepolint/core";
import { packageOrder } from "../packageOrder";

const PACKAGE_UNORDERED =
  JSON.stringify(
    {
      scripts: {},
      dependencies: {},
      version: {},
      name: "package",
    },
    undefined,
    2
  ) + "\n";

const PACKAGE_UNORDERED_UNKOWN_KEYS =
  JSON.stringify(
    {
      butter: false,
      apple: false,
      scripts: {},
      dependencies: {},
      version: {},
      name: "package-unknown-keys",
    },
    undefined,
    2
  ) + "\n";

const orderArray = ["name", "version", "scripts", "dependencies"];

// tslint:disable-next-line: variable-name
const orderFunction = (_context: Context) => (a: string, b: string) => {
  return b.length - a.length || a.localeCompare(b);
};

const PACKAGE_ORDERED =
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

const PACKAGE_ORDERED_BY_LENGTH =
  JSON.stringify(
    {
      dependencies: {},
      scripts: {},
      version: {},
      name: "package",
    },
    undefined,
    2
  ) + "\n";

const PACKAGE_ORDERED_UNKOWN_KEYS =
  JSON.stringify(
    {
      name: "package-unknown-keys",
      version: {},
      scripts: {},
      dependencies: {},
      apple: false,
      butter: false,
    },
    undefined,
    2
  ) + "\n";

describe("expectPackageOrder", () => {
  afterEach(() => {
    mockFiles.clear();
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

    it("fixes order for expected keys", () => {
      mockFiles.set("package.json", PACKAGE_UNORDERED);

      packageOrder.check(context, {
        order: orderArray,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe("Incorrect order of fields in package.json");

      expect(mockFiles.get("package.json")).toEqual(PACKAGE_ORDERED);
    });

    it("fixes order for unexpected keys", () => {
      mockFiles.set("package.json", PACKAGE_UNORDERED_UNKOWN_KEYS);

      packageOrder.check(context, {
        order: orderArray,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe("Incorrect order of fields in package.json");

      expect(mockFiles.get("package.json")).toEqual(PACKAGE_ORDERED_UNKOWN_KEYS);
    });

    it("fixes order using function", () => {
      mockFiles.set("package.json", PACKAGE_UNORDERED);

      packageOrder.check(context, {
        order: orderFunction,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe("Incorrect order of fields in package.json");

      expect(mockFiles.get("package.json")).toEqual(PACKAGE_ORDERED_BY_LENGTH);
    });

    it("does nothing if already order", () => {
      mockFiles.set("package.json", PACKAGE_ORDERED_UNKOWN_KEYS);

      packageOrder.check(context, {
        order: orderArray,
      });

      expect(spy).not.toHaveBeenCalled();

      expect(mockFiles.get("package.json")).toEqual(PACKAGE_ORDERED_UNKOWN_KEYS);
    });
  });
});
