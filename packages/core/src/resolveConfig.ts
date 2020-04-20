/*!
 * Copyright 2019 Palantir Technologies, Inc.
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
      if (ruleEntries === false) {
        continue;
      }
      if (!Array.isArray(ruleEntries)) {
        ruleEntries = [ruleEntries === true ? {} : ruleEntries];
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
    } else {
      // tslint:disable-next-line:no-console
      console.error(`Unexpected error: ${err}`);
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
    // tslint:disable:no-console
    console.error(`Failed to validate the configuration for the rule '${type}'`);
    console.group();

    if (err instanceof ValidationError) {
      console.error("Recieved:", ruleEntry.options);
      console.error("Error Message:", err.message);
      console.error(err.key);
    } else {
      console.error(`Unexpected error occured: ${err}`);
    }

    console.groupEnd();
    return process.exit(10);
  }
}

function loadRuleModule(type: string, workspaceRootDir: string) {
  let mod: any;
  if (type.startsWith(":")) {
    // if the type starts with `:`, its a built in rule so should be imported from `@monorepolint/rules`
    const ruleVariable = camelCase(type.slice(1));
    // tslint:disable-next-line:no-implicit-dependencies
    mod = require("@monorepolint/rules")[ruleVariable];
  } else if (type.startsWith(".")) {
    // if the type starts with `.` then the rule should be a default export from a local file
    mod = __importDefault(require(path.resolve(workspaceRootDir, type))).default;
  } else if (type.includes(":")) {
    // if the type includes `:`, then we should import a const rather than default
    const [packageName, ruleVariable] = type.split(":");
    mod = require(require.resolve(packageName, { paths: [workspaceRootDir] }))[camelCase(ruleVariable)];
  } else {
    // otherwise just import the default
    mod = __importDefault(require(require.resolve(type, { paths: [workspaceRootDir] }))).default;
  }

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
