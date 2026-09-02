# @monorepolint/utils

## 0.6.0-alpha.7

### Minor Changes

- 2e83416: Raise the declared Node requirement from `>=18` to `>=20`. The published packages' runtime dependencies already required Node 20 — `find-up@8` and `glob` in `utils` and `archetypes`, `globby@16` in `rules`, and `yargs@18` in the CLI — so the previous `>=18` overstated what actually worked.

### Patch Changes

- 1ef0354: Fix the symlink follow limit in `CachingHost`, which never decremented. The recursive call passed `follows--` (post-decrement), so it always handed down the original value and the `Exhausted symlink follows` guard could never fire. A symlink cycle recursed until the stack overflowed instead of throwing.
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

- 2505114: Fix `getWorkspacePackageDirs` silently ignoring negated workspace patterns (e.g. `["packages/*", "!packages/excluded"]`) in non-pnpm (yarn/npm `workspaces`) monorepos. Each pattern was previously passed to `glob.sync` in isolation, so a `!`-prefixed pattern was treated as a literal, unmatchable path instead of an exclusion. Positive and negative patterns are now expanded separately and negatives are filtered out of the accumulated result set.

## 0.6.0-alpha.6

### Minor Changes

- c1914bd: Dropping support for anything less than node 20

## 0.6.0-alpha.5

### Patch Changes

- 9f6fea7: Upgraded versions to minor bumps

## 0.6.0-alpha.4

## 0.6.0-alpha.3

## 0.6.0-alpha.2

### Patch Changes

- 4f42aad: Upgraded dependencies

  - `@docusaurus/*`: 3.7.0
  - `@mdx-js/react`: 3.1.0
  - `chalk`: 5.4.1
  - `eslint`: 9.18.0
  - `gh-pages`: 6.3.0
  - `gh-pages`: 6.3.0
  - `globals`: 15.14.0
  - `globby`: 14.0.2
  - `husky`: 15.14.0
  - `lint-staged`: 15.3.0
  - `micromatch`: 4.0.8
  - `mock-fs`: 5.4.1
  - `prettier`: 3.4.2
  - `prism-react-renderer`:2.4.1
  - `semver`: 7.6.3
  - `tslib`: 2.8.1
  - `tsup`: 8.3.5
  - `typescript-eslint`: 8.20.0
  - `turbo`: 2.x

## 0.6.0-alpha.1

## 0.6.0-alpha.0

## 0.5.0

### Minor Changes

- 45fb496: I failed to take good notes over the last few years. Sorry.

### Patch Changes

- b024660: Internal change to how publish happens
- b024660: Internal

## 0.5.0-beta.10

## 0.5.0-beta.9

### Patch Changes

- Internal

## 0.5.0-beta.8

### Patch Changes

- b024660: Internal change to how publish happens

## 0.5.0-beta.0

### Minor Changes

- 45fb496: I failed to take good notes over the last few years. Sorry.
