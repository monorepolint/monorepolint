/*!
 * Copyright (c) 2018 monorepo-lint (http://monorepo-lint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as path from "path";

import { check, Config, resolveConfig } from "@monorepo-lint/core";
import { findWorkspaceDir } from "@monorepo-lint/utils";
import * as yargs from "yargs";

export default function run() {
  try {
    // tslint:disable-next-line:no-implicit-dependencies
    require("ts-node").register();
  } catch (err) {
    // no ts-node, no problem
  }
  yargs
    .command({
      command: "check [--verbose]",
      describe: "Checks the mono repo for lint violations",
      builder: y =>
        y
          .option("verbose", {
            count: true,
            type: "boolean"
          })
          .option("fix", {
            type: "boolean"
          }),
      handler: handleCheck
    })
    .demandCommand(1, "At least one command required")
    .help()
    .showHelpOnFail(true)
    .parse();
}

interface Args {
  fix: boolean;
  verbose: boolean;
}

function handleCheck(args: Args) {
  const configPath = path.resolve(process.cwd(), "monorepo-lint.config.ts");
  const config = Config.check(require(configPath));
  const resolvedConfig = resolveConfig(
    config,
    args,
    findWorkspaceDir(process.cwd())!
  );

  if (!check(resolvedConfig, process.cwd())) {
    // tslint:disable-next-line:no-console
    console.error("Failed");
    process.exit(100);
  }
}
