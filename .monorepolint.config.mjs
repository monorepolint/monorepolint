/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// @ts-check
import * as Rules from "@monorepolint/rules";

const DOCS = "@monorepolint/docs";

/** @type {import("./packages/config").Config} */
const config = {
  rules: [
    new Rules.StandardTsConfig({
      options: {
        templateFile: "./templates/tsconfig.json",
      },
      excludePackages: [DOCS],
    }),
    new Rules.FileContents({
      options: {
        file: "jest.config.cjs",
        templateFile: "./templates/jest.config.cjs",
      },
      excludePackages: [DOCS],
    }),
    new Rules.PackageScript({
      options: {
        scripts: {
          clean: "rm -rf build dist lib node_modules *.tgz tsconfig.tsbuildinfo",
          "compile-typescript": "../../node_modules/.bin/tsc --build",
          "lint:typescript": "../../node_modules/.bin/tslint --config ../../tslint.json --project .",
          "test:watch": "NODE_OPTIONS=--experimental-vm-modules ../../node_modules/.bin/jest --colors --passWithNoTests --watch",
          test: "NODE_OPTIONS=--experimental-vm-modules ../../node_modules/.bin/jest --colors --passWithNoTests",
        },
      },
      excludePackages: [DOCS],
    }),
    new Rules.PackageOrder({}),
    new Rules.AlphabeticalDependencies({}),
    new Rules.AlphabeticalScripts({}),
    new Rules.ConsistentDependencies({}),
    new Rules.BannedDependencies({
      options: {
        bannedDependencies: ["lodash"],
      },
    }),
  ],
};
export default config;
