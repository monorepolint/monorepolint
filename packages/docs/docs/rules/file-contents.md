---
title: fileContents
---

Enforce that each package has a file with certain contents enforced by either a template or generator.

### Options

- `file`
  - Name of the file
- `generator` (Optional)
  - Function that can generate the file
- `template` (Optional)
  - Expected file contents
- `templateFile` (Optional)
  - Path to a file to use as a template

Exactly one of `generator`, `template`, or `templateFile` needs to be specified.

### REMOVE Symbol Support

You can use the `REMOVE` symbol to delete files from packages:

```js
import { fileContents, REMOVE } from "@monorepolint/rules";
```

When `template: REMOVE` is specified:

- The rule will only report an error if the file exists
- Fixing will delete the file from the package
- No error is reported if the file already doesn't exist

### Path Validation and Security

The rule includes path validation to prevent directory traversal attacks:

- Paths containing `..` are rejected
- Absolute paths are rejected
- Only relative paths within the package are allowed

### Generator Error Handling

When using a `generator` function:

- If the generator throws an error, the rule will report it as a validation error
- The error message will include both the original generator error and context about which package failed
- This helps identify configuration issues or package-specific problems

### Example

```js
import { fileContents, REMOVE } from "@monorepolint/rules";
export default {
  rules: [
    fileContents({
      options: {
        file: "jest.config.js",
        templateFile: "./templates/jest.config.js",
      },
    }),
    fileContents({
      options: {
        file: "foo.txt",
        template: "Hi mom",
      },
    }),
    // Remove deprecated config files
    fileContents({
      options: {
        file: "jest.config.cjs",
        template: REMOVE,
      },
    }),
    // Delete file (legacy syntax - still supported)
    fileContents({
      options: {
        file: "old-config.js",
        template: undefined, // delete file
      },
    }),
    // Generator example
    fileContents({
      options: {
        file: "generated.txt",
        generator: (context) => {
          return `Package: ${context.packageJson.name}\nVersion: ${context.packageJson.version}`;
        },
      },
    }),
    // Generator that removes files conditionally
    fileContents({
      options: {
        file: "conditional.txt",
        generator: (context) => {
          // Remove file for certain packages
          if (context.packageJson.name?.startsWith("@internal/")) {
            return REMOVE;
          }
          return "This is a public package";
        },
      },
    }),
  ],
};
```

### Use Cases

**File Cleanup**: Remove deprecated configuration files across all packages:

```js
// Remove old Jest configs when migrating to Vitest
fileContents({
  options: {
    file: "jest.config.js",
    template: REMOVE,
  },
});
```

**Conditional File Management**: Use generators to conditionally create or remove files:

```js
// Only create README files for public packages
fileContents({
  options: {
    file: "README.md",
    generator: (context) => {
      if (context.packageJson.private) {
        return REMOVE;
      }
      return `# ${context.packageJson.name}\n\n${context.packageJson.description}`;
    },
  },
});
```

[rule source](https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/fileContents.ts)
