---
"@monorepolint/cli": patch
---

If loading the config or running checks throws, `mrl` now prints `monorepolint (mrl) had an unexpected error:` followed by the error and exits with code 101.
