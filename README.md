# monorepolint

Managing large monorepos is hard. This makes it easier to standardize them.

[![prerelease](https://github.com/monorepolint/monorepolint/actions/workflows/prerelease.yml/badge.svg)](https://github.com/monorepolint/monorepolint/actions/workflows/prerelease.yml)
![linted with monorepo](https://img.shields.io/badge/linted%20with-monorepolint-brightgreen.svg)

## Installation

```bash
yarn add monorepolint
```

or

```bash
npm install monorepolint
```

## Running

### Check for issues

Good for CI.

```bash
monorepolint check
```

or use the shortcut (which i will only use now):

```bash
mrl check
```

### Lets see more details

```bash
mrl check --verbose
```

### Automatically fix issues

```bash
mrl check --fix
```


## Configuration

For now, look at [.monorepolint.config.ts](./packages/internal-mrl-config/src/monorepolint.config.ts) in this repo.

Sample:

```js
import * as Rules from "monorepolint/rules";

const META_PACKAGES = ["monorepolint"];
const DOCS = "@monorepolint/docs";

// FIXME: This is still suboptimal
const DELETE_SCRIPT_ENTRTY = { options: [undefined], fixValue: undefined };

export default {
  rules: [
    Rules.standardTsConfig({
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
          typescript: "^4.9.5",
          "@types/jest": "^29.2.4",
          prettier: "^2.8.3",
          "ts-jest": "^29.0.5",
          jest: "^29.3.1",
          "@jest/globals": "^29.3.1",
          tslib: "^2.5.0",
          "@typescript-eslint/parser": "^5.45.1",
          "@typescript-eslint/eslint-plugin": "^5.45.1",
          eslint: "^8.29.0",
        },
      },
    }),
  ],
};
```

## Contribution

### Dev Setup

1. Get in there:

   ```sh
   pnpm
   pnpm compile:watch
   ```

2. Edit your files
3. Test your changes:

   ```sh
   pnpm ci
   ```

4. Submit a pull request

### Generating changelog

1. [Setup a GH Token](https://github.com/github-changelog-generator/github-changelog-generator/tree/main#github-token)

2. Run this command:

  ```shell
  sudo gem install --pre github_changelog_generator
  pnpm run changelog
  ```

3. Submit a pull request

## FAQ

### I added a new package but I can't get it to work with the local monorepo.lint.ts. What?

The way pnpm workspaces function, in order to get the right symlinks in `node_modules/@monorepolint/whatever` you need to run `pnpm` again.
