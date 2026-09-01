# Dependency Upgrade Notes (PR #483)

This covers the dependency bumps landed in PR #483. All bumps are in-range (caret ranges,
no majors). The upgrade was security-motivated (Dependabot security alerts), so security
fixes are called out explicitly below wherever one was found in the researched range.

## typescript-eslint (`@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `typescript-eslint`) 8.43.0 → 8.69.0

This repo's `eslint.config.mjs` uses `tseslint.configs.recommended` (not `strict`), with no
typed-linting (`project`/`projectService` not configured), so most rule-behavior changes
below only matter if/when this repo turns on typed linting or the `strict` preset.

**Notable changes across the range:**

- New rules added (not in `recommended`, so dormant unless opted into): `strict-void-return`
  (8.53.0), `no-useless-default-assignment` (8.50.0), `no-unused-private-class-members`
  (8.47.0, extension rule).
- `no-restricted-imports` extension rule deprecated in favor of the upstream ESLint core
  rule (8.65.0).
- `no-loop-func` gained `using`/`await using` support and was deprecated (8.64.0).
- Support added for ESLint v10 (8.56.0) and TypeScript 6 (8.58.0), plus a new warning when
  a TS 7 install is detected (8.65.0).
- `parser`: now errors if both `project` and `projectService` are set at once (8.46.4) — not
  a concern here since neither is set.
- Many `no-unnecessary-type-assertion`, `prefer-optional-chain`, `no-floating-promises`,
  `no-misused-promises`, `no-base-to-string`, and `no-shadow` fixes/false-positive
  corrections landed throughout the range (these rules are all active via `recommended`).
- `await-thenable` (8.44.0) now also flags non-promise values passed to promise-aggregator
  methods (`Promise.all`, etc.) — this is an active `recommended` rule and could newly flag
  code that wasn't flagged before.
- `no-unused-vars` gained an autofix to remove now-unused imports (8.53.0) — active in this
  repo (custom options are set, but the rule itself is `error`).

**Watch out:** `await-thenable`'s new promise-aggregator check and the various
`no-unnecessary-type-assertion`/`prefer-optional-chain`/`no-shadow` fixes are all in rules
this repo already runs at `error`. Expect `pnpm lint` to possibly surface a handful of new
findings (mostly corrections of previously-missed cases, not new false positives) the first
time this range is picked up. No new rules were added to `recommended`, so no new rule
category should start firing outright.

## eslint / @eslint/js 9.35.0 → 9.39.5

- 9.39.x: multiple rules changed which AST range they highlight (tighter/more accurate
  error locations) for `complexity`, `for-direction`, `no-dupe-args`, `no-dupe-class-members`.
  Editor/CI output for these rules will point at smaller spans than before — not a behavior
  change, just where the squiggle appears.
- 9.39.x: unified performance report when `TIMING` env var is set with `--concurrency`
  (multithread mode).
- **Security:** 9.39.4 bumped `ajv` to address security vulnerabilities and patched a
  `minimatch` security vulnerability (backported for the 9.x line).
- 9.39.5: dependency/build maintenance only (pinned `fflate`, Node 24 for docs build, no
  user-facing rule changes).

**Watch out:** nothing rule-behavior-breaking found for this range beyond the highlighted-range
tweaks above. The `ajv`/`minimatch` security patches in 9.39.4 are worth noting as the likely
reason this bump was flagged by Dependabot.

## vitest / @vitest/coverage-v8 4.0.14 → 4.1.11

Vitest 4.1 is a real minor with new features; picked up via the caret range.

**Notable changes:**

- New **test tags** feature for grouping tests with shared config (timeouts/retries) and a
  filter syntax (`and`/`or`/`not`/wildcards).
- New `aroundEach` / `aroundAll` hooks (wrap a test/suite, must call the provided `runTest`).
- Experimental native Node.js mode (`viteModuleRunner: false`) — bypasses Vite's sandbox;
  file transforms/Vite plugins unavailable in that mode.
- New `--detect-async-leaks` flag for leaked timers/unresolved resources.
- Mock improvements: `mockThrow`/`mockThrowOnce`, chai-style assertions on mocks
  (`to.have.been.called`).
- Coverage: `ignore start/stop` comment hints restored for both `v8` and `istanbul`
  providers; new `coverage.changed` option to scope coverage to changed files only; HTML
  coverage viewer fixes for subpath deployments.
- Vite 8 support added (uses the installed `vite` version when present).

