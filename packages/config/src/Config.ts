/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "./Context.js";
// TODO: extract all these types to their own files

export interface RuleEntry<T = unknown> {
  options?: T;
  excludePackages?: string[];
  includePackages?: string[];
  includeWorkspaceRoot?: boolean;
  id?: string;
}

export interface RuleModule<X = unknown> {
  check: (context: Context) => Promise<unknown> | unknown;
  name: string;
  id: string;
  validateOptions: (options: X) => void;
  printStats?: () => void;
  ruleEntry: RuleEntry<X>;
}

export interface Config {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules: RuleModule<any>[];
}

export interface Options {
  readonly verbose?: boolean;
  readonly fix?: boolean;
  readonly paths?: ReadonlyArray<string>;
  readonly silent?: boolean;
  readonly stats?: boolean;
}

// TODO: Make the extra param required. I'm not doing it now because this change is hard enough to read
// export type Checker<T extends r.Runtype> =
//   | ((context: Context, args: r.Static<T>, extra?: { id: string }) => void)
//   | ((context: Context, args: r.Static<T>, extra?: { id: string }) => Promise<void>);

export type ResolvedRule<X = unknown> = RuleModule<X>;

export interface ResolvedConfig extends Options {
  readonly rules: ReadonlyArray<ResolvedRule>;
}
