/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "./Context.js";
import { WorkspaceContext } from "./WorkspaceContext.js";
// TODO: extract all these types to their own files

export interface RuleEntry<T = unknown> {
  readonly options?: T;
  readonly excludePackages?: ReadonlyArray<string>;
  readonly includePackages?: ReadonlyArray<string>;
  readonly includeWorkspaceRoot?: boolean;
  readonly id?: string;
}

export interface RuleModule<X = unknown> {
  readonly check: (context: Context) => Promise<unknown> | unknown;
  readonly name: string;
  readonly id: string;
  readonly validateOptions: (options: X) => void;
  readonly printStats?: () => void;
  readonly ruleEntry: RuleEntry<X>;
}

export interface Config {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly rules: RuleModule<any>[];
}

export type ConfigFn = (context: WorkspaceContext) => Config;

export interface Options {
  readonly verbose?: boolean;
  readonly fix?: boolean;
  readonly paths?: ReadonlyArray<string>;
  readonly silent?: boolean;
  readonly stats?: boolean;
}

export type ResolvedRule<X = unknown> = RuleModule<X>;

export interface ResolvedConfig extends Options {
  readonly rules: ReadonlyArray<ResolvedRule>;
}
