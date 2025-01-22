/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// tslint:disable:no-console
import { Context, Failure } from "@monorepolint/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { alphabeticalScripts } from "../alphabeticalScripts.js";
import { createIncorrectOrderErrorMessage } from "../util/checkAlpha.js";
import {
  AddErrorSpy,
  createTestingWorkspace,
  HOST_FACTORIES,
  jsonToString,
  TestingWorkspace,
} from "./utils.js";

const PACKAGE_SCRIPTS_SORTED = jsonToString({
  name: "foo-lib",
  scripts: {
    a: "a-",
    b: "b-",
    c: "c-",
  },
});

const PACKAGE_SCRIPTS_UNSORTED = jsonToString({
  name: "foo-lib",
  scripts: {
    c: "c-",
    a: "a-",
    b: "b-",
  },
});

describe.each(HOST_FACTORIES)("alphabeticalScripts ($name)", (hostFactory) => {
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

    it("fixes unsorted scripts", () => {
      workspace.writeFile("package.json", PACKAGE_SCRIPTS_UNSORTED);

      alphabeticalScripts({}).check(context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "package.json",
          hasFixer: true,
          message: createIncorrectOrderErrorMessage("scripts", "foo-lib"),
        }),
      );

      expect(workspace.readFile("package.json")).toEqual(
        PACKAGE_SCRIPTS_SORTED,
      );
    });

    it("does nothing if already sorted", () => {
      workspace.writeFile("package.json", PACKAGE_SCRIPTS_SORTED);

      alphabeticalScripts({}).check(context);

      expect(spy).toHaveBeenCalledTimes(0);
    });
  });
});
