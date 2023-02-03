---
title: RequireDependency
---

Require all packages to declare dependencies with specified versions.

Often useful when using a third party tool like webpack or babel that expects a
local entry.

### Options

- `dependencies` (Optional)
  - Map of dependency name to version
- `devDependencies` (Optional)
  - Map of dependency name to version
- `peerDependencies` (Optional)
  - Map of dependency name to version
- `optionalDependencies` (Optional)
  - Map of dependency name to version

### Example

```javascript
import { RequireDependency } from "monorepolint/rules";
export default {
  rules: [
    new RequireDependency({
      options: {
        devDependencies: {
          typescript: "^3.8.3",
        },
      },
    }),
  ],
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/requireDependency.ts)
