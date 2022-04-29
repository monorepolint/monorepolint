/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as r from "runtypes";
import { Runtype } from "runtypes/lib/runtype";
import { Context } from "./Context";

export const RuleEntry = r.Partial({
  options: r.Unknown,
  excludePackages: r.Array(r.String),
  includePackages: r.Array(r.String),
  includeWorkspaceRoot: r.Boolean,
  id: r.String.optional(),
});
export type RuleEntry<T = unknown> = r.Static<typeof RuleEntry> & {
  options?: T;
};

export const Config = r.Record({
  rules: r.Dictionary(RuleEntry.Or(r.Array(RuleEntry).Or(r.Boolean))),
});
export type Config = r.Static<typeof Config>;

export const RuleModule = r.Record({
  check: r.Function,
  optionsRuntype: r.Unknown,
  printStats: r.Function.optional(),
});
export interface RuleModule<T extends Runtype = Runtype> extends r.Static<typeof RuleModule> {
  check: Checker<T>;
  optionsRuntype: T;
}

export interface Options {
  readonly verbose?: boolean;
  readonly fix?: boolean;
  readonly paths?: ReadonlyArray<string>;
  readonly silent?: boolean;
  readonly stats?: boolean;
}

// TODO: Make the extra param required. I'm not doing it now because this change is hard enough to read

export type Checker<T extends Runtype> =
  | ((context: Context, args: r.Static<T>, extra?: { id: string }) => void)
  | ((context: Context, args: r.Static<T>, extra?: { id: string }) => Promise<void>);

export type ResolvedRule<T = unknown> = RuleModule & RuleEntry<T> & { name: string; id: string };
export interface ResolvedConfig extends Options {
  readonly rules: ReadonlyArray<ResolvedRule>;
}
