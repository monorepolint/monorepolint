---
title: consistentDependencies
---

Enforce dependency versions are consistent with workspace root.

If your root package.json has a dependency on `"somelib": "^1.0.0"` then all child projects that depend on somelib must also have that version listed.

### Example

```javascript
import { consistentDependencies } from "monorepolint/rules";
export default {
  rules: [
    consistentDependencies({}),
  ],
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/consistentDependencies.ts)
