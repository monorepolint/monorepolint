/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { check, resolveConfig } from "@monorepolint/core";
import { Options } from "@monorepolint/config";
import { CachingHost, SimpleHost, Timing } from "@monorepolint/utils";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const timing = new Timing("CLI Timing Data");

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

  if (process.env.MRL_CACHING_HOST === "true") {
    console.log("++++ USING EXPERIMENTAL CACHING HOST");
  }
  const host = process.env.MRL_CACHING_HOST === "true" ? new CachingHost() : new SimpleHost();

  const configFilesToTry = [path.resolve(process.cwd(), ".monorepolint.config.mjs")];

  timing.start("Read/compile config");
  let unverifiedConfig;
  let foundConfig = undefined;
  let importError: unknown = undefined;
  for (const configPath of configFilesToTry) {
    if (!fs.existsSync(configPath)) {
      continue;
    }
    foundConfig = configPath;
    try {
      unverifiedConfig = (await import(configPath)).default;
      break;
    } catch (e) {
      importError = e;
      if (!(e instanceof Error && e.message.startsWith("Cannot find module"))) {
        console.log(e);
      }
      break;
    }
  }
  if (unverifiedConfig === undefined) {
    if (importError) {
      throw new AggregateError(
        [importError],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `File exists ('${foundConfig}') but could not be imported due to error: ${(importError as any)?.message}`
      );
    } else if (foundConfig) {
      throw new Error(`File exists ('${foundConfig}') and was imported but the default export was undefined`);
    } else {
      throw new Error(
        `Unable to find a usable config file. Tried: \n${configFilesToTry.map((a) => `  - ${a}`).join("\n")}`
      );
    }
  }

  timing.start("Resolve config");
  const resolvedConfig = resolveConfig(unverifiedConfig, args);
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
