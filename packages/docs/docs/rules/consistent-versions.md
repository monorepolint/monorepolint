---
title: ConsistentVersions
---

Ensure that all packages use the same version of a dependency, when present in either `dependencies` or `devDependencies`.
Note that this is different from [require-dependency](#require-dependency) which will require the dependency to exist
for all packages, not just enforce consistent versions when present.

### Options

- `matchDependencyVersions`
  - Map from dependency name to version

### Example

```javascript
import { ConsistentVersions } from "monorepolint/rules";
export default {
  rules: [
    new ConsistentVersions({
      options: {
        matchDependencyVersions: {
          lodash: "1.0.0",
        },
      },
    }),
  ],
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/consistentVersions.ts)
