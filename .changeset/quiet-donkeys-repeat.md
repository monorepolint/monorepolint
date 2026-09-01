---
"@monorepolint/internal-mrl-config": patch
"@monorepolint/archetypes": patch
"@monorepolint/config": patch
"@monorepolint/rules": patch
"@monorepolint/utils": patch
"@monorepolint/core": patch
"@monorepolint/docs": patch
"monorepolint": patch
"@monorepolint/cli": patch
---

Upgraded dependencies, mostly to clear security advisories

Runtime dependencies of published packages:

- `glob`: 11.0.3 -> 13.0.6 (`archetypes`, `utils`)
- `globby`: 14.1.0 -> 16.2.4 (`rules`)
- `jest-diff`: 30.1.2 -> 30.5.1 (`rules`)
- `semver`: 7.7.2 -> 7.8.5 (`rules`)
- `yargs`: 18.0.0 -> 18.1.0 (`cli`)
- `zod`: 4.1.5 -> 4.5.4 (`rules`)

Development dependencies:

- `@changesets/cli`: 2.31.1
- `@docusaurus/*`: 3.10.2
- `@eslint/js`: 9.39.5
- `@types/micromatch`: 4.0.10
- `@types/node`: 22.20.1
- `@types/semver`: 7.8.0
- `@typescript-eslint/*`: 8.69.0
- `@vitest/coverage-v8`: 4.1.11
- `dprint`: 0.50.2
- `eslint`: 9.39.5
- `eslint-config-turbo`: 2.10.12
- `globals`: 16.5.0
- `lint-staged`: 16.4.0
- `react`, `react-dom`: 19.2.8
- `tmp`: 0.2.7
- `tsup`: 8.5.1
- `turbo`: 2.10.12
- `typescript`: 5.9.3
- `vitest`: 4.1.11
- `vite`: pinned to 8.2.2 at the workspace root

Also added `pnpm.overrides` for `serialize-javascript` (7.1.1), `uuid` (11.1.1) and `esbuild` (0.28.2), whose parents pinned them below the patched versions. These apply to this workspace's install only and do not affect consumers of the published packages.

This took the workspace from 37 packages with open advisories down to 1 (`image-size`, which has no published fix).
