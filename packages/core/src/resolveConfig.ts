/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import camelCase from "camelcase";
import * as path from "path";
import { ValidationError } from "runtypes";
import { __importDefault } from "tslib";

import { Config, Options, ResolvedConfig, ResolvedRule, RuleEntry, RuleModule } from "./Config";

export function resolveConfig(config: Config, options: Options, workspaceRootDir: string): ResolvedConfig {
  try {
    const rules = [];
    for (let [type, ruleEntries] of Object.entries(config.rules)) {
      if (!Array.isArray(ruleEntries)) {
        ruleEntries = [ruleEntries];
      }
      for (const ruleEntry of ruleEntries) {
        rules.push({
          ...ruleEntry,
          ...resolveRule(type, workspaceRootDir, ruleEntry),
        });
      }
    }

    return {
      ...options,
      rules,
    };
  } catch (err) {
    if (err instanceof ValidationError) {
      // tslint:disable-next-line:no-console
      console.error(`Failed to parse config for key '${err.key}':`, err.message, err);
    }
    return process.exit(10);
  }
}

function resolveRule(type: string, workspaceRootDir: string, ruleEntry: RuleEntry): ResolvedRule {
  const ruleModule = loadRuleModule(type, workspaceRootDir);

  try {
    ruleModule.optionsRuntype.check(ruleEntry.options);

    const ret: ResolvedRule = {
      ...ruleModule,
      ...ruleEntry,
    };

    return ret;
  } catch (err) {
    if (err instanceof ValidationError) {
      // tslint:disable:no-console
      console.error(`Failed to validate the configuration for the rule '${type}'`);
      console.group();
      console.error("Recieved:", ruleEntry.options);
      console.error("Error Message:", err.message);
      console.error(err.key);
    }
    return process.exit(10);
  }
}

function loadRuleModule(type: string, workspaceRootDir: string) {
  const mod = type.startsWith(":")
    ? // tslint:disable-next-line:no-implicit-dependencies
      require("@monorepolint/rules")[camelCase(type.slice(1))]
    : type.startsWith(".")
    ? __importDefault(path.resolve(workspaceRootDir, type))
    : type.includes(":")
    ? require(type.split(":")[0])[camelCase(type.split(":")[1])]
    : __importDefault(type);

  try {
    return RuleModule.check(mod) as RuleModule;
  } catch (err) {
    if (err instanceof ValidationError) {
      // tslint:disable-next-line:no-console
      console.error(`Failed load rule '${type}':`, err.message, err);
    }
    return process.exit(10);
  }
}
