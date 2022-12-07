/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// tslint:disable:no-console
import { AddErrorSpy, createTestingWorkspace, HOST_FACTORIES, TestingWorkspace } from "./utils.js";
import { Context, Failure } from "@monorepolint/config";
import { packageOrder } from "../packageOrder.js";

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

describe.each(HOST_FACTORIES)("expectPackageOrder ($name)", (hostFactory) => {
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

    it("fixes order for expected keys", () => {
      workspace.writeFile("package.json", PACKAGE_UNORDERED);

      packageOrder.check(context, {
        order: orderArray,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: "Incorrect order of fields in package.json",
        })
      );

      expect(workspace.readFile("package.json")).toEqual(PACKAGE_ORDERED);
    });

    it("fixes order for unexpected keys", () => {
      workspace.writeFile("package.json", PACKAGE_UNORDERED_UNKOWN_KEYS);

      packageOrder.check(context, {
        order: orderArray,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: "Incorrect order of fields in package.json",
        })
      );

      expect(workspace.readFile("package.json")).toEqual(PACKAGE_ORDERED_UNKOWN_KEYS);
    });

    it("fixes order using function", () => {
      workspace.writeFile("package.json", PACKAGE_UNORDERED);

      packageOrder.check(context, {
        order: orderFunction,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: "Incorrect order of fields in package.json",
        })
      );

      expect(workspace.readFile("package.json")).toEqual(PACKAGE_ORDERED_BY_LENGTH);
    });

    it("does nothing if already order", () => {
      workspace.writeFile("package.json", PACKAGE_ORDERED_UNKOWN_KEYS);

      packageOrder.check(context, {
        order: orderArray,
      });

      expect(spy).not.toHaveBeenCalled();

      expect(workspace.readFile("package.json")).toEqual(PACKAGE_ORDERED_UNKOWN_KEYS);
    });
  });
});
