---
title: :standard-tsconfig
---

Special case of the File Contents rule for typescript configs. Using a template file for the typescript config, auto discover ands adds project references to the config

### Options

- `file` (Optional)
  - Name of the file. Defaults to `tsconfig.json`.
- `generator` (Optional)
  - Function that can generate the config
- `template` (Optional)
  - Expected config contents
- `templateFile` (Optional)
  - Path to a file to use as a template

Exactly one of `generator`, `template`, or `templateFile` needs to be specified.

### Example

```javascript
module.exports = {
  rules: {
    ":standard-tsconfig": {
      options: {
        templateFile: "./templates/tsconfig.json",
      },
    },
  },
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/standardTsconfig.ts)
