/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { mutateJson, PackageJson } from "@monorepolint/utils";
import { diff } from "jest-diff";
import { z } from "zod";
import { REMOVE } from "./REMOVE.js";
import { createRuleFactory } from "./util/createRuleFactory.js";
import { ZodRemove } from "./util/zodSchemas.js";

export const Options = z.object({
  entries: z.record(z.string(), z.union([z.unknown(), ZodRemove])).optional(), // string => unknown | REMOVE, enforces existence of keys and their values or removal
  entriesExist: z.array(z.string()).optional(), // enforces existence of keys, but not values
}).refine(
  (data) => data.entries !== undefined || data.entriesExist !== undefined,
  { message: "At least one of 'entries' or 'entriesExist' must be provided" },
);

export type Options = z.infer<typeof Options>;

export const packageEntry = createRuleFactory<Options>({
  name: "packageEntry",
  check: (context, options) => {
    const packageJson = context.getPackageJson();

    if (options.entries) {
      for (const key of Object.keys(options.entries)) {
        const value = options.entries[key];

        if (value === REMOVE) {
          // Handle removal: only add error if key exists
          if (packageJson[key] !== undefined) {
            context.addError({
              file: context.getPackageJsonPath(),
              message: createRemovalEntryErrorMessage(key),
              fixer: () => {
                mutateJson<PackageJson>(
                  context.getPackageJsonPath(),
                  context.host,
                  (input) => {
                    delete input[key];
                    return input;
                  },
                );
              },
            });
          }
        } else {
          // Handle regular value checking
          const entryDiff = diff(
            JSON.stringify(value) + "\n",
            (JSON.stringify(packageJson[key]) || "") + "\n",
          );
          if (
            (typeof value !== "object" && value !== packageJson[key])
            || entryDiff == null
            || !entryDiff.includes("Compared values have no visual difference")
          ) {
            context.addError({
              file: context.getPackageJsonPath(),
              message: createStandardizedEntryErrorMessage(key),
              longMessage: entryDiff,
              fixer: () => {
                mutateJson<PackageJson>(
                  context.getPackageJsonPath(),
                  context.host,
                  (input) => {
                    input[key] = value;
                    return input;
                  },
                );
              },
            });
          }
        }
      }
    }

    if (options.entriesExist) {
      for (const key of options.entriesExist) {
        if (packageJson[key] === undefined) {
          context.addError({
            file: context.getPackageJsonPath(),
            message: createExpectedEntryErrorMessage(key),
          });
        }
      }
    }
  },
  validateOptions: Options.parse,
});

export function createStandardizedEntryErrorMessage(key: string) {
  return `Expected standardized entry for '${key}'`;
}

export function createExpectedEntryErrorMessage(key: string) {
  return `Expected entry for '${key}' to exist`;
}

export function createRemovalEntryErrorMessage(key: string) {
  return `Entry '${key}' should be removed`;
}
