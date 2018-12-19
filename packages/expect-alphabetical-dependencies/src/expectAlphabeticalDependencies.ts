/*!
 * Copyright (c) 2018 monorepo-lint (http://monorepo-lint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepo-lint/core";
import { writeJson } from "@monorepo-lint/utils";
import diff from "jest-diff";

export default function expectAlphabeticalDependencies(
  context: Context,
  // tslint:disable-next-line:variable-name
  _opts: {}
) {
  checkAlpha(context, "dependencies");
  checkAlpha(context, "devDependencies");
  checkAlpha(context, "peerDependencies");
}

function checkAlpha(
  context: Context,
  block: "dependencies" | "devDependencies" | "peerDependencies"
) {
  const packageJson = context.getPackageJson();
  const packagePath = context.getPackageJsonPath();

  const dependencies = packageJson[block];

  if (dependencies === undefined) {
    return;
  }

  const actualOrder = Object.keys(dependencies);
  const expectedOrder = actualOrder.slice().sort(); // sort mutates, so we need to copy the previous result

  if (!arrayOrderCompare(actualOrder, expectedOrder)) {
    context.addError({
      file: packagePath,
      message: `Incorrect order of ${block} in package.json`,
      longMessage: diff(expectedOrder, actualOrder, { expand: true }),
      fixer: () => {
        const expectedDependencies: Record<string, string> = {};

        expectedOrder.forEach(dep => {
          expectedDependencies[dep] = dependencies[dep];
        });

        const newPackageJson = { ...packageJson };
        newPackageJson[block] = expectedDependencies;
        writeJson(packagePath, newPackageJson);
      }
    });
  }
}

function arrayOrderCompare(a: ReadonlyArray<string>, b: ReadonlyArray<string>) {
  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) {
      return false;
    }
  }

  return true;
}
