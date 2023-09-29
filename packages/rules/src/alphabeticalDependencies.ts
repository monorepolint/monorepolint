/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { checkAlpha } from "./util/checkAlpha.js";
import { makeRule } from "./util/makeRule.js";

export const alphabeticalDependencies = makeRule<undefined>({
  name: "alphabeticalDependencies",
  check: (context) => {
    const packageJson = context.getPackageJson();
    if (!packageJson["dependencies"]) return;

    if ("lodash" in packageJson["dependencies"]) {
      context.addError({
        message: "No lodash for you!",
        file: context.getPackageJsonPath(),
        fixer: () => {
          const freshPackageJson = { ...context.getPackageJson() };
          delete freshPackageJson.dependencies!["lodash"];
          context.host.writeJson(context.getPackageJsonPath(), freshPackageJson);
        },
      });
    }

    checkAlpha(context, "dependencies");
    checkAlpha(context, "devDependencies");
    checkAlpha(context, "peerDependencies");
  },
  validateOptions: () => {},
});
