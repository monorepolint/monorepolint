---
"@monorepolint/cli": patch
"@monorepolint/core": patch
---

`@monorepolint/cli` and `@monorepolint/core` now depend on `chalk` 6 (up from 5). chalk 6 requires Node 22, which the `>=22.13` engines floor already covers.
