---
title: standardTsconfig
---

Special case of the File Contents rule for typescript configs. Using a template file for the typescript config, auto discover ands adds project references to the config

### Options

- `file` (Optional)
  - Name of the file. Defaults to `tsconfig.json`.
- `generator` (Optional)
  - Function that can generate the config
- `tsconfigReferenceFile` (Optional)
  - String to append to each project reference path. Useful if project references have a non-standard `tsconfig.json` path. Ex: `tsconfig.build.json`.
- `template` (Optional)
  - Expected config contents
- `templateFile` (Optional)
  - Path to a file to use as a template
- `excludedReferences` (Optional)
  - List of references to exclude
- `additionalReferences` (Optional)
  - List of additional references to include beyond the ones coming from explicit dependencies in `package.json`

Exactly one of `generator`, `template`, or `templateFile` needs to be specified.

### Example

```javascript
import { standardTsconfig } from "monorepolint/rules";
export default {
  rules: [
    standardTsconfig({
      options: {
        templateFile:
          "./templates/tsconfig.json",
      },
    }),
  ],
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/standardTsconfig.ts)
