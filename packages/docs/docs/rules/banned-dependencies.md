---
title: :banned-dependencies
---

Disallow problematic dependencies.

### Options

- `bannedDependencies`
  - An array of dependency names to ban

### Example

```javascript
module.exports = {
  rules: {
    ":banned-dependencies": {
      options: {
        bannedDependencies: ["lodash"],
      },
    },
  },
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/bannedDependencies.ts)
