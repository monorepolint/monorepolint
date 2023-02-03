---
title: AlphabeticalDependencies
---

Makes sure that all dependency blocks are ordered alphabetically.

### Example

```javascript
import { AlphabeticalDependencies } from "@monorepolint/rules";
export default {
  rules: [
    new AlphabeticalDependencies({}),
  ],
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/alphabeticalDependencies.ts)
