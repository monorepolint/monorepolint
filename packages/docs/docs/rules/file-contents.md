---
title: :file-contents
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

### Example

```javascript
module.exports = {
  rules: {
    "file-contents": {
      options: {
        templateFile: "./templates/jest.config.js",
      },
    },
  },
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/fileContents.ts)
