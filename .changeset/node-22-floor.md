---
"@monorepolint/archetypes": minor
"@monorepolint/cli": minor
"@monorepolint/config": minor
"@monorepolint/core": minor
"@monorepolint/rules": minor
"@monorepolint/utils": minor
"monorepolint": minor
---

Raise the declared Node requirement from `>=20` to `>=22.13`. Node 20 reached end-of-life on 2026-04-30. `22.13` matches the lower bound `read-yaml-file@3` (used by `@monorepolint/utils`) declares in its `engines` field. That is also above the `>=22.12` that `yargs@18` (used by the CLI) declares for the Node 22 line.
