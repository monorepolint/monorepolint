import { Context, RuleEntry, RuleModule } from "@monorepolint/config";

export type ValidateOptionsFn<X> = (options: unknown) => asserts options is X;
export type RuleFactoryFn<T> = (ruleEntry: RuleEntry<T>) => RuleModule<T>;
export type RuleCheckFn<O> = (
  context: Context,
  options: O,
  extra: { id: string },
) => Promise<unknown> | unknown;

export interface RuleFactoryOptions<X> {
  name: string;
  check: RuleCheckFn<X>;
  printStats?: () => void;
  validateOptions: ValidateOptionsFn<X>;
}

let globalId = 0;
export function createRuleFactory<X>({
  name,
  check,
  validateOptions,
  printStats,
}: RuleFactoryOptions<X>): RuleFactoryFn<X> {
  return function(ruleEntry) {
    const id = ruleEntry.id ?? `${name} :: ${globalId++}`;
    return {
      id,
      // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
      check: (context) => check(context, ruleEntry.options!!, { id }),
      name,
      validateOptions,
      ruleEntry,
      printStats,
    };
  };
}
