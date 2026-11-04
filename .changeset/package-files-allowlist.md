---
"@monorepolint/archetypes": patch
"@monorepolint/cli": patch
"@monorepolint/config": patch
"@monorepolint/core": patch
"@monorepolint/internal-mrl-config": patch
"@monorepolint/rules": patch
"@monorepolint/utils": patch
"monorepolint": patch
---

Published tarballs now contain only build output (`build/js`, `build/types`, plus `bin` for the CLI), `CHANGELOG.md`, `LICENSE` and `package.json`. Sources, tests, `tsconfig.json`, `vitest.config.mjs`, `.turbo` logs, coverage reports and `tsconfig.tsbuildinfo` are no longer shipped.
