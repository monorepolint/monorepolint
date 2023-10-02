---
title: Writing Custom Rules
---

Custom rules are simply functions that return the correct shape (`RuleModule` from `@monorepolint/config`).

For example, let's ban lodash with a rule using the `makeRule` helper:

```ts

import { makeRule } from "@monorepolint/rules/util";

export type Options = undefined; // Change this to an interface and have whatever rules you want

export const noLodash = makeRule<Options>({
  name: "noLodash",
  check: (context) => {
    const packageJson = context.getPackageJson();
    if (!packageJson["dependencies"]) return;

    if ("lodash" in packageJson["dependencies"]) {
      context.addError({
        message: "No lodash for you!",
        file: context.getPackageJsonPath(),
        fixer: () => {
          const freshPackageJson = { ...context.getPackageJson() };
          delete freshPackageJson.dependencies!["lodash"];
          context.host.writeJson(context.getPackageJsonPath(), freshPackageJson);
        },
      });
    }
  },
  validateOptions: () => {/* no options, no validation! */},
});

```

