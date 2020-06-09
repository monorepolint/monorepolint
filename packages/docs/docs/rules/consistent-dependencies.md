---
title: :consistent-dependencies
---

Enforce dependency versions are consistent with workspace root.

### Example

```javascript
module.exports = {
  rules: {
    ":consistent-dependencies": true,
  },
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/consistentDependencies.ts)
