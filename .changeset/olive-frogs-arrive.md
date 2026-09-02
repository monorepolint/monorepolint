---
"@monorepolint/rules": patch
---

Fix `requireDependency` ignoring `undefined` as a version. Setting a dependency's version to `undefined` removes it, as it did before the `REMOVE` symbol was introduced — it is now treated as an alias for `REMOVE` rather than being silently dropped.
