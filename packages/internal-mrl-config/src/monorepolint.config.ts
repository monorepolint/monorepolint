/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import type { ConfigFn } from "@monorepolint/config";
import * as Rules from "@monorepolint/rules";
import { REMOVE } from "@monorepolint/rules";
import { spawnSync } from "node:child_process";

const META_PACKAGES = ["monorepolint"];

const DOCS = "@monorepolint/docs";

// FIXME: This is still suboptimal
const DELETE_SCRIPT_ENTRTY = { options: [undefined], fixValue: undefined };

const formatWithDprint = (contents: string, ext: string) => {
  const result = spawnSync(
    `pnpm exec dprint fmt --stdin foo.${ext}`,
    {
      input: contents,
      encoding: "utf8",
      shell: true,
    },
  );

  if (result.error) {
    throw result.error;
  }
  return result.stdout;
};

export const config: ConfigFn = (_context) => {
  return {
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
          template: REMOVE,
        },
        excludePackages: [DOCS],
      }),
      Rules.fileContents({
        options: {
          file: "vitest.config.mjs",
          template: formatWithDprint(
            `import {
  coverageConfigDefaults,
  defaultExclude,
  defineProject,
} from "vitest/config";

export default defineProject({
  test: {
    exclude: [...defaultExclude, "**/build/**"],
    coverage: {
      provider: "v8",
      enabled: true,
      pool: "forks",
      exclude: [...coverageConfigDefaults.exclude, "vitest.config.*"],
    },
  },
});
`,
            "mjs",
          ),
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
            "test:watch": "vitest --passWithNoTests",
            test: "vitest run --passWithNoTests",
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
      Rules.alphabeticalDependencies({
        includeWorkspaceRoot: true,
      }),
      Rules.alphabeticalScripts({
        includeWorkspaceRoot: true,
      }),
      Rules.consistentDependencies({}),
      Rules.bannedDependencies({
        options: {
          bannedDependencies: ["lodash"],
        },
      }),
    ],
  };
};
