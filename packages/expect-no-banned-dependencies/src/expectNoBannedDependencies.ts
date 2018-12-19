/*!
 * Copyright (c) 2018 monorepo-lint (http://monorepo-lint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepo-lint/core";
import { writeJson } from "@monorepo-lint/utils";
import diff from "jest-diff";

export interface Opts {
  readonly bannedDependencies: ReadonlyArray<string>;
}

export default function expectAlphabeticalDependencies(
  context: Context,
  opts: Opts
) {
  const { bannedDependencies } = opts;

  checkBanned(context, bannedDependencies, "dependencies");
  checkBanned(context, bannedDependencies, "devDependencies");
  checkBanned(context, bannedDependencies, "peerDependencies");
}

function checkBanned(
  context: Context,
  bannedDependencies: ReadonlyArray<string>,
  block: "dependencies" | "devDependencies" | "peerDependencies"
) {
  const packageJson = context.getPackageJson();
  const packagePath = context.getPackageJsonPath();

  const dependencies = packageJson[block];

  if (dependencies === undefined) {
    return;
  }

  const expectedDependencies: Record<string, string> = {};

  for (const key of Object.keys(dependencies)) {
    if (bannedDependencies.indexOf(key) < 0) {
      expectedDependencies[key] = dependencies[key];
    }
  }

  if (
    Object.keys(expectedDependencies).length !==
    Object.keys(dependencies).length
  ) {
    context.addError({
      file: packagePath,
      message: `Banned depdendencies in ${block} in package.json`,
      longMessage: diff(expectedDependencies, dependencies, { expand: true }),
      fixer: () => {
        const newPackageJson = { ...packageJson };
        newPackageJson[block] = expectedDependencies;
        writeJson(packagePath, newPackageJson);
      }
    });
  }
}
