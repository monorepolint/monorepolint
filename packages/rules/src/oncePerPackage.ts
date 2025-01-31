import * as r from "runtypes";
import { createRuleFactory } from "./util/createRuleFactory.js";

export const Options = r.Record({
  singletonKey: r.String.Or(r.Symbol),
  customMessage: r.String.optional(),
});

export type Options = r.Static<typeof Options>;

const visitedMap = new Map<string | symbol, Set<string>>();

export const oncePerPackage = createRuleFactory<Options>({
  name: "oncePerPackage",

  check: async (context, options) => {
    const visited = visitedMap.get(options.singletonKey) ?? new Set<string>();
    visitedMap.set(options.singletonKey, visited);

    if (visited.has(context.getName())) {
      context.addError({
        message: "This package has already been visited for this key: "
          + options.singletonKey.toString(),
        file: context.getPackageJsonPath(),
      });
    } else {
      visited.add(context.getName());
    }
  },

  validateOptions: Options.assert,
});
