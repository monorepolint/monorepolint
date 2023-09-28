import { Context, RuleEntry, RuleModule } from "@monorepolint/config";

let globalId = 0;
export function makeRule<X>({
  name,
  check,
  validateOptions,
  printStats,
}: {
  name: string;
  check: (context: Context, options: X, extra: { id: string }) => Promise<unknown> | unknown;
  printStats?: () => void;
  validateOptions: (options: unknown) => asserts options is X;
}): RuleFunction<X> {
  return function (ruleEntry) {
    const id = `${name} :: ${globalId++}`;
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

type RuleFunction<T> = (ruleEntry: RuleEntry<T>) => RuleModule<T>;
