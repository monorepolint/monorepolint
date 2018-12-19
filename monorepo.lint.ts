import { Context } from "@monorepo-lint/core";

module.exports = {
  checks: [
    {
      type: "@monorepo-lint/expect-standard-tsconfig",
      args: {
        template: {
          compilerOptions: {
            target: "es5",
            module: "commonjs",
            lib: ["es2015"],
            declaration: true,
            declarationMap: true,
            sourceMap: true,
            outDir: "./build",
            rootDir: "./src",
            composite: true,
            importHelpers: true,
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noImplicitReturns: true,
            noFallthroughCasesInSwitch: true,
            allowSyntheticDefaultImports: true,
            esModuleInterop: true
          }
        }
      },
      exclude: ["monorepo-lint"]
    },
    {
      type: "@monorepo-lint/expect-file-contents",
      args: {
        file: "jest.config.js",
        templateFile: "./templates/jest.config.js"
      },
      exclude: ["monorepo-lint"]
    },
    {
      type: "@monorepo-lint/expect-package-script",
      args: {
        name: "lint:typescript",
        value:
          "../../node_modules/.bin/tslint --config ../../tslint.json --project ."
      },
      exclude: ["monorepo-lint"]
    },
    {
      type: "@monorepo-lint/expect-package-script",
      args: {
        name: "compile:typescript",
        value:
          "../../node_modules/.bin/tsc"
      },
      exclude: ["monorepo-lint"]
    },
    {
      type: "@monorepo-lint/expect-package-script",
      args: {
        name: "test",
        value:
          "../../node_modules/.bin/jest --colors --passWithNoTests"
      },
      exclude: ["monorepo-lint"]
    },
    {
      type: "@monorepo-lint/expect-package-script",
      args: {
        name: "clean",
        value:
          "rm -rf build"
      },
      exclude: ["monorepo-lint"]
    },
    {
      type: "@monorepo-lint/expect-package-script",
      args: {
        name: "test:watch",
        value:
          "../../node_modules/.bin/jest --colors --passWithNoTests --watch"
      },
      exclude: ["monorepo-lint"]
    },
    {
      type: "@monorepo-lint/expect-package-order",
      args: {
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
      },
      exclude: [],
    }
  ]
};
