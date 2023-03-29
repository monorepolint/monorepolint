/*!
 * Copyright 2023 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { Config, Options, ResolvedConfig, ResolvedRule } from "@monorepolint/config";

export function resolveConfig(config: Config, options: Options): ResolvedConfig {
  try {
    const rules: ResolvedRule[] = config.rules;

    if (rules.length === 0) {
      throw new Error("No rules!? Did you make a mistake?");
    }
    return {
      ...options,
      rules,
    };
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.error(`Unexpected error`, err);
    return process.exit(10);
  }
}
