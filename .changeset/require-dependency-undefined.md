---
"@monorepolint/rules": patch
---

`requireDependency` no longer accepts `undefined` as a dependency version; use `REMOVE` to delete an entry. `undefined` removed the entry only in 0.6.0-alpha.3 through alpha.5. In alpha.6 it was accepted but silently ignored, and it now fails options validation. 0.5.0 never accepted it.
