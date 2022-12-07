/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// tslint:disable:no-console
import { createTestingWorkspace, HOST_FACTORIES, TestingWorkspace } from "./utils.js";
import { AddErrorOptions, Failure } from "@monorepolint/config";
import { fileContents } from "../fileContents.js";
import { describe, expect, it, beforeEach, jest } from "@jest/globals";

const EXPECTED_FOO_FILE = "hello world";

describe.each(HOST_FACTORIES)("fileContents ($name)", (hostFactory) => {
  describe("fix: true", () => {
    let workspace: TestingWorkspace;
    let spy: jest.SpiedFunction<(opts: AddErrorOptions) => void>;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: true,
        host: hostFactory.make(),
      });
      workspace.writeFile("shared/foo-template.txt", EXPECTED_FOO_FILE);

      spy = jest.spyOn(workspace.context, "addError");
    });

    it("fixes missing file", () => {
      fileContents.check(workspace.context, {
        file: "foo.txt",
        templateFile: "shared/foo-template.txt",
        generator: undefined,
        template: undefined,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "foo.txt",
          hasFixer: true,
          message: "Expect file contents to match",
        })
      );

      expect(workspace.readFile("foo.txt")).toEqual(EXPECTED_FOO_FILE);
    });

    it("fixes missing nested file", () => {
      fileContents.check(workspace.context, {
        file: "nested/foo.txt",
        templateFile: "shared/foo-template.txt",
        generator: undefined,
        template: undefined,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "nested/foo.txt",
          hasFixer: true,
          message: "Expect file contents to match",
        })
      );

      expect(workspace.readFile("nested/foo.txt")).toEqual(EXPECTED_FOO_FILE);
    });
  });
});
