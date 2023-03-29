/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as r from "runtypes";
import { Context } from "./Context.js";
// TODO: extract all these types to their own files

export const RuleEntry = r.Partial({
  options: r.Unknown,
  excludePackages: r.Array(r.String),
  includePackages: r.Array(r.String),
  includeWorkspaceRoot: r.Boolean,
  id: r.String.optional(),
});
export interface RuleEntry<T = unknown> extends r.Static<typeof RuleEntry> {
  options?: T;
}

export interface RuleModule<T extends r.Runtype<any> = r.Runtype> {
  check: (context: Context) => Promise<unknown> | unknown;
  name: string;
  id: string;
  optionsRuntype: T;
  printStats?: () => void;
  ruleEntry: RuleEntry<r.Static<T>>;
}

export const Config = r.Record({
  rules: r.Array(r.Unknown),
});
export interface Config extends r.Static<typeof Config> {
  rules: RuleModule[];
}

export interface Options {
  readonly verbose?: boolean;
  readonly fix?: boolean;
  readonly paths?: ReadonlyArray<string>;
  readonly silent?: boolean;
  readonly stats?: boolean;
}

// TODO: Make the extra param required. I'm not doing it now because this change is hard enough to read
export type Checker<T extends r.Runtype> =
  | ((context: Context, args: r.Static<T>, extra?: { id: string }) => void)
  | ((context: Context, args: r.Static<T>, extra?: { id: string }) => Promise<void>);

export interface ResolvedRule<T extends r.Runtype = r.Runtype> extends RuleModule<T> {}

export interface ResolvedConfig extends Options {
  readonly rules: ReadonlyArray<ResolvedRule>;
}
