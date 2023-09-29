---
title: Getting Started with Monorepolint
slug: /
---


Monorepolint is a robust and versatile tool designed to maintain homogeneity and predictability within your monorepo. It streamlines the management of monorepo structures by ensuring proper configuration and consistent organization across your entire project.

## Key Features

1. **TypeScript Configuration Validation**: Monorepolint verifies that your `tsconfig` files are set up correctly, reducing the likelihood of configuration-related errors.

2. **Consistent `package.json` File Structure**: Monorepolint ensures the contents of your `package.json` files are organized consistently, facilitating readability and maintainability.

3. **Predictable npm Scripts**: Monorepolint standardizes your npm scripts, making them more predictable and manageable as your monorepo evolves.

## Flexibility and Customization

Monorepolint (also known as MRL) is designed to be adaptable and unobtrusive. It does not require adopting any specific system or toolset. MRL can be used:

- With or without TypeScript
- With your preferred package manager
- In conjunction with your preferred monorepo organization method

MRL's primary objective is to enhance your monorepo experience without imposing any restrictive practices or behaviors.


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
  packageOrder,
  alphabeticalDependencies,
} from "@monorepolint/rules";

export default {
  rules: [
    packageOrder({}),
    alphabeticalDependencies({}),
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
