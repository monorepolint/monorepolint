# monorepolint

Managing large monorepos is hard. This makes it easier to standardize them.


[![CircleCI](https://circleci.com/gh/monorepolint/monorepolint.svg?style=shield)](https://circleci.com/gh/monorepolint/monorepolint) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/) [![Greenkeeper badge](https://badges.greenkeeper.io/monorepolint/monorepolint.svg)](https://greenkeeper.io/)
![linted with monorepo](https://img.shields.io/badge/linted%20with-monorepo--lint-brightgreen.svg)

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

For now, look at [.monorepolint.config.ts](./.monorepolint.config.ts) in this repo.

Sample:

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

### Generating changelog

1. [Setup a GH Token](https://github.com/github-changelog-generator/github-changelog-generator/tree/master#github-token)

2. Run this command:

  ```shell
  sudo gem install --pre github_changelog_generator
  yarn run changelog
  ```

3. Submit a pull request

## FAQ

### I added a new package but I can't get it to work with the local monorepo.lint.ts. What?

The way yarn workspaces function, in order to get the right symlinks in `node_modules/@monorepolint/whatever` you need to run `yarn` again.
