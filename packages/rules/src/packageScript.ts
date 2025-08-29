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
  scripts: z.record(
    z.string(),
    z.union([
      z.string(),
      ZodRemove, // Allow direct REMOVE values like { "build": REMOVE }
      z.object({
        options: z.array(z.union([
          z.string(),
          z.undefined(),
          ZodRemove,
        ])),
        fixValue: z.union([
          z.string(),
          z.undefined(),
          z.literal(false),
          ZodRemove,
        ]).optional(),
      }),
    ]),
  ), // string => string | REMOVE | object
});

export type Options = z.infer<typeof Options>;

export const MSG_NO_SCRIPTS_BLOCK = "No scripts block in package.json";

export const packageScript = createRuleFactory<Options>({
  name: "packageScript",
  check: (context, options) => {
    const packageJson = context.getPackageJson();
    if (packageJson.scripts === undefined) {
      context.addError({
        file: context.getPackageJsonPath(),
        message: MSG_NO_SCRIPTS_BLOCK,
        fixer: () => {
          mutateJson<PackageJson>(
            context.getPackageJsonPath(),
            context.host,
            (input) => {
              input.scripts = {};
              return input;
            },
          );
        },
      });
      return;
    }
    for (const [name, value] of Object.entries(options.scripts)) {
      const allowedValues = new Set<string | undefined | typeof REMOVE>();
      let fixValue: string | undefined | false | typeof REMOVE;
      let allowEmpty = false;
      let fixToEmpty = false;
      let fixToRemove = false;

      if (typeof value === "string") {
        allowedValues.add(value);
        fixValue = value;
      } else if (value === REMOVE) {
        // Handle direct REMOVE value: script should be removed
        allowedValues.add(REMOVE);
        fixValue = REMOVE;
        fixToRemove = true;
      } else {
        for (const q of value.options) {
          if (q === undefined) {
            allowEmpty = true;
          } else if (q === REMOVE) {
            allowEmpty = true;
          }
          allowedValues.add(q);
        }
        fixToEmpty = Object.prototype.hasOwnProperty.call(value, "fixValue")
          && value.fixValue === undefined;
        fixToRemove = Object.prototype.hasOwnProperty.call(value, "fixValue")
          && value.fixValue === REMOVE;
        fixValue = value.fixValue;
      }

      const actualValue = packageJson.scripts[name];

      // Special handling for direct REMOVE: only error if script exists
      if (value === REMOVE) {
        if (actualValue !== undefined) {
          // Script exists but should be removed
          const fixer = () => {
            mutateJson<PackageJson>(
              context.getPackageJsonPath(),
              context.host,
              (input) => {
                delete input.scripts![name];
                return input;
              },
            );
          };

          context.addError({
            file: context.getPackageJsonPath(),
            message: `Script '${name}' should be removed`,
            fixer,
          });
        }
        // If script doesn't exist, no error needed
        continue;
      }

      if (
        !allowedValues.has(actualValue)
        && !(allowEmpty === true && actualValue === undefined)
      ) {
        let fixer;

        if (
          fixValue !== false
          && (fixValue !== undefined || fixToEmpty === true || fixToRemove === true)
        ) {
          const q = fixValue;
          fixer = () => {
            mutateJson<PackageJson>(
              context.getPackageJsonPath(),
              context.host,
              (input) => {
                if ((fixToEmpty && q === undefined) || (fixToRemove && q === REMOVE)) {
                  delete input.scripts![name];
                } else {
                  input.scripts![name] = q as string;
                }
                return input;
              },
            );
          };
        }

        const validOptionsString = Array.from(allowedValues.values())
          .map((a) => (a === undefined || a === REMOVE ? "(empty)" : `'${a}'`))
          .join(", ");

        context.addError({
          file: context.getPackageJsonPath(),
          message:
            `Expected standardized script entry for '${name}'. Valid options: ${validOptionsString}`,
          longMessage: diff(
            validOptionsString + "\n",
            (packageJson.scripts[name] || "") + "\n",
          ),
          fixer,
        });
      }
    }
  },
  validateOptions: Options.parse,
});
