/*!
 * Copyright (c) 2018 monorepo-lint (http://monorepo-lint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as path from "path";
import { ValidationError } from "runtypes";
import {
  Config,
  Options,
  ResolvedConfig,
  ResolvedRule,
  RuleEntry,
  RuleModule
} from "./Config";

export function resolveConfig(
  config: Config,
  options: Options,
  workspaceRootDir: string
): ResolvedConfig {
  try {
    return {
      ...options,
      rules: Object.entries(config.rules).map(([type, ruleEntry]) => ({
        ...ruleEntry,
        ...resolveRule(type, workspaceRootDir, ruleEntry)
      }))
    };
  } catch (err) {
    if (err instanceof ValidationError) {
      // tslint:disable-next-line:no-console
      console.error(
        `Failed to parse config for key '${err.key}':`,
        err.message,
        err
      );
    }
    return process.exit(10);
  }
}

function resolveRule(
  type: string,
  workspaceRootDir: string,
  ruleEntry: RuleEntry
): ResolvedRule {
  const ruleModule = loadRuleModule(type, workspaceRootDir);

  try {
    ruleModule.optionsRuntype.check(ruleEntry.options);

    const ret: ResolvedRule = {
      ...ruleModule,
      ...ruleEntry
    };

    return ret;
  } catch (err) {
    if (err instanceof ValidationError) {
      // tslint:disable:no-console
      console.error(
        `Failed to validate the configuration for the rule '${type}'`
      );
      console.group();
      console.error("Recieved:", ruleEntry.options);
      console.error("Error Message:", err.message);
      console.error(err.key);
    }
    return process.exit(10);
  }
}

function loadRuleModule(type: string, workspaceRootDir: string) {
  const q = type.startsWith(":")
    ? "@monorepo-lint/expect-" + type.substring(1)
    : type.startsWith(".")
    ? path.resolve(workspaceRootDir, type)
    : type;

  try {
    return RuleModule.check(require(q).default) as RuleModule;
  } catch (err) {
    if (err instanceof ValidationError) {
      // tslint:disable-next-line:no-console
      console.error(`Failed load rule '${type}' (${q}):`, err.message, err);
    }
    return process.exit(10);
  }
}
