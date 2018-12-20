/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as path from "path";

import { check, Config, Options, resolveConfig } from "@monorepolint/core";
import { findWorkspaceDir } from "@monorepolint/utils";
import yargs from "yargs";

export default function run() {
  try {
    // tslint:disable-next-line:no-implicit-dependencies
    require("ts-node").register();
  } catch (err) {
    // no ts-node, no problem
  }
  yargs
    .command(
      "check [--verbose] [--fix]",
      "Checks the mono repo for lint violations",
      {
        verbose: {
          type: "boolean",
        },
        fix: {
          type: "boolean",
        },
      },
      handleCheck
    )
    .demandCommand(1, "At least one command required")
    .help()
    .showHelpOnFail(true)
    .parse();
}

function handleCheck(args: Options) {
  const configPath = path.resolve(process.cwd(), ".monorepolint.config.ts");
  const config = Config.check(require(configPath));
  const resolvedConfig = resolveConfig(config, args, findWorkspaceDir(process.cwd())!);

  if (!check(resolvedConfig, process.cwd())) {
    // tslint:disable-next-line:no-console
    console.error("Failed");
    process.exit(100);
  }
}
