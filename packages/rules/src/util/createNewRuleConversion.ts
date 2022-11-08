/*!
 * Copyright 2022 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Checker, Context, NewRuleModule, RuleModule, RuleEntry } from "@monorepolint/config";
import * as r from "runtypes";

// tslint:disable max-classes-per-file

let id = 0;
export class NewRuleConverterBase<T extends r.Runtype<unknown>> implements NewRuleModule<T> {
  public readonly id: string;
  options: r.Static<T> | undefined;

  constructor(
    public readonly name: string,
    public checkFunc: Checker<T>,
    public readonly optionsRuntype: T,
    public readonly ruleEntry: RuleEntry<r.Static<T>>
  ) {
    this.options = ruleEntry.options;
    this.id = `${this.name} :: ${id++}`;
    //
  }

  public check = (context: Context) => this.checkFunc(context, this.ruleEntry.options, { id: this.id });
}

export function createNewRuleConversion<T extends r.Runtype<unknown>>(name: string, old: RuleModule<T>) {
  return class NewRule extends NewRuleConverterBase<T> {
    constructor(ruleEntry: RuleEntry<r.Static<T>>) {
      super(name, old.check, old.optionsRuntype, ruleEntry);
    }
  };
}
