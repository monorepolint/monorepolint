/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

// @ts-check

const Rules = require("@monorepolint/rules");

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
        file: "jest.config.js",
        templateFile: "./templates/jest.config.js",
      },
      excludePackages: [DOCS],
    }),
    new Rules.PackageScript({
      options: {
        scripts: {
          clean: "rm -rf build lib node_modules *.tgz tsconfig.tsbuildinfo",
          "compile:typescript": "../../node_modules/.bin/tsc",
          "lint:typescript": "../../node_modules/.bin/tslint --config ../../tslint.json --project .",
          "test:watch": "../../node_modules/.bin/jest --colors --passWithNoTests --watch",
          test: "../../node_modules/.bin/jest --colors --passWithNoTests",
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
  // legacyRules: {
  //   ":file-contents": {
  //     options: {
  //       file: "jest.config.js",
  //       templateFile: "./templates/jest.config.js",
  //     },
  //     excludePackages: [DOCS],
  //   },
  //   ":package-script": {
  //     options: {
  //       scripts: {
  //         clean: "rm -rf build lib node_modules *.tgz tsconfig.tsbuildinfo",
  //         "compile:typescript": "../../node_modules/.bin/tsc",
  //         "lint:typescript": "../../node_modules/.bin/tslint --config ../../tslint.json --project .",
  //         "test:watch": "../../node_modules/.bin/jest --colors --passWithNoTests --watch",
  //         test: "../../node_modules/.bin/jest --colors --passWithNoTests",
  //       },
  //     },
  //     excludePackages: [DOCS],
  //   },
  //   ":package-order": true,
  //   ":alphabetical-dependencies": true,
  //   ":alphabetical-scripts": true,
  //   ":consistent-dependencies": true,
  //   ":banned-dependencies": {
  //     options: {
  //       bannedDependencies: ["lodash"],
  //     },
  //   },
  // },
};
module.exports = config;
