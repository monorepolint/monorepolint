/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

module.exports = {
  rules: {
    ":standard-tsconfig": {
      options: {
        templateFile: "./templates/tsconfig.json"
      }
    },
    ":file-contents": {
      options: {
        file: "jest.config.js",
        templateFile: "./templates/jest.config.js"
      }
    },
    ":package-script": {
      options: {
        scripts: {
          clean: "rm -rf build lib",
          "compile:typescript": "../../node_modules/.bin/tsc",
          "lint:typescript":
            "../../node_modules/.bin/tslint --config ../../tslint.json --project .",
          "test:watch":
            "../../node_modules/.bin/jest --colors --passWithNoTests --watch",
          test: "../../node_modules/.bin/jest --colors --passWithNoTests"
        }
      }
    },
    ":package-order": {
      options: {
        order: [
          "name",
          "version",
          "author",
          "url",
          "license",
          "private",
          "main",
          "typings",
          "style",
          "sideEffects",
          "workspaces",
          "husky",
          "lint-staged",
          "scripts",
          "dependencies",
          "peerDependencies",
          "devDependencies",
          "publishConfig",
          "gitHead"
        ]
      }
    },
    ":alphabetical-dependencies": {},
    ":consistent-dependencies": {},
    ":banned-dependencies": {
      options: {
        bannedDependencies: ["lodash"]
      }
    }
  }
};
