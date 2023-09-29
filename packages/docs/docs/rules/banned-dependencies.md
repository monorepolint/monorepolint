---
title: bannedDependencies
---

Prevents the use of specific problematic dependencies within a project.

### Options

- `bannedDependencies: { glob: [], exact: []}`
  - Define an array of dependency globs to ban using the `glob` key for globs and the `exact` key for exact matches (performance benefits).
  - Note: this option used to accept an array of globs, but that approach is now deprecated.
- `bannedDependencyExactMatches`
  - An array of dependencies to ban via exact match
  - Deprecated

### Example

```javascript
import { bannedDependencies } from "monorepolint/rules";

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

For more information and to view the source code of this rule, please visit the [rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/bannedDependencies.ts) on the Monorepo Lint repository.