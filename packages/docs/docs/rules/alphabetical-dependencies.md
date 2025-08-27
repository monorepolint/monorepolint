---
title: alphabeticalDependencies
---

# alphabeticalDependencies

Ensures that all dependency blocks within a project are ordered alphabetically.

## What it does

The `alphabeticalDependencies` rule automatically sorts dependencies, devDependencies, peerDependencies, and optionalDependencies in alphabetical order. This creates a consistent, predictable structure that makes it easier to:

- **Find dependencies quickly** when reviewing package.json files
- **Avoid duplicate dependencies** during manual edits
- **Merge changes cleanly** by reducing git conflicts
- **Maintain consistency** across all packages in your monorepo

## When to use it

This rule is recommended for **all monorepo projects** as a foundational consistency rule. It's particularly valuable when:

- Multiple developers are adding dependencies to the same packages
- You want to prevent merge conflicts in package.json files
- Code reviews should focus on logic, not dependency organization
- You're migrating from manual dependency management to automated consistency

## Basic usage

```javascript
import { alphabeticalDependencies } from "@monorepolint/rules";

export default {
  rules: [
    alphabeticalDependencies({}),
  ],
};
```

## Configuration options

Currently, this rule has no configuration options and will always sort dependencies alphabetically using case-insensitive comparison.

## Real-world examples

### Example 1: Basic monorepo setup

```javascript title=".monorepolint.config.mjs"
import { alphabeticalDependencies, packageOrder } from "@monorepolint/rules";

export default {
  rules: [
    // Apply to all packages in the monorepo
    alphabeticalDependencies({}),
    packageOrder({}),
  ],
};
```

### Example 2: Excluding specific packages

```javascript title=".monorepolint.config.mjs"
import { alphabeticalDependencies } from "@monorepolint/rules";

export default {
  rules: [
    alphabeticalDependencies({
      // Exclude generated or external packages
      excludePackages: ["generated-*", "legacy-package"],
    }),
  ],
};
```

### Example 3: Including root workspace

```javascript title=".monorepolint.config.mjs"
import { alphabeticalDependencies } from "@monorepolint/rules";

export default {
  rules: [
    alphabeticalDependencies({
      // Also apply to root package.json
      includeWorkspaceRoot: true,
    }),
  ],
};
```

## Before/After

### Before (unorganized dependencies)

```json title="package.json"
{
  "dependencies": {
    "zod": "^3.20.0",
    "react": "^18.2.0",
    "axios": "^1.0.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "typescript": "^4.9.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.30.0",
    "@types/node": "^18.0.0"
  }
}
```

### After (alphabetically sorted)

```json title="package.json"
{
  "dependencies": {
    "axios": "^1.0.0",
    "lodash": "^4.17.21",
    "react": "^18.2.0",
    "zod": "^3.20.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.30.0",
    "typescript": "^4.9.0"
  }
}
```

## Source code

For implementation details, see the [rule source code](https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/alphabeticalDependencies.ts) in the monorepolint repository.
