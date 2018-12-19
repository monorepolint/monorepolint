/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/core";
import { writeJson } from "@monorepolint/utils";
import diff from "jest-diff";
import * as r from "runtypes";

const Options = r.Undefined;

export default {
  check: function expectAlphabeticalDependencies(context: Context) {
    checkAlpha(context, "dependencies");
    checkAlpha(context, "devDependencies");
    checkAlpha(context, "peerDependencies");
  },
  optionsRuntype: Options
} as RuleModule<typeof Options>;

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
