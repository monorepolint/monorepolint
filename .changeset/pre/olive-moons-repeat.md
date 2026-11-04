---
"@monorepolint/utils": patch
---

Fix the symlink follow limit in `CachingHost`, which never decremented. The recursive call passed `follows--` (post-decrement), so it always handed down the original value and the `Exhausted symlink follows` guard could never fire. A symlink cycle recursed until the stack overflowed instead of throwing.
