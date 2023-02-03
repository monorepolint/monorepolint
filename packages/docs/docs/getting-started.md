---
title: Getting Started with Monorepolint
slug: /
---

Monorepolint is a tool for keeping your monorepo homogenous and predictable.

It helps you ensure you're tsconfig files are setup correctly, that you order the contents of your
package.json files consistently, and that you have predictable npm scripts.

Monorepolint (mrl for short) does not require you to opt into any particular system. You can use it
with or without typescript, with your favorite package manager, and however you want to organize
your repo. MRL is here to stay out of your way, not force you into any particular behavior.

## Installing Monorepolint (MRL)

Install using yarn or your favorite package manager.

```shell
# YARN
yarn install monorepolint

# NPM
npm install monorepolint

# PNPM
pnpm install -W monorepolint
```

## Add an Initial Config File

Add an initial `.monorepolint.config.mjs` in the root folder of your monorepo.

```ts title=".monorepolint.config.mjs"
import {
  PackageOrder,
  AlphabeticalDependencies,
} from "@monorepolint/rules";

export default {
  rules: [
    new PackageOrder({}),
    new AlphabeticalDependencies({}),
  ],
};
```

For more details, see the [Configuration File Documentation](./config.mdx) page.

## Lint your Repo

Find non standard packages.

```shell
$ pnpm monorepolint check
# OR [pnpm/yarn/npm] mrl check

  @monorepo/packageA
    Error! Inconsistent dependencies with root in package.json
    Error! Incorrect order of devDependencies in package.json
  @monorepo/packageB
    Error! Incorrect order of fields in package.json
```

And standardize them.

```shell
$ pnpm mrl check --fix

  @monorepo/packageA
    Fixed! Inconsistent dependencies with root in package.json
    Fixed! Incorrect order of devDependencies in package.json
  @monorepo/packageB
    Fixed! Incorrect order of fields in package.json
```

## Next steps

- [Understand how the config works in config.mdx](./config.mdx)
- Add more built in rules
- [Write custom rules](./writing-custom-rules.md)
