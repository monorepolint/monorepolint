---
path: "/"
title: "Overview"
---

Install using yarn or your favorite package manager.

```
λ yarn install monorepolint
```

Add an initial `.monorepolint.config.ts` at the toplevel of your monorepo.

```javascript
module.exports = {
  rules: {
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
      },
      includeWorkspaceRoot: true,
    },
    ":alphabetical-dependencies": {
      includeWorkspaceRoot: true,
    },
    ":consistent-dependencies": {
      includeWorkspaceRoot: true,
    },
  }
};
```

Find non standard packages.

```
λ yarn monorepolint check

  @monorepo/packageA
    Error! Inconsitent depdencies with root in package.json
    Error! Incorrect order of devDependencies in package.json
  @monorepo/packageB
    Error! Incorrect order of fields in package.json
```

And standardize them.

```
λ yarn monorepolint check --fix

  @monorepo/packageA
    Fixed! Inconsitent depdencies with root in package.json
    Fixed! Incorrect order of devDependencies in package.json
  @monorepo/packageB
    Fixed! Incorrect order of fields in package.json
```
