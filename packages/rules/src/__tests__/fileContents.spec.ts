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
import { REMOVE } from "../REMOVE.js";
import { createTestingWorkspace, HOST_FACTORIES, TestingWorkspace } from "./utils.js";

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

    it("deletes existing file when template is REMOVE", async () => {
      // First create a file to delete
      workspace.writeFile("to-delete.txt", "This file should be deleted");

      // Verify the file exists before deletion
      expect(workspace.readFile("to-delete.txt")).toEqual("This file should be deleted");

      await fileContents({
        options: {
          file: "to-delete.txt",
          template: REMOVE,
        },
      }).check(workspace.context);

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "to-delete.txt",
          hasFixer: true,
          message: "File should not exist",
        }),
      );

      // Verify the file has been deleted after running the fixer
      expect(() => workspace.readFile("to-delete.txt")).toThrow();
    });

    it("handles REMOVE for non-existent file", async () => {
      // Test deleting a file that doesn't exist - with the fix, this should not report an error
      // because actualContent (REMOVE) === expectedContent (REMOVE)
      await fileContents({
        options: {
          file: "non-existent.txt",
          template: REMOVE,
        },
      }).check(workspace.context);

      // Should not add any errors since the desired state (file not existing) is already achieved
      expect(spy).toHaveBeenCalledTimes(0);

      // Verify the file still doesn't exist
      // Both host implementations should now throw when trying to read non-existent files
      expect(() => workspace.readFile("non-existent.txt")).toThrow();
    });
  });

  describe("Generator function error handling", () => {
    let workspace: TestingWorkspace;
    let spy: MockInstance<(opts: AddErrorOptions) => void>;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: true,
        host: hostFactory.make(),
      });
      spy = vi.spyOn(workspace.context, "addError");
    });

    it("handles generator function that throws an exception", async () => {
      const errorMessage = "Generator function failed";
      const throwingGenerator = () => {
        throw new Error(errorMessage);
      };

      await fileContents({
        options: {
          file: "test.txt",
          generator: throwingGenerator,
        },
      }).check(workspace.context);

      expect(spy).toHaveBeenCalledTimes(1);
      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "test.txt",
          hasFixer: false, // This should be an unfixable error
          message: `Generator function failed: ${errorMessage}`,
        }),
      );
      expect(failure.longMessage).toContain(
        `The generator function for file "test.txt" threw an error:`,
      );
      expect(failure.longMessage).toContain(errorMessage);
    });

    it("handles generator function that returns a rejected Promise", async () => {
      const errorMessage = "Async generator failed";
      const rejectingGenerator = () => Promise.reject(new Error(errorMessage));

      await fileContents({
        options: {
          file: "test.txt",
          generator: rejectingGenerator,
        },
      }).check(workspace.context);

      expect(spy).toHaveBeenCalledTimes(1);
      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "test.txt",
          hasFixer: false, // This should be an unfixable error
          message: `Generator function failed: ${errorMessage}`,
        }),
      );
      expect(failure.longMessage).toContain(
        `The generator function for file "test.txt" threw an error:`,
      );
      expect(failure.longMessage).toContain(errorMessage);
    });

    it("handles generator function that returns non-string value", async () => {
      const invalidGenerator = () => 123 as any; // Cast to any to bypass TypeScript

      await fileContents({
        options: {
          file: "test.txt",
          generator: invalidGenerator,
        },
      }).check(workspace.context);

      expect(spy).toHaveBeenCalledTimes(1);
      const failure: Failure = spy.mock.calls[0][0];
      expect(failure).toMatchObject(
        workspace.failureMatcher({
          file: "test.txt",
          hasFixer: false, // This should be an unfixable error
          message:
            "Generator function failed: Generator function must return a string or REMOVE, got number",
        }),
      );
      expect(failure.longMessage).toContain(
        `The generator function for file "test.txt" threw an error:`,
      );
      expect(failure.longMessage).toContain(
        "Generator function must return a string or REMOVE, got number",
      );
    });
  });

  describe("Template file error scenarios", () => {
    let workspace: TestingWorkspace;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: true,
        host: hostFactory.make(),
      });
    });

    it("handles non-existent template file", async () => {
      await expect(
        fileContents({
          options: {
            file: "test.txt",
            templateFile: "non-existent-template.txt",
          },
        }).check(workspace.context),
      ).rejects.toThrow(); // Should throw when trying to read non-existent template
    });

    it("handles template file read permission errors", async () => {
      // Create a file that simulates permission error by using invalid path
      await expect(
        fileContents({
          options: {
            file: "test.txt",
            templateFile: "\0invalid-path/template.txt", // Null byte in path
          },
        }).check(workspace.context),
      ).rejects.toThrow(); // Should throw when trying to read invalid path
    });
  });

  describe("File system permission errors", () => {
    let workspace: TestingWorkspace;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: true,
        host: hostFactory.make(),
      });
    });

    it("handles unwritable directory scenarios", async () => {
      const spy = vi.spyOn(workspace.context, "addError");

      // Try to write to a path with null bytes (invalid on most filesystems)
      // This should properly expect an error to be thrown since null bytes are invalid paths
      await expect(
        fileContents({
          options: {
            file: "\0invalid-dir/test.txt",
            template: "test content",
          },
        }).check(workspace.context),
      ).rejects.toThrow(/Invalid file path.*null bytes/);

      // The spy should not have been called because the error should occur before adding to errors
      expect(spy).not.toHaveBeenCalled();
    });

    it("gracefully handles directory creation for nested files", async () => {
      const spy = vi.spyOn(workspace.context, "addError");

      await fileContents({
        options: {
          file: "deeply/nested/path/test.txt",
          template: "nested content",
        },
      }).check(workspace.context);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(workspace.readFile("deeply/nested/path/test.txt")).toEqual("nested content");
    });
  });

  describe("Edge cases and file operations", () => {
    let workspace: TestingWorkspace;
    let spy: MockInstance<(opts: AddErrorOptions) => void>;

    beforeEach(async () => {
      workspace = await createTestingWorkspace({
        fixFlag: true,
        host: hostFactory.make(),
      });
      spy = vi.spyOn(workspace.context, "addError");
    });

    it("handles empty string content correctly", async () => {
      const spy = vi.spyOn(workspace.context, "addError");

      await fileContents({
        options: {
          file: "empty.txt",
          template: "",
        },
      }).check(workspace.context);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(workspace.readFile("empty.txt")).toEqual("");
    });

    it("handles very long file content", async () => {
      const longContent = "a".repeat(10000);
      await fileContents({
        options: {
          file: "long.txt",
          template: longContent,
        },
      }).check(workspace.context);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(workspace.readFile("long.txt")).toEqual(longContent);
    });

    it("handles file with special characters in content", async () => {
      const specialContent = "Hello\nWorld\t\r\n🚀";
      await fileContents({
        options: {
          file: "special.txt",
          template: specialContent,
        },
      }).check(workspace.context);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(workspace.readFile("special.txt")).toEqual(specialContent);
    });
  });

  describe("Options Validation", () => {
    it("should accept valid options", () => {
      const ruleModule1 = fileContents({
        options: { file: "README.md", generator: () => "Generated content" },
      });
      const ruleModule2 = fileContents({
        options: { file: "LICENSE", template: "MIT License content" },
      });
      const ruleModule3 = fileContents({
        options: { file: ".gitignore", templateFile: "templates/gitignore.txt" },
      });

      // With generator function
      expect(() =>
        ruleModule1.validateOptions({
          file: "README.md",
          generator: () => "Generated content",
        })
      ).not.toThrow();

      // With template string
      expect(() =>
        ruleModule2.validateOptions({
          file: "LICENSE",
          template: "MIT License content",
        })
      ).not.toThrow();

      // With template file
      expect(() =>
        ruleModule3.validateOptions({
          file: ".gitignore",
          templateFile: "templates/gitignore.txt",
        })
      ).not.toThrow();

      // With template undefined (delete file)
      expect(() =>
        ruleModule2.validateOptions({
          file: "temp.txt",
          template: REMOVE,
        })
      ).not.toThrow();
    });

    it("should reject invalid options", () => {
      const ruleModule = fileContents({ options: { file: "test.txt", template: "content" } });

      // Missing one of generator/template/templateFile

      expect(() =>
        ruleModule.validateOptions(
          // @ts-expect-error testing invalid input
          { file: "test.txt" },
        )
      ).toThrow();

      // Multiple sources not allowed by union type structure
      expect(() =>
        ruleModule.validateOptions(
          // @ts-expect-error testing invalid input
          {
            file: "test.txt",
            generator: () => "",
            template: "content",
          },
        )
      ).toThrow();

      // Missing file property
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({ template: "content" })).toThrow();
    });
  });
});
