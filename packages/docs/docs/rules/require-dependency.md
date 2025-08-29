---
title: requireDependency
---

Require all packages to declare dependencies with specified versions or that an entry does not exist.

Often useful when using a third party tool like webpack or babel that expects a
local entry.

### Options

- `dependencies` (Optional)
  - Map of dependency name to version string, undefined, or REMOVE
- `devDependencies` (Optional)
  - Map of dependency name to version string, undefined, or REMOVE
- `peerDependencies` (Optional)
  - Map of dependency name to version string, undefined, or REMOVE
- `optionalDependencies` (Optional)
  - Map of dependency name to version string, undefined, or REMOVE

### REMOVE Symbol Support

You can use the `REMOVE` symbol to remove dependencies from packages:

```js
import { REMOVE, requireDependency } from "@monorepolint/rules";
```

When using `REMOVE`:

- The rule only reports an error if the dependency exists
- Fixing will remove the dependency from package.json
- No error is reported if the dependency is already missing

### Example

```javascript
import { REMOVE, requireDependency } from "@monorepolint/rules";
export default {
  rules: [
    requireDependency({
      options: {
        devDependencies: {
          typescript: "^3.8.3",

          // Remove deprecated dependencies using REMOVE symbol
          lodash: REMOVE,

          // Remove using legacy syntax (still supported)
          jquery: undefined,
        },
        dependencies: {
          // Ensure specific runtime dependencies
          react: "^18.0.0",

          // Remove deprecated runtime dependencies
          "old-polyfill": REMOVE,
        },
        peerDependencies: {
          // Remove peer dependencies that are no longer needed
          "deprecated-peer": REMOVE,
        },
      },
    }),
  ],
};
```

### Use Cases

**Dependency Cleanup**: Remove deprecated or unnecessary dependencies across all packages:

```js
requireDependency({
  options: {
    devDependencies: {
      // Remove old testing frameworks
      jest: REMOVE,
      mocha: REMOVE,
      "ts-jest": REMOVE,

      // Remove old build tools
      webpack: REMOVE,
      rollup: REMOVE,
    },
    dependencies: {
      // Remove deprecated polyfills
      "core-js": REMOVE,
      "babel-polyfill": REMOVE,

      // Remove old utility libraries
      lodash: REMOVE,
      underscore: REMOVE,
    },
  },
});
```

**Migration Support**: Help with framework or tooling migrations:

```js
// Remove Jest dependencies when migrating to Vitest
requireDependency({
  options: {
    devDependencies: {
      jest: REMOVE,
      "@types/jest": REMOVE,
      "ts-jest": REMOVE,
      "jest-environment-jsdom": REMOVE,

      // Ensure Vitest is present
      vitest: "^1.0.0",
      "@vitest/ui": "^1.0.0",
    },
  },
});
```

**Mixed Operations**: Combine removal with version standardization:

```js
requireDependency({
  options: {
    devDependencies: {
      // Standardize versions
      typescript: "^5.0.0",
      eslint: "^8.0.0",

      // Remove deprecated tools
      tslint: REMOVE,
      jshint: REMOVE,
    },
    dependencies: {
      // Ensure specific runtime versions
      react: "^18.0.0",
      "react-dom": "^18.0.0",

      // Remove old React versions or related packages
      "react-addons-test-utils": REMOVE,
      "enzyme": REMOVE,
    },
  },
});
```

**Conditional Dependency Management**: Use different rules for different package types:

```js
// Remove build tools from published packages
requireDependency({
  options: {
    devDependencies: {
      webpack: REMOVE,
      rollup: REMOVE,
      "build-scripts": REMOVE,
    },
  },
  includePackages: ["published-*"],
}),
  // Ensure build tools are present in development packages
  requireDependency({
    options: {
      devDependencies: {
        webpack: "^5.0.0",
        rollup: "^3.0.0",
      },
    },
    includePackages: ["@dev/*"],
  });
```

**Peer Dependency Cleanup**: Remove peer dependencies that are no longer needed:

```js
requireDependency({
  options: {
    peerDependencies: {
      // Remove peer dependencies for old React versions
      "react": REMOVE,
      "react-dom": REMOVE,
    },
    devDependencies: {
      // But keep them as dev dependencies for testing
      "react": "^18.0.0",
      "react-dom": "^18.0.0",
    },
  },
});
```

[rule source](https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/requireDependency.ts)
