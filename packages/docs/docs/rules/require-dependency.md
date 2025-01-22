---
title: requireDependency
---

Require all packages to declare dependencies with specified versions or that an entry does not exist.

Often useful when using a third party tool like webpack or babel that expects a
local entry.

### Options

- `dependencies` (Optional)
  - Map of dependency name to version string or undefined
- `devDependencies` (Optional)
  - Map of dependency name to version string or undefined
- `peerDependencies` (Optional)
  - Map of dependency name to version string or undefined
- `optionalDependencies` (Optional)
  - Map of dependency name to version string or undefined

### Example

```javascript
import { requireDependency } from "@monorepolint/rules";
export default {
  rules: [
    requireDependency({
      options: {
        devDependencies: {
          typescript: "^3.8.3",
          lodash: undefined,
        },
      },
    }),
  ],
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/requireDependency.ts)
