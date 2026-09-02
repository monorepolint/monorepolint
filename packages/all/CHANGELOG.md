# monorepolint

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

- Updated dependencies [2e83416]
- Updated dependencies [1ef0354]
- Updated dependencies [0ee3b7d]
- Updated dependencies [2505114]
  - @monorepolint/config@0.6.0-alpha.7
  - @monorepolint/core@0.6.0-alpha.7
  - @monorepolint/rules@0.6.0-alpha.7
  - @monorepolint/utils@0.6.0-alpha.7
  - @monorepolint/internal-mrl-config@0.6.0-alpha.7
  - @monorepolint/cli@0.6.0-alpha.7

## 0.6.0-alpha.6

### Minor Changes

- c1914bd: Dropping support for anything less than node 20

### Patch Changes

- Updated dependencies [c1914bd]
- Updated dependencies [5cf4a93]
- Updated dependencies [b8d9bfb]
  - @monorepolint/cli@0.6.0-alpha.6
  - @monorepolint/config@0.6.0-alpha.6
  - @monorepolint/core@0.6.0-alpha.6
  - @monorepolint/internal-mrl-config@0.6.0-alpha.6
  - @monorepolint/rules@0.6.0-alpha.6
  - @monorepolint/utils@0.6.0-alpha.6

## 0.6.0-alpha.5

### Patch Changes

- 9f6fea7: Upgraded versions to minor bumps
- Updated dependencies [9f6fea7]
  - @monorepolint/internal-mrl-config@0.6.0-alpha.5
  - @monorepolint/config@0.6.0-alpha.5
  - @monorepolint/rules@0.6.0-alpha.5
  - @monorepolint/utils@0.6.0-alpha.5
  - @monorepolint/core@0.6.0-alpha.5
  - @monorepolint/cli@0.6.0-alpha.5

## 0.6.0-alpha.4

### Patch Changes

- Updated dependencies [50b64ed]
- Updated dependencies [3883483]
  - @monorepolint/rules@0.6.0-alpha.4
  - @monorepolint/internal-mrl-config@0.6.0-alpha.4
  - @monorepolint/cli@0.6.0-alpha.4
  - @monorepolint/config@0.6.0-alpha.4
  - @monorepolint/core@0.6.0-alpha.4
  - @monorepolint/utils@0.6.0-alpha.4

## 0.6.0-alpha.3

### Patch Changes

- Updated dependencies [6a63a44]
- Updated dependencies [505f6c2]
  - @monorepolint/rules@0.6.0-alpha.3
  - @monorepolint/cli@0.6.0-alpha.3
  - @monorepolint/internal-mrl-config@0.6.0-alpha.3
  - @monorepolint/config@0.6.0-alpha.3
  - @monorepolint/core@0.6.0-alpha.3
  - @monorepolint/utils@0.6.0-alpha.3

## 0.6.0-alpha.2

### Patch Changes

- Updated dependencies [4f42aad]
- Updated dependencies [4f42aad]
- Updated dependencies [4f42aad]
  - @monorepolint/rules@0.6.0-alpha.2
  - @monorepolint/config@0.6.0-alpha.2
  - @monorepolint/utils@0.6.0-alpha.2
  - @monorepolint/core@0.6.0-alpha.2
  - @monorepolint/cli@0.6.0-alpha.2
  - @monorepolint/internal-mrl-config@0.6.0-alpha.2

## 0.6.0-alpha.1

### Patch Changes

- Updated dependencies [c57d210]
  - @monorepolint/config@0.6.0-alpha.1
  - @monorepolint/cli@0.6.0-alpha.1
  - @monorepolint/core@0.6.0-alpha.1
  - @monorepolint/internal-mrl-config@0.6.0-alpha.1
  - @monorepolint/rules@0.6.0-alpha.1
  - @monorepolint/utils@0.6.0-alpha.1

## 0.6.0-alpha.0

### Patch Changes

- Updated dependencies [8c4294d]
  - @monorepolint/config@0.6.0-alpha.0
  - @monorepolint/core@0.6.0-alpha.0
  - @monorepolint/cli@0.6.0-alpha.0
  - @monorepolint/internal-mrl-config@0.6.0-alpha.0
  - @monorepolint/rules@0.6.0-alpha.0
  - @monorepolint/utils@0.6.0-alpha.0

## 0.5.0

### Minor Changes

- 45fb496: I failed to take good notes over the last few years. Sorry.

### Patch Changes

- b024660: Internal change to how publish happens
- b024660: Internal
- Updated dependencies [b024660]
- Updated dependencies [3351fa9]
- Updated dependencies [3351fa9]
- Updated dependencies [b024660]
- Updated dependencies [45fb496]
  - @monorepolint/cli@0.5.0
  - @monorepolint/config@0.5.0
  - @monorepolint/core@0.5.0
  - @monorepolint/internal-mrl-config@0.5.0
  - @monorepolint/rules@0.5.0
  - @monorepolint/utils@0.5.0

## 0.5.0-beta.10

### Patch Changes

- Updated dependencies [3351fa9]
- Updated dependencies [3351fa9]
  - @monorepolint/config@0.5.0-beta.10
  - @monorepolint/rules@0.5.0-beta.10
  - @monorepolint/cli@0.5.0-beta.10
  - @monorepolint/core@0.5.0-beta.10
  - @monorepolint/internal-mrl-config@0.5.0-beta.10
  - @monorepolint/utils@0.5.0-beta.10

## 0.5.0-beta.9

### Patch Changes

- Internal
- Updated dependencies
  - @monorepolint/cli@0.5.0-beta.9
  - @monorepolint/config@0.5.0-beta.9
  - @monorepolint/core@0.5.0-beta.9
  - @monorepolint/internal-mrl-config@0.5.0-beta.9
  - @monorepolint/rules@0.5.0-beta.9
  - @monorepolint/utils@0.5.0-beta.9

## 0.5.0-beta.8

### Patch Changes

- b024660: Internal change to how publish happens
- Updated dependencies [b024660]
  - @monorepolint/cli@0.5.0-beta.8
  - @monorepolint/config@0.5.0-beta.8
  - @monorepolint/core@0.5.0-beta.8
  - @monorepolint/internal-mrl-config@0.5.0-beta.8
  - @monorepolint/rules@0.5.0-beta.8
  - @monorepolint/utils@0.5.0-beta.8

## 0.5.0-beta.0

### Minor Changes

- 45fb496: I failed to take good notes over the last few years. Sorry.

### Patch Changes

- Updated dependencies [45fb496]
  - @monorepolint/cli@0.5.0-beta.0
  - @monorepolint/config@0.5.0-beta.0
  - @monorepolint/core@0.5.0-beta.0
  - @monorepolint/internal-mrl-config@0.5.0-beta.0
  - @monorepolint/rules@0.5.0-beta.0
  - @monorepolint/utils@0.5.0-beta.0
