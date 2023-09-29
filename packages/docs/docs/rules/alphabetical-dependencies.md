---
title: alphabeticalDependencies
---

Ensures that all dependency blocks within a project are ordered alphabetically.

## Overview

The `alphabeticalDependencies` rule verifies that the dependency blocks in your project are in alphabetical order. Maintaining an organized structure within your dependency blocks can improve readability and make it easier for developers to locate specific dependencies.

### Usage

```javascript
import { alphabeticalDependencies } from "@monorepolint/rules";

export default {
  rules: [
    alphabeticalDependencies({}),
  ],
};
```

## Reference

For more information and to view the source code of this rule, please visit the [rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/alphabeticalDependencies.ts) in the monorepolint repository.
