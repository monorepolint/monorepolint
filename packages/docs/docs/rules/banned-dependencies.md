---
title: :banned-dependencies
---

Disallow problematic dependencies.

### Options

- `bannedDependencies: { glob: [], exact: []}`
  - An array of dependency globs to ban. Use the `glob` key for globs and the `exact` key for exact matches (perf win).
  - Note: this used to just be an array of globs but that is now deprecated.
- `bannedDependencyExactMatchs`
  - An array of dependencies to ban via exact match

### Example

```javascript
module.exports = {
  rules: {
    ":banned-dependencies": {
      options: {
        bannedDependencies: { exact: ["lodash"], glob: ["lodash-*"] }
      },
    },
  },
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/bannedDependencies.ts)
