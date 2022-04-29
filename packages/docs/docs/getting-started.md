---
title: Getting Started
slug: /
---

Install using yarn or your favorite package manager.

```shell
$ yarn install monorepolint
...
```

Add an initial `.monorepolint.config.ts` in the root folder of your monorepo.

```javascript
module.exports = {
  rules: {
    ":package-order": true,
    ":alphabetical-dependencies": true,
  },
};
```

Find non standard packages.

```shell
$ yarn monorepolint check

  @monorepo/packageA
    Error! Inconsistent dependencies with root in package.json
    Error! Incorrect order of devDependencies in package.json
  @monorepo/packageB
    Error! Incorrect order of fields in package.json
```

And standardize them.

```shell
$ yarn monorepolint check --fix

  @monorepo/packageA
    Fixed! Inconsistent dependencies with root in package.json
    Fixed! Incorrect order of devDependencies in package.json
  @monorepo/packageB
    Fixed! Incorrect order of fields in package.json
```

## Next steps

- [Understand how the config works in config.md](./config.md)
- Add more built in rules
- [Write custom rules](./writing-custom-rules.md)
