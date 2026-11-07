---
"@monorepolint/cli": patch
---

Fix the `mrl` and `monorepolint` bins failing to start on Linux. Their shebang was `#!/usr/bin/env node --enable-source-maps`, which Linux passes to `env` as a single argument (`env: 'node --enable-source-maps': No such file or directory`). The bins now use `#!/usr/bin/env node` and enable source maps at runtime with `process.setSourceMapsEnabled(true)`.
