---
"@monorepolint/archetypes": minor
"@monorepolint/cli": minor
"@monorepolint/config": minor
"@monorepolint/core": minor
"@monorepolint/rules": minor
"@monorepolint/utils": minor
"monorepolint": minor
---

Raise the declared Node requirement from `>=20` to `>=22.12`. Node 20 reached end-of-life on 2026-04-30. `22.12` matches the lower bound `yargs@18` (used by the CLI) already declares for the Node 22 line.