**Breaking change:** hooks (`beforeAll`, `afterAll`, `aroundAll`) now receive the documented
context object instead of the previously-undocumented `Suite` as their first argument. Only
matters if this repo's tests destructure/inspect that first hook argument (unlikely, but
worth a grep before assuming it's a no-op).

**Watch out:** the native Node.js mode and test-tags features are opt-in, so no action
needed unless adopted. The hook-argument change is the one item worth a quick check in
`packages/*/__tests__` for any `beforeAll`/`afterAll` callbacks that read their first arg.

## zod 4.1.5 → 4.5.4 (used in `packages/rules` for schema validation)

**Notable changes:**

- Flagship feature: `z.compile()` — precompiles a schema for significantly faster parsing
  (3–9x, claimed) with no API differences for callers.
- New APIs: `z.creditCard()`, `z.properties()`, `.exactPartial()`, and a fast-path
  `z.validate()` for boolean-only validation.
- Large memory-footprint reduction per schema via lazy method binding.
- Several **breaking soundness fixes** bundled into a semver-minor per Zod's own
  versioning conventions (Zod treats these as non-breaking "correctness" fixes, but they
  do change validation outcomes):
  - `z.iso.datetime()` now requires seconds per RFC 3339.
  - String length now counts Unicode code points instead of UTF-16 units.
  - Record key / intersection semantics tightened to match TypeScript.
  - `__proto__` keys are now always stripped.
  - Stricter validation for `ipv6`, `ulid`, `httpUrl`, `emoji` string formats.
  - Properties typed `z.undefined()` are now treated as required (key must exist).
  - `.merge()` now throws if the receiving schema has refinements.
- New locales added (Bengali, Central Kurdish, Hindi, Kannada, Norwegian Nynorsk,
  Brazilian Portuguese, Slovak, Turkmen).

**Watch out:** the stricter string-format and `z.iso.datetime()` validation changes are the
ones most likely to affect `packages/rules`' schemas if any config validation relies on
`z.string().datetime()`, `z.string().ipv6()`, `ulid()`, `httpUrl()`, or `emoji()` — worth a
grep for these in `packages/rules/src` and a check that existing valid inputs still pass.
The `__proto__`-stripping and Unicode-length changes are defense-in-depth improvements and
unlikely to break anything already-valid.

## turbo / eslint-config-turbo 2.5.6 → 2.10.12

**Notable changes:**

- `turbo.json`/config: added `cacheMaxAge` and `cacheMaxSize` for local cache eviction.
- Codemod/migration tooling: support for `turbo.jsonc`, package-manager catalogs, and
  preserved prerelease info in the schema URL during `@turbo/codemod migrate`.
- Perf: streaming dry-run JSON output, merged tree-wildcard globs, repo walked once during
  pruning, fewer stat calls for unused package configs.
- **Security:** `js-yaml` bumped to 4.3.1 addressing security advisory GHSA-5p4m-2wfm-xmqj.
- `eslint-config-turbo` ships from the same monorepo/release train; no config-shape changes
  specific to it were found beyond following turbo's version bumps.

**Watch out:** no breaking `turbo.json` schema changes were found in this range — the new
`cacheMaxAge`/`cacheMaxSize` fields are additive. The `js-yaml` bump is a real security fix
and plausibly one of the reasons this dependency was included in the security-motivated
batch.

## @docusaurus/core, preset-classic, utils, utils-common 3.8.1 → 3.10.2 (docs)

**Notable changes:**

- 3.9.0: DocSearch v4 runtime support; Rspack upgraded (1.4→1.5, then 1.7 in 3.10);
  `i18n.localeConfigs[locale].{url,baseUrl}` config; sidebar item `key` attribute to avoid
  translation conflicts.
- 3.10.0: "Docusaurus Faster" (Rspack-based build) becomes stable and is enabled by default
  under a new v4-migration flag system; Algolia integration upgraded to DocSearch v4.5;
  code blocks changed from `<span>` to `<div>` (fixes a Firefox text-selection bug, but is a
  DOM-shape change worth knowing about if there's custom CSS/JS targeting code block markup).
  Newly-`init`'d TypeScript sites default to `strict: true` (doesn't affect an existing site).
- 3.10.2: bundler fix removing a `@swc/html` import (StackBlitz playground fix), dev-server
  HTTPS fix for non-RSA TLS certs, `docusaurus serve --host` fix, migrated to
  `@11ty/gray-matter`.

