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

### Path Validation

The `file` option is joined to the package directory with `path.join`. The only validation is that the resulting path must not contain null bytes; if it does, the rule throws an error. Nothing else is rejected: a path containing `..` can resolve outside the package directory, and an absolute path such as `/foo.txt` is treated as relative to the package directory (`path.join` keeps the leading `/` only as a separator).

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
    // Delete file
    fileContents({
      options: {
        file: "old-config.js",
        template: REMOVE,
      },
    }),
    // Generator example
    fileContents({
      options: {
        file: "generated.txt",
        generator: (context) => {
          return `Package: ${context.getPackageJson().name}\nVersion: ${context.getPackageJson().version}`;
        },
      },
    }),
    // Generator that removes files conditionally
    fileContents({
      options: {
        file: "conditional.txt",
        generator: (context) => {
          // Remove file for certain packages
          if (context.getPackageJson().name?.startsWith("@internal/")) {
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
      if (context.getPackageJson().private) {
        return REMOVE;
      }
      return `# ${context.getPackageJson().name}\n\n${context.getPackageJson().description}`;
    },
  },
});
```

[rule source](https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/fileContents.ts)
