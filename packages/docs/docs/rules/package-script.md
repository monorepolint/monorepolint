---
title: packageScript
---

Standardize package scripts. This is a separate rule from Package Entries to make it easy to have multiple package script rules apply to one package.

### Options

- `scripts`
  - A map of string to one of:
    - A string for the expected value (short hand)
    - The `REMOVE` symbol to remove the script
    - An object like `{ options: string[], fixValue?: string }`
      - `options` is the allowed options for this value
      - `fixValue` is what will be set if none of the options match

### REMOVE Symbol Support

You can use the `REMOVE` symbol to remove scripts from packages:

```js
import { packageScript, REMOVE } from "@monorepolint/rules";
```

**Direct REMOVE syntax** (new and recommended):

```js
packageScript({
  options: {
    scripts: {
      "old-script": REMOVE, // Remove this script
    },
  },
});
```

**Object syntax** (legacy, still supported):

```js
packageScript({
  options: {
    scripts: {
      "old-script": {
        options: [undefined],
        fixValue: undefined, // fix removes value
      },
    },
  },
});
```

When using `REMOVE`:

- The rule only reports an error if the script exists
- Fixing will remove the script from package.json
- No error is reported if the script is already missing

### Example

```javascript
import { packageScript, REMOVE } from "@monorepolint/rules";
export default {
  rules: [
    packageScript({
      options: {
        scripts: {
          clean: "rm -rf build lib node_modules *.tgz",
          compile: "../../node_modules/.bin/tsc",

          // Remove deprecated scripts using direct REMOVE syntax
          jest: REMOVE,
          "jest:watch": REMOVE,

          // Remove using legacy syntax (still supported)
          goodbye: {
            options: [undefined],
            fixValue: undefined, // fix removes value
          },

          // Allow multiple options without auto-fix
          "any-of-these-no-auto-fix": {
            options: ["a", "b", "c"],
          },

          // Allow multiple options with auto-fix
          "any-of-these-auto-fix-to-c": {
            options: ["a", "b", "c"],
            fixValue: "c",
          },
        },
      },
    }),
  ],
};
```

### Use Cases

**Script Cleanup**: Remove deprecated or unnecessary scripts across all packages:

```js
packageScript({
  options: {
    scripts: {
      // Remove old test runners when migrating
      jest: REMOVE,
      "jest:watch": REMOVE,
      mocha: REMOVE,

      // Remove deprecated build scripts
      "compile-old": REMOVE,
      "build:legacy": REMOVE,
    },
  },
});
```

**Mixed Operations**: Combine removal with standardization:

```js
packageScript({
  options: {
    scripts: {
      // Standardize these scripts
      clean: "rm -rf build dist lib node_modules *.tgz",
      test: "vitest run --passWithNoTests",

      // Remove these deprecated scripts
      jest: REMOVE,
      "old-test": REMOVE,

      // Allow flexibility for this script
      build: {
        options: ["tsc", "rollup", "webpack"],
        fixValue: "tsc", // default to tsc if not one of the allowed options
      },
    },
  },
});
```

**Conditional Script Management**: Use multiple rules for different package types:

```js
// Remove scripts from meta packages
packageScript({
  options: {
    scripts: {
      compile: REMOVE,
      test: REMOVE,
      lint: REMOVE,
    },
  },
  includePackages: ["monorepolint", "meta-package"],
}),
  // Standardize scripts for regular packages
  packageScript({
    options: {
      scripts: {
        compile: "tsc --build",
        test: "vitest run --passWithNoTests",
        lint: "eslint .",
      },
    },
    excludePackages: ["monorepolint", "meta-package"],
  });
```

[rule source](https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/packageScript.ts)
