---
title: oncePerPackage
---

## Overview

The `oncePerPackage` rule is a helper rule for establishing that a set of rules is only applied once per package.

### Usage

Will only trigger when the rule runs on package more than once for a given `singletonKey`.

Below is an example of how to implement the `oncePerPackage` rule in your project:

```javascript
import { forceError } from "@monorepolint/rules";

export default {
  rules: [
    oncePerPackage({
      options: {
        singletonKey: "a",
        customMessage: "will not trigger",
      },
    }),
    oncePerPackage({
      options: {
        singletonKey: "b",
        customMessage: "will trigger but you won't see this message",
      },
    }),
    oncePerPackage({
      options: {
        singletonKey: "b",
        customMessage:
          "will trigger and you will see this message as its the second invocation",
      },
    }),
  ],
};
```

## Reference

For more information and to view the source code of this rule, please visit the [rule source](https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/oncePerPackage.ts) in the monorepolint repository.
