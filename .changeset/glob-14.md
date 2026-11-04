---
"@monorepolint/utils": patch
---

`@monorepolint/utils` now depends on `glob` 14 (up from 13). glob 14 uses minimatch 11 for matching, with ReDoS-safe patterns.
