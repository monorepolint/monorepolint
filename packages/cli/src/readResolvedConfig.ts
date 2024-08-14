/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Config, ConfigFn, Options } from "@monorepolint/config";
import { createWorkspaceContext, resolveConfig } from "@monorepolint/core";
import { Host } from "@monorepolint/utils";
import * as fs from "fs";
import * as path from "path";
import { timing } from "./timing.js";

export async function readResolvedConfig(host: Host, args: Options) {
  const configFilesToTry = [path.resolve(process.cwd(), ".monorepolint.config.mjs")];

  timing.start("Read/compile config");
  let unverifiedConfig: Config | ConfigFn | undefined;
  let foundConfig = undefined;
  for (const configPath of configFilesToTry) {
    if (!fs.existsSync(configPath)) {
      continue;
    }
    foundConfig = configPath;
    try {
      unverifiedConfig = (await import(configPath)).default;
      break;
    } catch (e) {
      if (!(e instanceof Error && e.message.startsWith("Cannot find module"))) {
        console.log(e);
      }
      throw new Error(
        `File exists ('${foundConfig}') but could not be imported due to error: ${(e as { message?: string })?.message}`,
        { cause: e }
      );
    }
  }
  if (unverifiedConfig === undefined) {
    if (foundConfig) {
      throw new Error(`File exists ('${foundConfig}') and was imported but the default export was undefined`);
    } else {
      throw new Error(
        `Unable to find a usable config file. Tried: \n${configFilesToTry.map((a) => `  - ${a}`).join("\n")}`
      );
    }
  }

  if (typeof unverifiedConfig === "function") {
    const tmpContext = await createWorkspaceContext(host, process.cwd(), { ...args, rules: [] });

    unverifiedConfig = await unverifiedConfig(tmpContext);

    if (tmpContext.isFailure()) {
      throw new Error("failed to process the config file");
    }
  }

  timing.start("Resolve config");
  return resolveConfig(unverifiedConfig, args);
}
