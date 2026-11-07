#!/usr/bin/env node
import process from "node:process";

process.setSourceMapsEnabled(true);
import("@monorepolint/cli").then((i) => i.default());
