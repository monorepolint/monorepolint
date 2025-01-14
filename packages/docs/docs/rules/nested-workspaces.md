---
title: nestedWorkspaces
---

Enforce that all workspaces in the repo are represented by the `workspaces` field in `package.json`.
In particular, this ensures that nested workspaces (e.g. `packages/group/*`) are not missed.

### Example

```javascript
import { nestedWorkspaces } from "@monorepolint/rules";
export default {
  rules: [nestedWorkspaces({})],
};
```

[rule source](https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/nestedWorkspaces.ts)
