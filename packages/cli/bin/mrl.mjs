#!/usr/bin/env node --enable-source-maps

import("@monorepolint/cli").then((i) => i.default());
