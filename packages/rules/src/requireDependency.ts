/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepolint/config";
import { mutateJson, PackageJson } from "@monorepolint/utils";
import { diff } from "jest-diff";
import { z } from "zod";
import { REMOVE } from "./REMOVE.js";
import { createRuleFactory } from "./util/createRuleFactory.js";
import { ZodRemove } from "./util/zodSchemas.js";

const Options = z.object({
  dependencies: z.record(
    z.string(),
    z.union([
      z.string(),
      ZodRemove,
    ]).optional(),
  ).optional(),
  devDependencies: z.record(
    z.string(),
    z.union([
      z.string(),
      ZodRemove,
    ]).optional(),
  ).optional(),
  peerDependencies: z.record(
    z.string(),
    z.union([
      z.string(),
      ZodRemove,
    ]).optional(),
  ).optional(),
  optionalDependencies: z.record(
    z.string(),
    z.union([
      z.string(),
      ZodRemove,
    ]).optional(),
  ).optional(),
}).partial();

type Options = z.infer<typeof Options>;

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
                Object.entries(expectedEntries).filter(([, v]) => v !== undefined && v !== REMOVE),
              ) as Record<string, string>;
              return input;
            });
          },
        });
        return;
      }

      for (const [dep, version] of Object.entries(options[type]!)) {
        if (version === REMOVE) {
          // Handle removal: only add error if dependency exists
          if (packageJson[type]?.[dep] !== undefined) {
            context.addError({
              file: packageJsonPath,
              message: `Dependency ${dep} should be removed`,
              fixer: () => {
                mutateJson<PackageJson>(
                  packageJsonPath,
                  context.host,
                  (input) => {
                    input[type] = { ...input[type] };
                    delete input[type][dep];
                    return input;
                  },
                );
              },
            });
          }
        } else if (packageJson[type]?.[dep] !== version) {
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
                  input[type] = { ...input[type], [dep]: version as string };
                  return input;
                },
              );
            },
          });
        }
      }
    });
  },
  validateOptions: Options.parse,
});
