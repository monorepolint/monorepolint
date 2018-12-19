/*!
 * Copyright (c) 2018 monorepo-lint (http://monorepo-lint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepo-lint/core";
import { writeJson } from "@monorepo-lint/utils";
import diff from "jest-diff";
import * as r from "runtypes";

export type OrderFunction = ((context: Context) => (a: string, b: string) => number);

export const Options = r.Record({
  order: r.Union(r.Array(r.String), r.Function)
});

export interface Options extends r.Static<typeof Options> {
  readonly order: string[] | OrderFunction;
}

export default {
  check: function expectPackageOrder(context: Context, { order }: Options) {
    const packageJson = context.getPackageJson();
    const packagePath = context.getPackageJsonPath();

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

          writeJson(packagePath, expectedPackageJson);
        }
      });
    }
  },
  optionsRuntype: Options
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
  // tslint:disable-next-line:only-arrow-functions
  return function(a: string, b: string) {
    return order.indexOf(a) - order.indexOf(b);
  };
}

function isOrderFunction(order: ReadonlyArray<string> | OrderFunction): order is OrderFunction {
  return !Array.isArray(order);
}
