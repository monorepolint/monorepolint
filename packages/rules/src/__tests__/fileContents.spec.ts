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
import * as path from "path";
import { fileContents } from "../fileContents";

const EXPECTED_FOO_FILE = "hello world";

describe("fileContents", () => {
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

    it("fixes missing file", () => {
      mockFiles.set(path.resolve(context.getWorkspaceContext().packageDir, "foo-template.txt"), EXPECTED_FOO_FILE);

      fileContents.check(context, {
        file: "foo.txt",
        templateFile: "foo-template.txt",
        generator: undefined,
        template: undefined,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("foo.txt");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe("Expect file contents to match");

      expect(mockFiles.get("foo.txt")).toEqual(EXPECTED_FOO_FILE);
    });

    it("fixes missing nested file", () => {
      mockFiles.set(
        path.resolve(context.getWorkspaceContext().packageDir, "shared/foo-template.txt"),
        EXPECTED_FOO_FILE
      );

      fileContents.check(context, {
        file: "nested/foo.txt",
        templateFile: "shared/foo-template.txt",
        generator: undefined,
        template: undefined,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("nested/foo.txt");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe("Expect file contents to match");

      expect(mockFiles.get("nested")).not.toBeUndefined();
      expect(mockFiles.get("nested/foo.txt")).toEqual(EXPECTED_FOO_FILE);
    });
  });
});
