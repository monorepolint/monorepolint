---
"@monorepolint/rules": patch
---

`requireDependency` no longer accepts `undefined` as a dependency version. Use `REMOVE` to delete an entry. `undefined` worked only in 0.6.0-alpha.3 through alpha.5 (it stopped working in alpha.6), and it now fails options validation instead of being silently ignored.
