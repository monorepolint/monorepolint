---
title: NestedWorkspaces
---

Enforce that all workspaces in the repo are represented by the `workspaces` field in `package.json`.
In particular, this ensures that nested workspaces (e.g. `packages/group/*`) are not missed.

### Example

```javascript
import { NestedWorkspaces } from "monorepolint/rules";
export default {
  rules: [new NestedWorkspaces({})],
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/nestedWorkspaces.ts)
