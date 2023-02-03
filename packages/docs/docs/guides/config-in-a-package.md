---
title: Putting your Config in a Package
---

Reasons you may want to put your config in a package:

- You want to keep using typescript
- You want to reuse your configuration for other people
- You like as pure as possible of a root package.json

Whatever your reason,

1. Create your new package. The monorepolint project calls theirs
   `@monorepolint/internal-mrl-config`.
2. Migrate your configuration to this package.

   This will greatly depend on how your own build system is setup. For MRL internally,
   it involves an index.ts file that roughly looks like:

   ```ts
   import * as Rules from "@monorepolint/rules";
   import type { Config } from "@monorepolint/config";

   export const config: Config = {
     rules: [
       /* ... */
     ],
   };
   ```

3. Update your root config

   ```js title=".monorepolint.config.mjs"
   // Don't forget to use your package!
   import config from "@monorepolint/internal-mrl-config";

   export default config;
   ```

4. Be sure to depend on your package in your workspace root

   ```json title="package.json"
   {
       ...
       "devDependencies": {
           "@monorepolint/cli": "^0.4.0",
           "@monorepolint/internal-mrl-config": "^0.4.0",
       }
   }
   ```
