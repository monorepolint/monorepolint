import { createRuleFactory } from "./util/createRuleFactory.js";

export const forceError = createRuleFactory<{ customMessage?: string }>({
  name: "forceError",

  check: async (context, opts) => {
    context.addError({
      message: opts?.customMessage
        ?? "Forced error (often used to debug package selection)",
      file: context.getPackageJsonPath(),
    });
  },

  validateOptions: (opts): asserts opts is null | { customMessage: string } => {
    if (opts == null) return;

    if (typeof opts !== "object") {
      throw new Error("options must be an object if provided");
    }

    const numKeys = Object.keys(opts).length;

    if (numKeys === 0) return;

    if (Object.keys(opts).length > 1 || !("customMessage" in opts)) {
      throw new Error("options must only have `customMessage` property");
    }

    if (typeof opts.customMessage !== "string") {
      throw new Error("customMessage must be a string");
    }
  },
});
