---
"@monorepolint/archetypes": patch
---

Removed unused `glob`, `micromatch`, and `@types/micromatch` dependencies. None of the package's source files import them; the real consumers of these packages live in `@monorepolint/utils`.
