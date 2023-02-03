---
title: PackageOrder
---

Standardize entry order in package.json.

### Options

- `order` (Optional)
  - Either a comparator function on keys or an array of expected package order. If a a key is missing from this array, it will be at the bottom of the package.json. If missing, uses a default ordering found below.

### Example

```javascript
import { PackageOrder } from "monorepolint/rules";
export default {
  rules: [
    new PackageOrder({
      options: {
        order: [
          "name",
          "version",
          "author",
          "contributors",
          "url",
          "license",
          "private",
          "engines",
          "bin",
          "main",
          "module",
          "typings",
          "style",
          "sideEffects",
          "workspaces",
          "husky",
          "lint-staged",
          "files",
          "scripts",
          "resolutions",
          "dependencies",
          "peerDependencies",
          "devDependencies",
          "optionalDependencies",
          "publishConfig",
        ],
      },
    }),
  ],
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/packageOrder.ts)
