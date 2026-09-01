---
"@monorepolint/utils": patch
---

Fix `getWorkspacePackageDirs` silently ignoring negated workspace patterns (e.g. `["packages/*", "!packages/excluded"]`) in non-pnpm (yarn/npm `workspaces`) monorepos. Each pattern was previously passed to `glob.sync` in isolation, so a `!`-prefixed pattern was treated as a literal, unmatchable path instead of an exclusion. Positive and negative patterns are now expanded separately and negatives are filtered out of the accumulated result set.
