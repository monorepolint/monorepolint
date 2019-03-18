/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { check, Config, Options, resolveConfig } from "@monorepolint/core";
import { findWorkspaceDir } from "@monorepolint/utils";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
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
      "check [--verbose] [--fix] [--paths <paths>...]",
      "Checks the mono repo for lint violations",
      {
        verbose: {
          type: "boolean",
        },
        fix: {
          type: "boolean",
        },
        paths: {
          type: "array",
          string: true,
        },
      },
      handleCheck
    )
    .demandCommand(1, "At least one command required")
    .help()
    .showHelpOnFail(true)
    .parse();
}

function getVersion(): string {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8")).version;
}

function handleCheck(args: Options) {
  // tslint:disable:no-console
  console.log("monorepolint (mrl) v" + getVersion());
  console.log();

  const configPath = path.resolve(process.cwd(), ".monorepolint.config.ts");
  const config = Config.check(require(configPath));
  const resolvedConfig = resolveConfig(config, args, findWorkspaceDir(process.cwd())!);

  if (!check(resolvedConfig, process.cwd(), args.paths)) {
    console.error();

    const execPath = process.env.npm_execpath;

    const npmAgent =
      typeof execPath === "string"
        ? execPath.includes("yarn")
          ? "yarn"
          : execPath.includes("npm")
          ? "npm"
          : undefined
        : undefined;

    const runCommand = npmAgent === "yarn" ? "yarn mrl" : npmAgent === "npm" ? "npm run mrl" : "mrl";

    console.error("monorepolint (mrl) failed 1 or more checks");
    console.error();
    console.error(`For more information, run ${chalk.blue(`${runCommand} check --verbose`)}`);
    console.error(`To automatically fix errors, run ${chalk.blue(`${runCommand} check --fix`)}`);
    console.error();
    process.exit(100);
  }
}
