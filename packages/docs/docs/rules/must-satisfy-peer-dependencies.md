---
title: mustSatisfyPeerDependencies
---

Ensures that packages satisfy peer dependency requirements declared by their dependencies.

### Options

- `skipUnparseableRanges`
  - If true, warn and skip dependency ranges that are unparseable. Otherwise, throw. Default is false.
- `dependencyWhitelist`
  - An array of package names indicating which peer dependencies must be satisfied.

### Example

```javascript
import { mustSatisfyPeerDependencies } from "monorepolint/rules";
export default {
  rules: [
    mustSatisfyPeerDependencies({
      options: {
        skipUnparseableRanges: false,
        dependencyWhitelist: [
          "react",
          "react-dom",
        ],
      },
    }),
  ],
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/mustSatisfyPeerDependencies.ts)
