/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Options } from "@monorepolint/config";
import { check } from "@monorepolint/core";
import { CachingHost, SimpleHost } from "@monorepolint/utils";
import chalk from "chalk";
import * as fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { readResolvedConfig } from "./readResolvedConfig.js";
import { timing } from "./timing.js";
import { getRunCommand } from "./getRunCommand.js";

export default function run() {
  yargs(hideBin(process.argv))
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
        stats: {
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
    .strictCommands()
    .help()
    .showHelpOnFail(true)
    .parse();
}

function getVersion(): string {
  return JSON.parse(fs.readFileSync(new URL("../../package.json", import.meta.url), "utf-8")).version;
}

async function handleCheck(args: Options) {
  // tslint:disable:no-console
  console.log("monorepolint (mrl) v" + getVersion());
  console.log();

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.MRL_CACHING_HOST === "true") {
    console.log("++++ USING EXPERIMENTAL CACHING HOST");
  }
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const host = process.env.MRL_CACHING_HOST === "true" ? new CachingHost() : new SimpleHost();
  try {
    const resolvedConfig = await readResolvedConfig(host, args);
    timing.start("Run Checks");
    const checkResult = await check(resolvedConfig, host, process.cwd(), args.paths, args.stats);
    timing.start("Flush host");
    await host.flush();
    timing.stop();

    if (args.stats) {
      timing.printResults();
    }

    if (!checkResult) {
      console.error();

      const runCommand = getRunCommand();

      console.error("monorepolint (mrl) failed 1 or more checks");
      console.error();
      console.error(`For more information, run ${chalk.blue(`${runCommand} check --verbose`)}`);
      console.error(`To automatically fix errors, run ${chalk.blue(`${runCommand} check --fix`)}`);
      console.error();
      process.exit(100);
    }
  } catch (e) {
    console.error();

    const runCommand = getRunCommand();

    console.error("monorepolint (mrl) had an unexpected error:");
    console.error(e);
    console.error();
    console.error(`More information may be available; run ${chalk.blue(`${runCommand} check --verbose`)}`);
    console.error();
    process.exit(101);
  }
}
