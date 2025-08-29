/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// tslint:disable:no-console
import { Context, Failure } from "@monorepolint/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { alphabeticalDependencies } from "../alphabeticalDependencies.js";
import { createIncorrectOrderErrorMessage } from "../util/checkAlpha.js";
import {
  AddErrorSpy,
  createTestingWorkspace,
  HOST_FACTORIES,
  jsonToString,
  TestingWorkspace,
} from "./utils.js";

const PACKAGE_DEPENDENCIES_SORTED = jsonToString({
  name: "foo-lib",
  dependencies: {
    a: "^1.0.0",
    b: "^2.0.0",
    c: "^3.0.0",
  },
});

const PACKAGE_DEPENDENCIES_UNSORTED = jsonToString({
  name: "foo-lib",
  dependencies: {
    c: "^3.0.0",
    a: "^1.0.0",
    b: "^2.0.0",
  },
});

describe.each(HOST_FACTORIES)("alphabeticalDependencies ($name)", (hostFactory) => {
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

    it("fixes unsorted dependencies", () => {
      workspace.writeFile("package.json", PACKAGE_DEPENDENCIES_UNSORTED);

      alphabeticalDependencies({}).check(context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: createIncorrectOrderErrorMessage("dependencies", "foo-lib"),
        }),
      );

      expect(workspace.readFile("package.json")).toEqual(
        PACKAGE_DEPENDENCIES_SORTED,
      );
    });

    it("does nothing if already sorted", () => {
      workspace.writeFile("package.json", PACKAGE_DEPENDENCIES_SORTED);

      alphabeticalDependencies({}).check(context);

      expect(spy).toHaveBeenCalledTimes(0);
    });
  });

  describe("Options Validation", () => {
    it("should accept undefined options", () => {
      const ruleModule = alphabeticalDependencies({ options: undefined });
      expect(() => ruleModule.validateOptions(undefined)).not.toThrow();
    });

    it("has empty validation - accepts any input", () => {
      const ruleModule = alphabeticalDependencies({ options: undefined });
      // Note: This rule has an empty validation function, so it accepts anything
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({})).not.toThrow();
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions("string")).not.toThrow();
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions([])).not.toThrow();
    });
  });
});
