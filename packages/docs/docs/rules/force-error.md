---
title: forceError
---

The `forceError` rule is designed to induce an intentional error condition, which can serve as a foundational component for other rules or as an effective debugging tool.

## Overview

The `forceError` rule is helpful as a building block for other rules or as a debugging tool.

### Usage

Below is an example of how to implement the `forceError` rule in your project:

```javascript
import { forceError } from "@monorepolint/rules";

export default {
  rules: [
    forceError({
      options: {
        customMessage: "Let's always trigger an error",
      },
    }),
  ],
};
```

## Reference

For more information and to view the source code of this rule, please visit the [rule source](https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/forceError.ts) in the monorepolint repository.
