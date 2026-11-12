---
"@monorepolint/rules": patch
---

`consistentVersions`: in the array form of `matchDependencyVersions`, a dependency whose version has no semver version in it (for example `workspace:^` or `link:../foo`) is now reported unless it exactly matches a listed protocol value; previously it was skipped. Only listed values that end in `:` (such as `catalog:` or `workspace:`) are treated as protocols.
