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

export const RuleModule = r.Record({
  check: r.Function,
  optionsRuntype: r.Unknown,
  printStats: r.Function.optional(),
});
export interface RuleModule<T extends r.Runtype = r.Runtype> extends r.Static<typeof RuleModule> {
  check: Checker<T>;
  optionsRuntype: T;
}

export interface NewRuleModule<T extends r.Runtype = r.Runtype> {
  check: (context: Context) => Promise<unknown> | unknown;
  name: string;
  id: string;
  optionsRuntype: T;
  printStats?: () => void;
  ruleEntry: RuleEntry<r.Static<T>>;
}

export const LegacyRules = r.Dictionary(RuleEntry.Or(r.Array(RuleEntry)).Or(r.Boolean));
export type LegacyRules = r.Static<typeof LegacyRules>;

export const Config = r.Record({
  rules: r.Array(r.Unknown),
  legacyRules: LegacyRules.optional(),
});
export interface Config extends r.Static<typeof Config> {
  rules: NewRuleModule[];
}

export const LegacyConfig = r.Record({
  rules: LegacyRules.optional(),
});

export interface LegacyConfig extends r.Static<typeof LegacyConfig> {}

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

export interface ResolvedRule<T extends r.Runtype = r.Runtype> extends NewRuleModule<T> {}

export interface ResolvedConfig extends Options {
  readonly rules: ReadonlyArray<ResolvedRule>;
}
