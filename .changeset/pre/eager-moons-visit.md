---
"@monorepolint/config": patch
---

Removed the unused `chalk` dependency. Nothing in the package imported it; the real consumers are `@monorepolint/cli` and `@monorepolint/core`.
