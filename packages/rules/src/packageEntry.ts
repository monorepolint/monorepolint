/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/core";
import { mutateJson, PackageJson } from "@monorepolint/utils";
import diff from "jest-diff";
import * as r from "runtypes";

export const Options = r.Union(
  r
    .Record({
      entries: r.Dictionary(r.Unknown), // string => unknown, enforces existence of keys and their values
    })
    .And(
      r.Partial({
        entriesExist: r.Undefined,
      })
    ),
  r
    .Record({
      entriesExist: r.Array(r.String), // enforces existence of keys, but not values
    })
    .And(
      r.Partial({
        entries: r.Undefined,
      })
    ),
  r.Record({
    entries: r.Dictionary(r.Unknown), // string => unknown, enforces existence of keys and their values
    entriesExist: r.Array(r.String),
  })
);

export type Options = r.Static<typeof Options>;

export const packageEntry = {
  check: function expectPackageEntry(context: Context, options: Options) {
    const packageJson = context.getPackageJson();

    if (options.entries) {
      for (const key of Object.keys(options.entries)) {
        const value = options.entries[key];

        const entryDiff = diff(JSON.stringify(value) + "\n", (JSON.stringify(packageJson[key]) || "") + "\n");
        if (
          (typeof value !== "object" && value !== packageJson[key]) ||
          entryDiff == null ||
          !entryDiff.includes("Compared values have no visual difference")
        ) {
          context.addError({
            file: context.getPackageJsonPath(),
            message: `Expected standardized entry for '${key}'`,
            longMessage: entryDiff,
            fixer: () => {
              mutateJson<PackageJson>(context.getPackageJsonPath(), (input) => {
                input[key] = value;
                return input;
              });
            },
          });
        }
      }
    }

    if (options.entriesExist) {
      for (const key of options.entriesExist) {
        if (packageJson[key] === undefined) {
          context.addError({
            file: context.getPackageJsonPath(),
            message: `Expected entry for '${key}' to exist`,
          });
        }
      }
    }
  },
  optionsRuntype: Options,
} as RuleModule<typeof Options>;
