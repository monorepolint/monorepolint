---
title: packageEntry
---

[source](https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/packageEntry.ts)

Standardize arbitrary entries in package.json.

### Options

- `entries`
  - An object of expected key value pairs for the package.json
  - Values can be any type or the `REMOVE` symbol to remove the entry
- `entriesExists`
  - An array of expected keys to exist in package.json (without any value enforcement)

### REMOVE Symbol Support

You can use the `REMOVE` symbol to remove entries from package.json:

```js
import { packageEntry, REMOVE } from "@monorepolint/rules";
```

When using `REMOVE`:

- The rule only reports an error if the entry exists
- Fixing will remove the entry from package.json
- No error is reported if the entry is already missing

### Example

```javascript
import { packageEntry, REMOVE } from "@monorepolint/rules";
export default {
  rules: [
    packageEntry({
      options: {
        entries: {
          author: "Eric L Anderson (https://github.com/ericanderson)",

          // Remove deprecated package.json fields using REMOVE symbol
          preferGlobal: REMOVE,
          directories: REMOVE,

          // Standardize license field
          license: "MIT",
        },
        entriesExists: ["bugs"],
      },
    }),
  ],
};
```

### Use Cases

**Field Cleanup**: Remove deprecated or unnecessary package.json fields:

```js
packageEntry({
  options: {
    entries: {
      // Remove deprecated npm fields
      preferGlobal: REMOVE,
      directories: REMOVE,
      "dist-tags": REMOVE,

      // Remove old build configuration
      "build-config": REMOVE,
      buildOptions: REMOVE,

      // Remove legacy fields
      "jsnext:main": REMOVE,
      "module:next": REMOVE,
    },
  },
});
```

**Migration Support**: Help with package.json migrations:

```js
// Remove old module format fields when migrating to modern exports
packageEntry({
  options: {
    entries: {
      // Remove old module fields
      main: REMOVE,
      module: REMOVE,
      browser: REMOVE,
      types: REMOVE,
      typings: REMOVE,

      // Ensure modern exports field exists (value enforcement handled elsewhere)
      exports: { ".": "./dist/index.js" },
    },
  },
});
```

**Mixed Operations**: Combine removal with standardization:

```js
packageEntry({
  options: {
    entries: {
      // Standardize these fields
      author: "Your Name <your.email@example.com>",
      license: "MIT",
      homepage: "https://github.com/yourorg/yourproject",

      // Remove deprecated fields
      preferGlobal: REMOVE,
      directories: REMOVE,

      // Remove old tooling configuration (moved to separate files)
      babel: REMOVE,
      eslintConfig: REMOVE,
      prettier: REMOVE,
      jest: REMOVE,
    },
    entriesExists: [
      "name",
      "version",
      "description",
      "repository",
    ],
  },
});
```

**Conditional Field Management**: Use different rules for different package types:

```js
// Remove private package fields from public packages
packageEntry({
  options: {
    entries: {
      private: REMOVE,
      "internal-notes": REMOVE,
      "dev-scripts": REMOVE,
    },
  },
  excludePackages: ["@internal/*"],
}),
  // Ensure private packages have required internal fields
  packageEntry({
    options: {
      entries: {
        private: true,
        "internal-owner": "platform-team",
      },
    },
    includePackages: ["@internal/*"],
  });
```

**Repository Cleanup**: Remove repository-specific configuration:

```js
packageEntry({
  options: {
    entries: {
      // Remove local development configuration
      "local-config": REMOVE,
      "dev-server": REMOVE,

      // Remove build artifacts configuration
      "build-hash": REMOVE,
      "last-build": REMOVE,

      // Remove old CI/CD configuration
      "travis": REMOVE,
      "appveyor": REMOVE,
      "circle": REMOVE,
    },
  },
});
```

**Publishing Configuration**: Clean up publishing-related fields:

```js
packageEntry({
  options: {
    entries: {
      // Remove development-only publishing config
      publishConfig: REMOVE,
      "npm-publish": REMOVE,

      // Remove old registry configuration
      "registry-url": REMOVE,
      "publish-registry": REMOVE,

      // Standardize publishing fields
      files: ["dist", "build", "*.md"],
      publishConfig: {
        access: "public",
        registry: "https://registry.npmjs.org/",
      },
    },
  },
});
```