**Watch out:** the code-block `<span>`→`<div>` DOM change (3.10.0) is the one item worth a
quick visual check of `packages/docs` if there's any custom CSS/JS keyed off the old markup.
Everything else in this range is additive or a bug fix.

## @algolia/client-search 5.37.0 → 5.57.0 (docs)

No changelog located with specifics for this range beyond general Algolia JS client
maintenance releases (bug fixes/type updates). Paired with Docusaurus 3.10's DocSearch v4.5
upgrade above; no repo-specific concerns identified.

## react + react-dom 19.1.1 → 19.2.8 (docs)

React 19.2 (the notable minor in this range, released ~Oct 2025) added:

- `<Activity>` component — hide/restore UI subtrees while preserving state; effects pause
  and updates defer while hidden.
- `useEffectEvent` hook — extract non-reactive logic from an Effect into a stable-identity
  callback that still sees fresh props/state.
- `cacheSignal` — React Server Components only; an `AbortSignal` that fires when a `cache()`
  scope's lifetime ends.
- Patch releases in the 19.2.x line (19.2.6–19.2.8) were mostly Server Components
  perf/type-hardening fixes, including a 19.2.6 regression (fixed in 19.2.7) that broke
  `FormData` handling in Server Actions.

**Watch out:** these are opt-in APIs; Docusaurus itself controls how React is used under the
hood, so no action is needed unless `packages/docs` has custom React components that would
benefit from `<Activity>`/`useEffectEvent`. The 19.2.6 Server Actions/FormData regression is
irrelevant here since Docusaurus's classic preset doesn't use Server Actions.

## glob 11.0.3 → 11.1.0 (workspace packages)

