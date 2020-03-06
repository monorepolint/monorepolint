/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/core";
import { PackageJson } from "@monorepolint/utils";
import diff from "jest-diff";
import * as r from "runtypes";

export const Options = r.Record({
  scripts: r.Dictionary(
    r.Union(
      r.String,
      r
        .Record({
          options: r.Array(r.String.Or(r.Undefined)),
        })
        .And(
          r.Partial({
            fixValue: r.Union(r.String, r.Undefined, r.Literal(false)),
          })
        )
    )
  ), // string => string
});

export type Options = r.Static<typeof Options>;

export const MSG_NO_SCRIPTS_BLOCK = "No scripts block in package.json";

export const packageScript = {
  check: function expectPackageScript(context: Context, options: Options) {
    const packageJson = context.getPackageJson();
    if (packageJson.scripts === undefined) {
      context.addError({
        file: context.getPackageJsonPath(),
        message: MSG_NO_SCRIPTS_BLOCK,
        fixer: () => {
          context.fileSystem.mutateJson<PackageJson>(context.getPackageJsonPath(), input => {
            input.scripts = {};
            return input;
          });
        },
      });
      return;
    }
    for (const [name, value] of Object.entries(options.scripts)) {
      const allowedValues = new Set<string | undefined>();
      let fixValue: string | undefined | false;
      let allowEmpty = false;
      let fixToEmpty = false;

      if (typeof value === "string") {
        allowedValues.add(value);
        fixValue = value;
      } else {
        for (const q of value.options) {
          if (q === undefined) {
            allowEmpty = true;
          }
          allowedValues.add(q);
        }
        fixToEmpty = value.hasOwnProperty("fixValue") && value.fixValue === undefined;
        fixValue = value.fixValue;
      }

      const actualValue = packageJson.scripts[name];

      if (!allowedValues.has(actualValue) && !(allowEmpty === true && actualValue === undefined)) {
        let fixer;

        if (fixValue !== false && (fixValue !== undefined || fixToEmpty === true)) {
          const q = fixValue;
          fixer = () => {
            context.fileSystem.mutateJson<PackageJson>(context.getPackageJsonPath(), input => {
              if (fixToEmpty && q === undefined) {
                delete input.scripts![name];
              } else {
                input.scripts![name] = q!;
              }
              return input;
            });
          };
        }

        const validOptionsString = Array.from(allowedValues.values())
          .map(a => (a === undefined ? "(empty)" : `'${a}'`))
          .join(", ");

        context.addError({
          file: context.getPackageJsonPath(),
          message: `Expected standardized script entry for '${name}'. Valid options: ${validOptionsString}`,
          longMessage: diff(validOptionsString + "\n", (packageJson.scripts[name] || "") + "\n"),
          fixer,
        });
      }
    }
  },
  optionsRuntype: Options,
} as RuleModule<typeof Options>;
