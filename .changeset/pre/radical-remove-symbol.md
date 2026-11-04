---
"@monorepolint/rules": minor
---

Major Enhancement: Introducing the REMOVE symbol for declarative cleanup

This release introduces a powerful new `REMOVE` symbol that enables declarative removal of unwanted configurations, files, and dependencies across your monorepo. The REMOVE symbol provides a unified, intuitive API for cleanup operations across multiple rules.

**What's New:**

- **Universal REMOVE Symbol**: Import `{ REMOVE }` from `@monorepolint/rules` to use across all supported rules
- **Four Rules Enhanced**: Added REMOVE support to fileContents, packageScript, requireDependency, and packageEntry rules
- **Declarative Cleanup**: Specify what should NOT exist rather than just what should exist
- **Consistent API**: Same REMOVE symbol works across all supported rules with intuitive syntax
- **Safe Operations**: Handles non-existent items gracefully (no errors when removing something that doesn't exist)

**Import and Usage Examples:**

```javascript
import {
  fileContents,
  packageEntry,
  packageScript,
  REMOVE,
  requireDependency,
} from "@monorepolint/rules";

export default {
  rules: [
    // fileContents: Remove unwanted files entirely
    fileContents({
      file: "unwanted-config.json",
      template: REMOVE, // Delete file if it exists
    }),

    // packageScript: Remove scripts with direct or enhanced syntax
    packageScript({
      scripts: {
        "outdated-script": REMOVE, // Direct removal syntax
        "build": "tsc", // Normal script management
        "conditional-task": {
          options: ["old-command", REMOVE], // Accept removal as valid option
          fixValue: REMOVE, // Remove when fixing
        },
      },
    }),

    // requireDependency: Remove dependencies across all types
    requireDependency({
      dependencies: {
        "lodash": REMOVE, // Remove from dependencies
        "react": "^18.0.0", // Keep with specific version
      },
      devDependencies: {
        "old-test-lib": REMOVE, // Remove from devDependencies
        "vitest": "^1.0.0", // Keep this devDependency
      },
      peerDependencies: {
        "deprecated-peer": REMOVE, // Remove from peerDependencies
      },
    }),

    // packageEntry: Remove top-level package.json fields
    packageEntry({
      entries: {
        "scripts": REMOVE, // Remove entire scripts field
        "description": "My package", // Keep with specific value
        "browser": REMOVE, // Remove browser field
        "main": "./index.js", // Keep this field
      },
    }),
  ],
};
```

**Rule-Specific Features:**

- **fileContents**: Simple `template: REMOVE` syntax for file deletion
- **packageScript**: Direct syntax (`"script": REMOVE`) plus enhanced options syntax with `fixValue: REMOVE`
- **requireDependency**: Works across dependencies, devDependencies, peerDependencies, and optionalDependencies
- **packageEntry**: Remove any top-level package.json field while managing others normally

**Benefits:**

- **Maintainability**: Easier to specify and maintain cleanup rules across your monorepo
- **Consistency**: Same REMOVE pattern works across different types of configurations
- **Flexibility**: Mix removal with regular configuration management in the same rule
- **Safety**: Won't error on items that are already removed/missing
- **Integration**: Works seamlessly with `--fix` flag for automated cleanup operations
