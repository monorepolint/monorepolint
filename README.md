# monorepo-lint

Managing large monorepos is hard. This makes it easier to standardize them.

[![CircleCI](https://circleci.com/gh/monorepo-lint/monorepo-lint.svg?style=shield)](https://circleci.com/gh/monorepo-lint/monorepo-lint) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/) [![Greenkeeper badge](https://badges.greenkeeper.io/monorepo-lint/monorepo-lint.svg)](https://greenkeeper.io/)

## Configuration

For now, look at [monorepo.lint.ts](./monorepo.lint.ts) in this repo.

### The future of configuration

The way we configure in v0.1.x is way too verbose. We will be changing this soon to be like (compare with [monorepo.lint.ts](./monorepo.lint.ts)) the below. NOTE: this is not final.

```js
module.exports = {
  checks: {
    ":standard-tsconfig": [
      {
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
      }
    ],
    ":file-contents": [
      {
        options: "jest.config.js",
        templateFile: "./templates/jest.config.js"
      }
    ],
    ":package-script": [
      {
        options: {
          clean: "rm -rf build",
          "compile:typescript": "../../node_modules/.bin/tsc",
          "lint:typescript":
            "../../node_modules/.bin/tslint --config ../../tslint.json --project .",
          "test:watch":
            "../../node_modules/.bin/jest --colors --passWithNoTests --watch",
          test: "../../node_modules/.bin/jest --colors --passWithNoTests"
        }
      }
    ],
    ":package-order": [
      {
        options: [
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
        ],
        includeWorkspaceRoot: true
      }
    ],
    ":alphabetical-dependencies": {}
  }
};
```

## Contribution

### Dev Setup

1. Get in there:

   ```sh
   yarn
   yarn compile:watch
   ```

2. Edit your files
3. Test your changes:

   ```sh
   yarn ci
   ```

4. Submit a pull request

### FAQ

#### I added a new package but I can't get it to work with the local monorepo.lint.ts. What?

The way yarn workspaces function, in order to get the right symlinks in `node_modules/@monorepo-lint/whatever` you need to run `yarn` again.
