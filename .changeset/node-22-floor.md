---
"@monorepolint/archetypes": minor
"@monorepolint/cli": minor
"@monorepolint/config": minor
"@monorepolint/core": minor
"@monorepolint/rules": minor
"@monorepolint/utils": minor
"monorepolint": minor
---

All packages now require Node `>=22.13` (0.5.0 declared `>=18`). Node 18 and 20 are end-of-life, and several runtime dependencies already required newer Node: `find-up@8` and `globby@16` (Node 20), `yargs@18` (`>=22.12` on the Node 22 line), `chalk@6` (Node 22) and `read-yaml-file@3` (`>=22.13`). Upgrade Node before upgrading monorepolint.
