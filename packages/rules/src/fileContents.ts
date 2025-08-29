/*!
 * Copyright 2023 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepolint/config";
import { diff } from "jest-diff";
import * as path from "path";
import { z } from "zod";
import { REMOVE } from "./REMOVE.js";
import { createRuleFactory } from "./util/createRuleFactory.js";
import { ZodRemove } from "./util/zodSchemas.js";

const Options = z.union([
  z.object({
    file: z.string(),
    generator: z.custom<
      (context: Context) => string | typeof REMOVE | Promise<string | typeof REMOVE>
    >((val) => {
      return typeof val === "function";
    }),
    template: z.undefined().optional(),
    templateFile: z.undefined().optional(),
  }),
  z.object({
    file: z.string(),
    generator: z.undefined().optional(),
    template: z.union([
      z.string(),
      ZodRemove,
    ]),
    templateFile: z.undefined().optional(),
  }),
  z.object({
    file: z.string(),
    generator: z.undefined().optional(),
    template: z.undefined().optional(),
    templateFile: z.string(),
  }),
]);

type Options = z.infer<typeof Options>;

export const fileContents = createRuleFactory<Options>({
  name: "fileContents",
  check: async (context, opts) => {
    const fullPath = path.join(context.packageDir, opts.file);

    // Validate that the file path doesn't contain null bytes or other invalid characters
    if (fullPath.includes("\0")) {
      throw new Error(`Invalid file path: path contains null bytes`);
    }

    const expectedContent = await getExpectedContents(context, opts);

    // If the generator function failed, an unfixable error was already added, so we should return early
    if (expectedContent === Symbol.for("GENERATOR_ERROR")) {
      return;
    }

    const pathExists = context.host.exists(fullPath);
    const actualContent = pathExists
      ? context.host.readFile(fullPath, { encoding: "utf-8" })
      : REMOVE;
    if (actualContent !== expectedContent) {
      const longMessage =
        pathExists && (expectedContent === undefined || expectedContent === REMOVE)
          ? undefined
          : diff(expectedContent, actualContent, { expand: true });

      const message = pathExists && (expectedContent === undefined || expectedContent === REMOVE)
        ? "File should not exist"
        : "Expect file contents to match";

      context.addError({
        file: fullPath,
        message,
        longMessage,
        fixer: () => {
          if (expectedContent === REMOVE) {
            if (pathExists) context.host.deleteFile(fullPath);
          } else if (expectedContent !== undefined && typeof expectedContent === "string") {
            context.host.mkdir(path.dirname(fullPath), { recursive: true });
            context.host.writeFile(fullPath, expectedContent, {
              encoding: "utf-8",
            });
          }
        },
      });
    }
  },
  validateOptions: Options.parse,
});

const optionsCache = new Map<
  Options,
  | ((context: Context) => Promise<string | typeof REMOVE> | string | typeof REMOVE)
  | string
  | typeof REMOVE
>();

async function getExpectedContents(
  context: Context,
  opts: Options,
): Promise<string | typeof REMOVE | symbol> {
  // we need to use has because undefined is a valid value in the cache
  if (optionsCache.has(opts)) {
    const cachedEntry = optionsCache.get(opts);
    if (cachedEntry && typeof cachedEntry === "function") {
      return cachedEntry(context);
    }
    return cachedEntry as string | typeof REMOVE;
  }

  if (opts.generator) {
    optionsCache.set(opts, opts.generator);
    try {
      const result = await opts.generator(context);
      if (typeof result !== "string" && result !== REMOVE) {
        throw new Error(`Generator function must return a string or REMOVE, got ${typeof result}`);
      }
      return result;
    } catch (error) {
      // Instead of throwing, create an unfixable error and return a special marker
      const errorMessage = error instanceof Error ? error.message : String(error);
      const fullPath = path.join(context.packageDir, opts.file);

      context.addError({
        file: fullPath,
        message: `Generator function failed: ${errorMessage}`,
        longMessage:
          `The generator function for file "${opts.file}" threw an error:\n\n${errorMessage}`,
      });

      // Return a special marker that will prevent the file comparison from proceeding
      return Symbol.for("GENERATOR_ERROR");
    }
  } else if (opts.templateFile) {
    const { packageDir: workspacePackageDir } = context.getWorkspaceContext();
    const fullPath = path.resolve(workspacePackageDir, opts.templateFile);
    const template = context.host.readFile(fullPath, { encoding: "utf-8" });

    optionsCache.set(opts, template);
    return template;
  } else if (opts.template !== undefined) {
    optionsCache.set(opts, opts.template);
    return opts.template;
  } else {
    throw new Error("Unable to get expected contents");
  }
}
