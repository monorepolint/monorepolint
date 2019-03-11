/*!
 * Copyright 2019 Palantir Technologies, Inc.
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
          clean: "rm -rf build lib node_modules *.tgz",
          "compile:typescript": "../../node_modules/.bin/tsc",
          "lint:typescript":
            "../../node_modules/.bin/tslint --config ../../tslint.json --project .",
          "test:watch":
            "../../node_modules/.bin/jest --colors --passWithNoTests --watch",
          test: "../../node_modules/.bin/jest --colors --passWithNoTests"
        }
      }
    },
    ":package-order": true,
    ":alphabetical-dependencies": true,
    ":consistent-dependencies": true,
    ":banned-dependencies": {
      options: {
        bannedDependencies: ["lodash"]
      }
    }
  }
};
