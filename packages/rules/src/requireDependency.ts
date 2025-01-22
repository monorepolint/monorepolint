/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepolint/config";
import { mutateJson, PackageJson } from "@monorepolint/utils";
import { diff } from "jest-diff";
import * as r from "runtypes";
import { createRuleFactory } from "./util/createRuleFactory.js";

const Options = r.Partial({
  dependencies: r.Dictionary(r.String.optional()),
  devDependencies: r.Dictionary(r.String.optional()),
  peerDependencies: r.Dictionary(r.String.optional()),
  optionalDependencies: r.Dictionary(r.String.optional()),
});

type Options = r.Static<typeof Options>;

export const requireDependency = createRuleFactory({
  name: "requireDependency",
  check: function expectPackageEntry(context: Context, options: Options) {
    const packageJson = context.getPackageJson();
    const packageJsonPath = context.getPackageJsonPath();

    [
      "dependencies" as const,
      "devDependencies" as const,
      "peerDependencies" as const,
      "optionalDependencies" as const,
    ].forEach((type) => {
      const expectedEntries = options[type];
      if (!expectedEntries) {
        return;
      }

      if (packageJson[type] === undefined) {
        context.addError({
          file: packageJsonPath,
          message: `No ${type} block, cannot add required ${type}.`,
          fixer: () => {
            mutateJson<PackageJson>(packageJsonPath, context.host, (input) => {
              input[type] = Object.fromEntries(
                Object.entries(expectedEntries).filter(([, v]) =>
                  v !== undefined
                ),
              ) as Record<string, string>;
              return input;
            });
          },
        });
        return;
      }

      for (const [dep, version] of Object.entries(options[type]!)) {
        if (packageJson[type]?.[dep] !== version) {
          context.addError({
            file: packageJsonPath,
            message: `Expected dependency ${dep}@${version}`,
            longMessage: diff(
              `${dep}@${version}\n`,
              `${dep}@${packageJson[type]![dep] || "missing"}\n`,
            )!,
            fixer: () => {
              mutateJson<PackageJson>(
                packageJsonPath,
                context.host,
                (input) => {
                  if (version === undefined) {
                    input[type] = { ...input[type] };
                    delete input[type][dep];
                  } else {
                    input[type] = { ...input[type], [dep]: version };
                  }
                  return input;
                },
              );
            },
          });
        }
      }
    });
  },
  validateOptions: Options.check,
});
