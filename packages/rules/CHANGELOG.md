# @monorepolint/rules

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
  - @monorepolint/utils@0.6.0-alpha.7

## 0.6.0-alpha.6

### Minor Changes

- c1914bd: Dropping support for anything less than node 20
- b8d9bfb: Major Enhancement: Introducing the REMOVE symbol for declarative cleanup

  This release introduces a powerful new `REMOVE` symbol that enables declarative removal of unwanted configurations, files, and dependencies across your monorepo. The REMOVE symbol provides a unified, intuitive API for cleanup operations across multiple rules.

  **What's New:**

  - **Universal REMOVE Symbol**: Import `{ REMOVE }` from `@monorepolint/rules` to use across all supported rules
  - **Four Rules Enhanced**: Added REMOVE support to fileContents, packageScript, requireDependency, and packageEntry rules
  - **Declarative Cleanup**: Specify what should NOT exist rather than just what should exist
  - **Consistent API**: Same REMOVE symbol works across all supported rules with intuitive syntax
  - **Safe Operations**: Handles non-existent items gracefully (no errors when removing something that doesn't exist)

  **Import and Usage Examples:**

  ```javascript
  import {
    fileContents,
    packageEntry,
    packageScript,
    REMOVE,
    requireDependency,
  } from "@monorepolint/rules";

  export default {
    rules: [
      // fileContents: Remove unwanted files entirely
      fileContents({
        file: "unwanted-config.json",
        template: REMOVE, // Delete file if it exists
      }),

      // packageScript: Remove scripts with direct or enhanced syntax
      packageScript({
        scripts: {
          "outdated-script": REMOVE, // Direct removal syntax
          build: "tsc", // Normal script management
          "conditional-task": {
            options: [
              "old-command",
              REMOVE,
            ], // Accept removal as valid option
            fixValue: REMOVE, // Remove when fixing
          },
        },
      }),

      // requireDependency: Remove dependencies across all types
      requireDependency({
        dependencies: {
          lodash: REMOVE, // Remove from dependencies
          react: "^18.0.0", // Keep with specific version
        },
        devDependencies: {
          "old-test-lib": REMOVE, // Remove from devDependencies
          vitest: "^1.0.0", // Keep this devDependency
        },
        peerDependencies: {
          "deprecated-peer": REMOVE, // Remove from peerDependencies
        },
      }),

      // packageEntry: Remove top-level package.json fields
      packageEntry({
        entries: {
          scripts: REMOVE, // Remove entire scripts field
          description: "My package", // Keep with specific value
          browser: REMOVE, // Remove browser field
          main: "./index.js", // Keep this field
        },
      }),
    ],
  };
  ```

  **Rule-Specific Features:**

  - **fileContents**: Simple `template: REMOVE` syntax for file deletion
  - **packageScript**: Direct syntax (`"script": REMOVE`) plus enhanced options syntax with `fixValue: REMOVE`
  - **requireDependency**: Works across dependencies, devDependencies, peerDependencies, and optionalDependencies
  - **packageEntry**: Remove any top-level package.json field while managing others normally

  **Benefits:**

  - **Maintainability**: Easier to specify and maintain cleanup rules across your monorepo
  - **Consistency**: Same REMOVE pattern works across different types of configurations
  - **Flexibility**: Mix removal with regular configuration management in the same rule
  - **Safety**: Won't error on items that are already removed/missing
  - **Integration**: Works seamlessly with `--fix` flag for automated cleanup operations

### Patch Changes

- 5cf4a93: Support protocols in consistentVersion rule, e.g. `catalog:`
- Updated dependencies [c1914bd]
  - @monorepolint/config@0.6.0-alpha.6
  - @monorepolint/core@0.6.0-alpha.6
  - @monorepolint/utils@0.6.0-alpha.6

## 0.6.0-alpha.5

### Patch Changes

- 9f6fea7: Upgraded versions to minor bumps
- Updated dependencies [9f6fea7]
  - @monorepolint/config@0.6.0-alpha.5
  - @monorepolint/utils@0.6.0-alpha.5
  - @monorepolint/core@0.6.0-alpha.5

## 0.6.0-alpha.4

### Patch Changes

- 50b64ed: Introduces a new rule: forceError
- 3883483: Introduces new rule: oncePerPackage
  - @monorepolint/config@0.6.0-alpha.4
  - @monorepolint/core@0.6.0-alpha.4
  - @monorepolint/utils@0.6.0-alpha.4

## 0.6.0-alpha.3

### Patch Changes

- 6a63a44: Feature: requireDependency now allows undefined for versions to remove the entry
  - @monorepolint/config@0.6.0-alpha.3
  - @monorepolint/core@0.6.0-alpha.3
  - @monorepolint/utils@0.6.0-alpha.3

## 0.6.0-alpha.2

### Patch Changes

- 4f42aad: Updated docs with example of removing a file with fileContents rule
- 4f42aad: Improved message and longMessage for the fileContents rule
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

- Updated dependencies [4f42aad]
  - @monorepolint/config@0.6.0-alpha.2
  - @monorepolint/utils@0.6.0-alpha.2
  - @monorepolint/core@0.6.0-alpha.2

## 0.6.0-alpha.1

### Patch Changes

- Updated dependencies [c57d210]
  - @monorepolint/config@0.6.0-alpha.1
  - @monorepolint/core@0.6.0-alpha.1
  - @monorepolint/utils@0.6.0-alpha.1

## 0.6.0-alpha.0

### Patch Changes

- Updated dependencies [8c4294d]
  - @monorepolint/config@0.6.0-alpha.0
  - @monorepolint/core@0.6.0-alpha.0
  - @monorepolint/utils@0.6.0-alpha.0

## 0.5.0

### Minor Changes

- 3351fa9: @monorepolint/rules exposes createRuleFactory
- 45fb496: I failed to take good notes over the last few years. Sorry.

### Patch Changes

- b024660: Internal change to how publish happens
- b024660: Internal
- Updated dependencies [b024660]
- Updated dependencies [3351fa9]
- Updated dependencies [b024660]
- Updated dependencies [45fb496]
  - @monorepolint/config@0.5.0
  - @monorepolint/core@0.5.0
  - @monorepolint/utils@0.5.0

## 0.5.0-beta.10

### Minor Changes

- 3351fa9: @monorepolint/rules exposes createRuleFactory

### Patch Changes

- Updated dependencies [3351fa9]
  - @monorepolint/config@0.5.0-beta.10
  - @monorepolint/core@0.5.0-beta.10
  - @monorepolint/utils@0.5.0-beta.10

## 0.5.0-beta.9

### Patch Changes

- Internal
- Updated dependencies
  - @monorepolint/config@0.5.0-beta.9
  - @monorepolint/core@0.5.0-beta.9
  - @monorepolint/utils@0.5.0-beta.9

## 0.5.0-beta.8

### Patch Changes

- b024660: Internal change to how publish happens
- Updated dependencies [b024660]
  - @monorepolint/config@0.5.0-beta.8
  - @monorepolint/core@0.5.0-beta.8
  - @monorepolint/utils@0.5.0-beta.8

## 0.5.0-beta.0

### Minor Changes

- 45fb496: I failed to take good notes over the last few years. Sorry.

### Patch Changes

- Updated dependencies [45fb496]
  - @monorepolint/config@0.5.0-beta.0
  - @monorepolint/core@0.5.0-beta.0
  - @monorepolint/utils@0.5.0-beta.0
