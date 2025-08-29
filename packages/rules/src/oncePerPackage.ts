import { z } from "zod";
import { createRuleFactory } from "./util/createRuleFactory.js";

const Options = z.object({
  singletonKey: z.union([z.string(), z.symbol()]),
  customMessage: z.string().optional(),
});

type Options = z.infer<typeof Options>;

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

  validateOptions: Options.parse,
});
