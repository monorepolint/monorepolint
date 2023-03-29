import { Context, RuleEntry, RuleModule } from "@monorepolint/config";
import * as r from "runtypes";

let globalId = 0;
export function makeRule<T extends r.Runtype<unknown>>({
  name,
  check,
  optionsRuntype,
  printStats,
}: {
  name: string;
  check: (context: Context, options: r.Static<T>, extra: { id: string }) => Promise<unknown> | unknown;
  optionsRuntype: T;
  printStats?: () => void;
}): RuleFunction<T> {
  return function (ruleEntry) {
    const id = `${name} :: ${globalId++}`;
    return {
      id,
      check: (context) => check(context, ruleEntry.options, { id }),
      name,
      optionsRuntype,
      ruleEntry,
      printStats,
    };
  };
}

type RuleFunction<T extends r.Runtype<any>> = (ruleEntry: RuleEntry<r.Static<T>>) => RuleModule<T>;
