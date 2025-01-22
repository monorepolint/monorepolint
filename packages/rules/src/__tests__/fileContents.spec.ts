/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// tslint:disable:no-console
import { AddErrorOptions, Failure } from "@monorepolint/config";
import { beforeEach, describe, expect, it, MockInstance, vi } from "vitest";
import { fileContents } from "../fileContents.js";
import {
  createTestingWorkspace,
  HOST_FACTORIES,
  TestingWorkspace,
} from "./utils.js";

const EXPECTED_FOO_FILE = "hello world";

describe.each(HOST_FACTORIES)("fileContents ($name)", (hostFactory) => {
  describe("fix: true", () => {
    let workspace: TestingWorkspace;
    let spy: MockInstance<(opts: AddErrorOptions) => void>;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: true,
        host: hostFactory.make(),
      });
      workspace.writeFile("shared/foo-template.txt", EXPECTED_FOO_FILE);

      spy = vi.spyOn(workspace.context, "addError");
    });

    it("works with async generator", async () => {
      await fileContents({
        options: {
          file: "foo.txt",
          generator: () => Promise.resolve(EXPECTED_FOO_FILE),
        },
      }).check(workspace.context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "foo.txt",
          hasFixer: true,
          message: "Expect file contents to match",
        }),
      );

      expect(workspace.readFile("foo.txt")).toEqual(EXPECTED_FOO_FILE);
    });

    it("fixes missing file", async () => {
      await fileContents({
        options: {
          file: "foo.txt",
          templateFile: "shared/foo-template.txt",
          generator: undefined,
          template: undefined,
        },
      }).check(workspace.context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "foo.txt",
          hasFixer: true,
          message: "Expect file contents to match",
        }),
      );

      expect(workspace.readFile("foo.txt")).toEqual(EXPECTED_FOO_FILE);
    });

    it("fixes missing nested file", async () => {
      await fileContents({
        options: {
          file: "nested/foo.txt",
          templateFile: "shared/foo-template.txt",
          generator: undefined,
          template: undefined,
        },
      }).check(workspace.context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "nested/foo.txt",
          hasFixer: true,
          message: "Expect file contents to match",
        }),
      );

      expect(workspace.readFile("nested/foo.txt")).toEqual(EXPECTED_FOO_FILE);
    });
  });
});
