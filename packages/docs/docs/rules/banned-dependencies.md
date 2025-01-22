---
title: bannedDependencies
---

## Overview

The bannedDependencies lint rule is designed to prevent the usage of certain, potentially problematic, dependencies within your project. This rule is highly customizable, allowing you to specify exact dependencies or use glob patterns to disallow a wider range of dependencies.

Due to performance considerations, it is now recommended to use the bannedDependencies option with exact and glob keys to specify disallowed dependencies. The previously used approach of providing an array of globs or using bannedDependencyExactMatches is deprecated.

By default, this rule will not transitively check dependencies.

It is possible to ban transitive dependencies with this rule, but given
the current performance characteristics, it is not recommended and thus not
documented.

### Options

- `bannedDependencies: { glob: [], exact: []}`
  - Define an array of dependency globs to ban using the `glob` key for globs and the `exact` key for exact matches (performance benefits).
  - Note: this option used to accept an array of globs, but that approach is now deprecated.

### Example

```javascript
import { bannedDependencies } from "@monorepolint/rules";

export default {
  rules: [
    bannedDependencies({
      options: {
        bannedDependencies: {
          exact: ["lodash"],
          glob: ["lodash-*"],
        },
      },
    }),
  ],
};
```

### Reference

For more information and to view the source code of this rule, please visit the [rule source](https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/bannedDependencies.ts) on the Monorepo Lint repository.
