/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/core";
import diff from "jest-diff";
import * as r from "runtypes";

type OrderFunction = (context: Context) => (a: string, b: string) => number;

const Options = r
  .Record({
    order: r.Union(r.Array(r.String), r.Function),
  })
  .Or(r.Undefined);

type Options = r.Static<typeof Options>;

const defaultKeyOrder = [
  "name",
  "version",
  "description",
  "author",
  "contributors",
  "url",
  "license",
  "private",
  "engines",
  "bin",
  "main",
  "module",
  "typings",
  "style",
  "sideEffects",
  "workspaces",
  "husky",
  "lint-staged",
  "files",
  "scripts",
  "resolutions",
  "dependencies",
  "peerDependencies",
  "devDependencies",
  "optionalDependencies",
  "publishConfig",
];

export const packageOrder = {
  check: function expectPackageOrder(context: Context, opts: Options) {
    const packageJson = context.getPackageJson();
    const packagePath = context.getPackageJsonPath();

    const order: string[] | OrderFunction = opts === undefined ? defaultKeyOrder : opts.order;

    const compartor = isOrderFunction(order) ? order(context) : createCompartor(order);

    const actualOrder = Object.keys(packageJson);
    const expectedOrder = actualOrder.slice().sort(compartor); // sort mutates, so we need to copy the previous result

    if (!arrayOrderCompare(actualOrder, expectedOrder)) {
      context.addError({
        file: packagePath,
        message: "Incorrect order of fields in package.json",
        longMessage: diff(expectedOrder, actualOrder, { expand: true }),
        fixer: () => {
          const expectedPackageJson: Record<string, any> = {};

          expectedOrder.forEach(key => {
            expectedPackageJson[key] = packageJson[key];
          });

          context.fileSystem.writeJson(packagePath, expectedPackageJson);
        },
      });
    }
  },
  optionsRuntype: Options,
} as RuleModule<typeof Options>;

function arrayOrderCompare(a: ReadonlyArray<string>, b: ReadonlyArray<string>) {
  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) {
      return false;
    }
  }

  return true;
}

function createCompartor(order: ReadonlyArray<string>) {
  return (a: string, b: string) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);

    // if one of the two is missing from the order array, push it further down
    if (aIndex >= 0 && bIndex < 0) {
      return -1;
    } else if (aIndex < 0 && bIndex >= 0) {
      return 1;
    }

    // otherwise compare the indexes and use alphabetical as a tie breaker
    const compared = aIndex - bIndex;

    if (compared !== 0) {
      return compared;
    } else {
      return a.localeCompare(b);
    }
  };
}

function isOrderFunction(order: ReadonlyArray<string> | OrderFunction): order is OrderFunction {
  return !Array.isArray(order);
}
