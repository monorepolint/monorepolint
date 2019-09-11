/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

const REMOVE_SCRIPT = {
  options: [undefined],
  fixValue: undefined,
};

module.exports = {
  rules: {
    ":standard-tsconfig": {
      options: {
        templateFile: "./templates/tsconfig.json",
      },
    },
    ":file-contents": {
      options: {
        file: "jest.config.js",
        templateFile: "./templates/jest.config.js",
      },
    },
    ":package-script": {
      options: {
        scripts: {
          "clean": "rm -rf build lib node_modules *.tgz tsconfig.tsbuildinfo",
          "compile:typescript": "tsc --build",
          "lint": "npm-run-all -p lint:*",
          "lint:typescript": "tslint --config ../../tslint.json --project .",
          "test:watch": "jest --colors --passWithNoTests --watch",
          "test": {
            options: ["jest --colors --passWithNoTests", "jest --colors"],
          },
          "jest": REMOVE_SCRIPT,
          "jest:watch": REMOVE_SCRIPT,
        },
      },
    },
    ":package-order": true,
    ":alphabetical-dependencies": true,
    ":consistent-dependencies": true,
    ":banned-dependencies": {
      options: {
        bannedDependencies: ["lodash"],
      },
    },
  },
};
