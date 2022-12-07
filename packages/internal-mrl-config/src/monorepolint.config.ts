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
    new Rules.PackageScript({
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
    new Rules.PackageOrder({}),
    new Rules.AlphabeticalDependencies({}),
    new Rules.AlphabeticalScripts({}),
    new Rules.ConsistentDependencies({}),
    new Rules.BannedDependencies({
      options: {
        bannedDependencies: ["lodash"],
      },
    }),
    new Rules.RequireDependency({
      options: {
        devDependencies: {
          typescript: "^4.9.3",
          "@types/jest": "^29.2.4",
          prettier: "^2.8.0",
          "ts-jest": "^29.0.3",
          jest: "^29.3.1",
          "@jest/globals": "^29.3.1",
          tslib: "^2.4.1",
          "@typescript-eslint/parser": "^5.45.1",
          "@typescript-eslint/eslint-plugin": "^5.45.1",
          eslint: "^8.29.0",
        },
      },
    }),
  ],
};
