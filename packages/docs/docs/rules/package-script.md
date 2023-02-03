---
title: PackageScript
---

Standardize package scripts. This is a separate rule from Package Entries to make it easy to have multiple package script rules apply to one package.

### Options

- `scripts`
  - A map of string to one of:
    - A string for the expected value (short hand)
    - An object like `{ options: string[], fixValue?: string }`
      - `options` is the allowed options for this value
      - `fixValue` is what will be set if none of the options match

### Example

```javascript
import { PackageScript } from "monorepolint/rules";
export default {
  rules: [
    new PackageScript({
      options: {
        scripts: {
          clean:
            "rm -rf build lib node_modules *.tgz",
          compile:
            "../../node_modules/.bin/tsc",
          goodbye: {
            options: [undefined],
            fixValue: undefined, // fix removes value
          },
          "any-of-these-no-auto-fix": {
            options: ["a", "b", "c"],
          },
          "any-of-these-auto-fix-to-c":
            {
              options: ["a", "b", "c"],
              fixValue: "c",
            },
        },
      },
    }),
  ],
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/packageScript.ts)
