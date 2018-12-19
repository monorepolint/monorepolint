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

export const Options = r.Record({
  bannedDependencies: r.Array(r.String)
});
export type Options = r.Static<typeof Options>;
const ruleModule: RuleModule<typeof Options> = {
  check: function expectAlphabeticalDependencies(
    context: Context,
    opts: Options
  ) {
    const { bannedDependencies } = opts;

    checkBanned(context, bannedDependencies, "dependencies");
    checkBanned(context, bannedDependencies, "devDependencies");
    checkBanned(context, bannedDependencies, "peerDependencies");
  },
  optionsRuntype: Options
};
export default ruleModule;

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
