---
"@monorepolint/archetypes": patch
"@monorepolint/cli": patch
"@monorepolint/config": patch
"@monorepolint/core": patch
"@monorepolint/rules": patch
"@monorepolint/utils": patch
---

Runtime dependency changes since 0.5.0 (major upgrades in bold):

- `@monorepolint/cli`: **`yargs` 17 → 18**, **`chalk` 5 → 6**
- `@monorepolint/core`: **`chalk` 5 → 6**
- `@monorepolint/config`: removed `chalk` (unused)
- `@monorepolint/rules`: **`runtypes` replaced by `zod` 4** (see the option-validation note), **`jest-diff` 29 → 30** (changes the diff text in `--verbose` messages), **`globby` 14 → 16**, `semver` 7.6 → 7.8
- `@monorepolint/utils`: **`glob` 10 → 14** (matching now uses minimatch 11, with ReDoS-safe patterns), **`find-up` 7 → 8**, **`read-yaml-file` 2 → 3**, `micromatch` 4.0.5 → 4.0.8
- `@monorepolint/archetypes` (new in 0.6.0): its only third-party dependencies are now `find-packages`, `find-up` 8 and `tslib`; removed the unused `glob`, `micromatch` and `read-yaml-file` that earlier alphas declared

All packages also moved to `tslib` 2.8. Several of these dependencies require newer Node; see the engines note. Development-only dependency upgrades and the workspace's `pnpm.overrides` do not affect consumers.
