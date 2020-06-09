---
title: Configuration File
---

monorepolint expects a configuration file called `monorepolint.config.ts` in the
root of your project.

This file is the central brain for how your project should be configured and
enables you to keep your sub-projects consistent through out.

The way it works is quite simple, you have a list of rules and one or many applications of that rule, leaving you with a `key => true | configuration | configuration[]`.

Let's start with a simple configuration file and then go into more details.

## A Simple Configuration File

```ts
module.exports = {
  rules: {
    ":package-script": {
      options: {
        scripts: {
          clean: "rm -rf build lib node_modules *.tgz",
          test: "../../node_modules/.bin/jest --colors --passWithNoTests",
        },
      },
    },
    ":package-order": true,
    ":alphabetical-dependencies": true,
    ":alphabetical-scripts": true,
    ":banned-dependencies": {
      options: {
        bannedDependencies: ["lodash"],
      },
      includeWorkspaceRoot: true,
    },
    ":consistent-dependencies": true,
  },
};
```

This will ensure that all projects have a `clean` and `test` task, that the order of the entries in package.json are sane, that dependencies and scripts are kept in alphabetical order, that lodash is banned from the project, and the last one ensures that if a package is listed in the root package.json, all packages in the workspace that list that dependency must match the same version.

## Built-in and Custom Rules

All built-in rules begin with a colon. Custom rules will be the package where the rule is defined, followed by a colon and the rule name. For more information see [Writing Custom Rules](./writing-custom-rules).
 

## Common Configuration Options

Each rule configuration supports the following options:

```ts
{
  options?: unknown;
  excludePackages?: string[] | undefined;
  includePackages?: string[] | undefined;
  includeWorkspaceRoot?: boolean | undefined;
}
```

The contents of `options` is rule dependent and you will need to examine each rule you intend to use for futher configuration.

`excludePackages` is an array of package names or minimatch globs of package names allowing certain packages to be excluded from this configuration. This defaults to excluding no child packages.

`includePackages` is an array of package names or minimatch globs of package names for specifying specific packages this applies to. This defaults to including all child packages.

`includeWorkspaceRoot` is for specifying if this rule applies to the root package.


### Multiple applications of the same rule

Becasue we accept an array of configurations, you can specify a rule applies differently to two differnt types of projects like this:

```ts
module.exports = {
  rules: {
    ":package-script": [
    {
      options: {
        scripts: {
          "compile": "webpack"
        },
      },
      includePackages: ["*-webpack-bundle"]
    },
    {
      options: {
        scripts: {
          "compile": "tsc"
        },
      },
      excludePackages: ["*-webpack-bundle"]
    }
};
```
