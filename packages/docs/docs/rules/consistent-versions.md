---
title: :consistent-versions
---

Ensure that all packages use the same version of a dependency, when present in either `dependencies` or `devDependencies`.
Note that this is different from [require-dependency](#require-dependency) which will require the dependency to exist
for all packages, not just enforce consistent versions when present.

### Options

- `matchDependencyVersions`
  - Map from dependency name to version

### Example

```javascript
module.exports = {
  rules: {
    ":consistent-versions": {
      options: {
        matchDependencyVersions: {
          "@types/react": "^16.9.19",
          "@types/react-dom": "^16.9.5",
        },
      },
    },
  },
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/consistentVersions.ts)
