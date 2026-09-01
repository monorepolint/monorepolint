---
"@monorepolint/archetypes": minor
"@monorepolint/config": minor
"@monorepolint/core": minor
"@monorepolint/rules": minor
"@monorepolint/utils": minor
"monorepolint": minor
---

Raise the declared Node requirement from `>=18` to `>=20`. The published packages' runtime dependencies already required Node 20 — `find-up@8` and `glob` in `utils` and `archetypes`, `globby@16` in `rules`, and `yargs@18` in the CLI — so the previous `>=18` overstated what actually worked.
