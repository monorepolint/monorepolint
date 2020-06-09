---
title: :package-entry
---

[source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/packageEntry.ts)

Standardize arbitrary entries in package.json.

### Options

- `entries`
  - An object of expected key value pairs for the package.json
- `entriesExists`
  - An array of expected keys to exist in package.json (without any value enforcement)

### Example

```javascript
module.exports = {
  rules: {
    ":package-entry": {
      options: {
        entries: {
          author: "Eric L Anderson (https://github.com/ericanderson)",
        },
        entriesExists: ["bugs"],
      },
    },
  },
};
```
