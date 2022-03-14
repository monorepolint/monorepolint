/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepolint/core";
import diff from "jest-diff";

export function checkAlpha(
  context: Context,
  block: "dependencies" | "devDependencies" | "peerDependencies" | "scripts"
) {
  const packageJson = context.getPackageJson();
  const packagePath = context.getPackageJsonPath();

  const blockToSort = packageJson[block];

  if (blockToSort === undefined) {
    return;
  }

  const actualOrder = Object.keys(blockToSort);
  const expectedOrder = actualOrder.slice().sort(); // sort mutates, so we need to copy the previous result

  if (!arrayOrderCompare(actualOrder, expectedOrder)) {
    context.addError({
      file: packagePath,
      message: `Incorrect order of ${block} in ${packageJson.name}'s package.json`,
      longMessage: diff(expectedOrder, actualOrder, { expand: true }),
      fixer: () => {
        const expectedDependencies: Record<string, string> = {};

        expectedOrder.forEach((dep) => {
          expectedDependencies[dep] = blockToSort[dep];
        });

        const newPackageJson = { ...packageJson };
        newPackageJson[block] = expectedDependencies;
        context.host.writeJson(packagePath, newPackageJson);
      },
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
