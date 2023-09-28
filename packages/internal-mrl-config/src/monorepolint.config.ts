/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as Rules from "@monorepolint/rules";
import type { Config } from "@monorepolint/config";

const META_PACKAGES = ["monorepolint"];

const DOCS = "@monorepolint/docs";

// FIXME: This is still suboptimal
const DELETE_SCRIPT_ENTRTY = { options: [undefined], fixValue: undefined };

export const config: Config = {
  rules: [
    Rules.standardTsconfig({
      options: {
        templateFile: "./templates/tsconfig.json",
      },
      excludePackages: [DOCS],
    }),
    Rules.fileContents({
      options: {
        file: "jest.config.cjs",
        templateFile: "./templates/jest.config.cjs",
      },
      excludePackages: [DOCS],
    }),
    Rules.packageScript({
      options: {
        scripts: {
          clean: "rm -rf build dist lib node_modules *.tgz tsconfig.tsbuildinfo",
          "compile-typescript": "tsc --build",
          "lint:typescript": DELETE_SCRIPT_ENTRTY,
          jest: DELETE_SCRIPT_ENTRTY, // this syntax needs work :(
          "jest:watch": DELETE_SCRIPT_ENTRTY,
          lint: "eslint .",
          "test:watch": "NODE_OPTIONS=--experimental-vm-modules jest --colors --passWithNoTests --watch",
          test: "NODE_OPTIONS=--experimental-vm-modules jest --colors --passWithNoTests",
        },
      },
      excludePackages: [DOCS, ...META_PACKAGES],
    }),
    Rules.packageScript({
      options: {
        scripts: {
          clean: DELETE_SCRIPT_ENTRTY,
          "compile-typescript": DELETE_SCRIPT_ENTRTY,
          "lint:typescript": DELETE_SCRIPT_ENTRTY,
          jest: DELETE_SCRIPT_ENTRTY, // this syntax needs work :(
          "jest:watch": DELETE_SCRIPT_ENTRTY,
          lint: DELETE_SCRIPT_ENTRTY,
          "test:watch": DELETE_SCRIPT_ENTRTY,
          test: DELETE_SCRIPT_ENTRTY,
        },
      },
      includePackages: [...META_PACKAGES],
    }),
    Rules.packageEntry({
      options: {
        entries: {
          exports: {
            ".": {
              types: "./build/types/index.d.ts",
              import: "./build/js/index.js",
            },
            "./*": {
              types: "./build/types/public/*.d.ts",
              import: "./build/js/public/*.js",
            },
          },
          engines: {
            node: ">=18",
          },
        },
      },
    }),
    Rules.packageOrder({}),
    Rules.alphabeticalDependencies({}),
    Rules.alphabeticalScripts({}),
    Rules.consistentDependencies({}),
    Rules.bannedDependencies({
      options: {
        bannedDependencies: ["lodash"],
      },
    }),
    Rules.requireDependency({
      options: {
        devDependencies: {
          typescript: "^5.2.2",
          "@types/jest": "^29.2.4",
          prettier: "^2.8.3",
          "ts-jest": "^29.1.1",
          jest: "^29.3.1",
          "@jest/globals": "^29.3.1",
          tslib: "^2.6.2",
          "@typescript-eslint/eslint-plugin": "^6.7.3",
          "@typescript-eslint/parser": "^6.7.3",
          eslint: "^8.49.0",
        },
      },
    }),
  ],
};
