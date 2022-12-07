/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/config";
import { diff } from "jest-diff";
import * as r from "runtypes";
import { createNewRuleConversion } from "./util/createNewRuleConversion.js";
const Options = r
  .Record({
    ignoredDependencies: r.Array(r.String).Or(r.Undefined),
  })
  .Or(r.Undefined);
export type Options = r.Static<typeof Options>;

const skippedVersions = ["*", "latest"];

export const consistentDependencies = {
  check: function expectConsistentDependencies(context: Context, args: Options) {
    checkDeps(context, args, "dependencies");
    checkDeps(context, args, "devDependencies");
    // we don't check peer deps since they can be more lenient
  },
  optionsRuntype: Options,
} as RuleModule<typeof Options>;

export const ConsistentDependencies = createNewRuleConversion("ConsistentDependencies", consistentDependencies);

function checkDeps(context: Context, args: Options, block: "dependencies" | "devDependencies" | "peerDependencies") {
  const packageJson = context.getPackageJson();
  const packagePath = context.getPackageJsonPath();
  const dependencies = packageJson[block];

  const workspacePackageJson = context.getWorkspaceContext().getPackageJson();
  const workspaceDependencies = workspacePackageJson[block];

  const ignoredDeps = args?.ignoredDependencies ?? [];
  const depsToCheck =
    workspaceDependencies == null || ignoredDeps.length === 0
      ? workspaceDependencies
      : omit(workspaceDependencies, ignoredDeps);

  if (dependencies === undefined || depsToCheck === undefined) {
    return;
  }

  const expectedDependencies = {
    ...dependencies,
    ...filterKeys(depsToCheck, dependencies),
  };

  if (JSON.stringify(dependencies) !== JSON.stringify(expectedDependencies)) {
    context.addError({
      file: packagePath,
      message: `Inconsistent ${block} with root in package.json`,
      longMessage: diff(expectedDependencies, dependencies, { expand: true }),
      fixer: () => {
        const newPackageJson = { ...packageJson };
        newPackageJson[block] = expectedDependencies;
        context.host.writeJson(packagePath, newPackageJson);
      },
    });
  }
}

function filterKeys(ob: Record<string, string>, filterOb: Record<string, string>) {
  const newOb: Record<string, any> = {};

  for (const key of Object.keys(filterOb)) {
    if (ob[key] !== undefined && skippedVersions.indexOf(filterOb[key]) === -1) {
      newOb[key] = ob[key];
    }
  }

  return newOb;
}

function omit<T>(obj: Record<string, T>, keysToOmit: readonly string[]): Record<string, T> {
  const newObj: Record<string, T> = {};

  const filtered = Object.entries(obj).filter(([key]) => !keysToOmit.includes(key));
  for (const [key, value] of filtered) {
    newObj[key] = value;
  }

  return newObj;
}
