---
"@monorepolint/rules": minor
---

Rule options are now validated with zod instead of runtypes (`runtypes` is no longer a dependency; `zod` is). Invalid options produce zod error messages, and the exported `Options` types are inferred from the zod schemas. Some option shapes that 0.5.0 accepted are now rejected or behave differently:

- `fileContents`: a `generator` that returns `undefined` no longer deletes the file. It reports "Generator function failed". Return `REMOVE` instead (or use `template: REMOVE`). A generator that throws now reports an unfixable error for that package instead of aborting the run.
- `consistentDependencies`: `options: {}` is rejected. Omit `options` or pass `ignoredDependencies: []`.
- `standardTsconfig`: `template` must be an object; a string template is no longer accepted.