- **Security:** fixes advisory
  [GHSA-5j98-mcp5-4vw2](https://github.com/isaacs/node-glob/security/advisories/GHSA-5j98-mcp5-4vw2)
  related to unsafe shell invocation from the glob CLI.
- New CLI-only flags: `--shell` (explicitly opt into the old, unsafe shell-invocation
  behavior — will be removed in v12) and `--cmd-arg`/`-g` (safe way to pass positional
  arguments to the command the CLI runs). Shell-command detection also improved to safely
  quote arguments with spaces/quotes on known shells.

**Watch out:** this is a CLI-focused security fix; the programmatic `glob()`/`Glob` API used
by `packages/archetypes` and `packages/utils` is unaffected. No action needed unless the repo
invokes the `glob` CLI directly (it doesn't, per a scan of package.json scripts).

## semver 7.7.2 → 7.8.5 (root, and `packages/rules`)

**Notable changes:**

- 7.8.0: new `truncate` function; CLI now warns when it silently defaults to `--inc=patch`.
- 7.8.1–7.8.5: a run of correctness fixes to prerelease/build-metadata handling — stripping
  build metadata before comparator trimming, fixing tilde-range lower bounds with
  `includePrerelease`, rejecting invalid numeric segments after x-ranges, and correcting
  dotted-prerelease-identifier increment logic.

**Watch out:** `packages/rules` uses `semver` for version-range checks in rules; the
prerelease/x-range edge-case fixes above are the most likely to change behavior for anyone
linting prerelease version strings, but these are all bug fixes tightening correctness, not
new restrictions on well-formed input.

## yargs 18.0.0 → 18.1.0 (`packages/cli`)

- **Security:** patched a local prototype-pollution vulnerability in `apply-extends`
  (yargs' handling of `extends` in `.yargsrc`-style config merging).
- New: yargs now ignores `bun` when determining the bin name (Bun runtime compatibility).
- Localization fixes: corrected German "count" translation, added Georgian translation.

**Watch out:** the prototype-pollution fix in `apply-extends` is a genuine security fix and
plausibly the direct reason yargs was included in this security-motivated batch — worth
flagging explicitly to the maintainer.

## tmp 0.2.5 → 0.2.7 (`packages/rules`, dev dependency)

- **Security:** fixed a path-traversal bug where `prefix`/`postfix`/`template` values that
  were arrays or duck-typed objects (with an `includes` method) could bypass the check for
  `../`-style relative-path segments, potentially allowing temp files/dirs to be created
  outside the intended directory. The fix enforces `typeof value === "string"` before the
  substring/relative-path check for all three options.
- Note: this is separate from the previously-disclosed `tmp` symlink CVE-2025-54798, which
  was already fixed by 0.2.4 (i.e. already fixed before this repo's 0.2.5 baseline) — this
  bump is a distinct, newer hardening fix.

**Watch out:** `tmp` is a dev/test dependency here (used in `packages/rules` tests, per
`pnpm list`), so this is low-risk, but the fix is a real security hardening — worth calling
out since this batch was security-motivated.

## jest-diff 30.1.2 → 30.5.1 (`packages/rules`)

No jest-diff-specific entries were found in the Jest monorepo CHANGELOG for this exact
range; changes in this window appear to have been bundled under broader Jest-monorepo
releases without a jest-diff-specific summary. No behavior changes surfaced in research.

## Small / one-line bumps

- **@types/node** 22.18.1 → 22.20.1 — routine Node.js type definition updates tracking
  Node's own API surface; no action needed.
- **@types/micromatch** 4.0.9 → 4.0.10 — routine type-definition patch.
- **@types/semver** 7.7.1 → 7.8.0 — type definitions catching up to semver's new `truncate`
  export (see semver section above).
- **tsup** 8.5.0 → 8.5.1 — patch release; no changelog specifics located, treat as a bug-fix
  patch.
- **dprint** 0.50.1 → 0.50.2 — patch release: upgraded Wasmer to 6.1.0-rc.3 (fixes a build
  failure on Rust ≥ 1.89.0) and fixed handling of empty proxy environment variables.
- **globals** 16.3.0 → 16.5.0 — routine updates to the bundled list of environment global
  identifiers (used by `eslint.config.mjs`); no changelog with version-specific entries was
  located, but this package is data-only (JSON of global names) so risk is minimal.
- **lint-staged** 16.1.6 → 16.4.0 — notable fix: git commands that succeed (exit 0) but
  write to stderr are no longer treated as failures; stderr is now ignored when the process
  exit code is 0 (this was a regression introduced when lint-staged switched from
  execa/nano-spawn to tinyexec in 16.3.0). Fixed within this same range, so net effect for
  this repo's baseline (16.1.6) is neutral-to-positive.
- **@changesets/cli** 2.29.6 → 2.31.1 — 2.31.0 added stricter CLI flag validation (errors on
  unsupported flags per-command) and prints matching command usage on mistakes; a
  developer-ergonomics change, no breaking API changes found.
- **typescript** 5.9.2 → 5.9.3 — patch release within the 5.9.x line; no breaking changes
  expected at a patch version.

## Summary

The five things most worth a maintainer's attention:

1. **Two real security fixes landed in this batch**: `yargs` 18.1.0 patches a local
   prototype-pollution vulnerability in `apply-extends`, and `tmp` 0.2.7 fixes a path-traversal
   bug via non-string `prefix`/`postfix`/`template` values. `glob` 11.1.0 and `turbo`
   2.10.x also carry security fixes (unsafe CLI shell invocation, and a `js-yaml`
   advisory, respectively), and `eslint` 9.39.4 patched `ajv`/`minimatch` security issues.
   These are almost certainly why this batch was flagged.
2. **zod 4.1 → 4.5** bundles several validation-tightening changes (stricter `datetime()`,
   `ipv6`/`ulid`/`httpUrl`/`emoji` formats, Unicode-aware string length) that Zod calls
   non-breaking but which can change what previously-valid input now fails — worth a quick
   grep of `packages/rules` schemas for these formats before assuming zero impact.
   2b. Also new in zod: `z.compile()` for a meaningful parse-speed win, usable opportunistically
   in hot paths if `packages/rules` schema validation ever shows up in profiling.
3. **typescript-eslint 8.43 → 8.69**: no new rules were added to the `recommended` preset
   this repo uses, but `await-thenable`, `no-unnecessary-type-assertion`,
   `prefer-optional-chain`, and `no-shadow` (all active) all received correctness fixes —
   expect `pnpm lint` to possibly surface a small number of newly (correctly) flagged spots.
4. **vitest 4.0 → 4.1** is a real minor: test tags, `aroundEach`/`aroundAll` hooks, and a
   `--detect-async-leaks` flag are all new and opt-in. The one breaking change (hooks
   receive a documented context object instead of the undocumented `Suite`) is worth a
   quick grep of test setup code for anything reading that first hook argument.
5. **Docusaurus 3.8 → 3.10** changed code-block markup from `<span>` to `<div>` (3.10.0,
   fixing a Firefox selection bug) and made "Docusaurus Faster" (Rspack) the stable default
   build path — worth a visual smoke-test of `packages/docs` after this upgrade, especially
   anything with custom CSS targeting code blocks.
