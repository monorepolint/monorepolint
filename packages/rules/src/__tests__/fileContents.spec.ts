/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// tslint:disable:no-console
import { createTestingWorkspace, TestingWorkspace } from "./utils";
import { AddErrorOptions, Failure } from "@monorepolint/core";
import { fileContents } from "../fileContents";
import { SimpleHost } from "@monorepolint/utils";

const EXPECTED_FOO_FILE = "hello world";

describe("fileContents", () => {
  describe("fix: true", () => {
    let workspace: TestingWorkspace;
    let spy: jest.SpyInstance<void, [AddErrorOptions]>;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: true,
        host: new SimpleHost(),
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
