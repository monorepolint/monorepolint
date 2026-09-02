# @monorepolint/archetypes

## 0.6.0-alpha.7

### Minor Changes

- 2e83416: Raise the declared Node requirement from `>=18` to `>=20`. The published packages' runtime dependencies already required Node 20 — `find-up@8` and `glob` in `utils` and `archetypes`, `globby@16` in `rules`, and `yargs@18` in the CLI — so the previous `>=18` overstated what actually worked.

### Patch Changes

- 0ee3b7d: Upgraded dependencies, mostly to clear security advisories

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

- bebd49e: Removed unused `glob`, `micromatch`, and `@types/micromatch` dependencies. None of the package's source files import them; the real consumers of these packages live in `@monorepolint/utils`.
- Updated dependencies [2e83416]
- Updated dependencies [0ee3b7d]
  - @monorepolint/config@0.6.0-alpha.7
  - @monorepolint/rules@0.6.0-alpha.7

## 0.6.0-alpha.6

### Minor Changes

- c1914bd: Dropping support for anything less than node 20

### Patch Changes

- Updated dependencies [c1914bd]
- Updated dependencies [5cf4a93]
- Updated dependencies [b8d9bfb]
  - @monorepolint/config@0.6.0-alpha.6
  - @monorepolint/rules@0.6.0-alpha.6

## 0.6.0-alpha.5

### Patch Changes

- 9f6fea7: Upgraded versions to minor bumps
- Updated dependencies [9f6fea7]
  - @monorepolint/config@0.6.0-alpha.5
  - @monorepolint/rules@0.6.0-alpha.5

## 0.6.0-alpha.4

### Minor Changes

- 7b6fd9d: Introduce @monorepolint/archetypes

### Patch Changes

- Updated dependencies [50b64ed]
- Updated dependencies [3883483]
  - @monorepolint/rules@0.6.0-alpha.4
  - @monorepolint/config@0.6.0-alpha.4
