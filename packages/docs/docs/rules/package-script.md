---
title: :package-script
---

Standardize package scripts. This is a separate rule from Package Entries to make it easy to have multiple package script rules apply to one package.

### Options

- `scripts`
  - An object of expected key value pairs for the scripts block

### Example

```javascript
module.exports = {
  rules: {
    ":package-script": {
      options: {
        scripts: {
          clean: "rm -rf build lib node_modules *.tgz",
          compile: "../../node_modules/.bin/tsc",
          goodbye: {
            options: [undefined],
            fixValue: undefined, // fix removes value
          },
          "any-of-these-no-auto-fix": {
            options: ["a", "b", "c"],
          },
          "any-of-these-auto-fix-to-c": {
            options: ["a", "b", "c"],
            fixValue: "c",
          },
        },
      },
    },
  },
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/packageScript.ts)
