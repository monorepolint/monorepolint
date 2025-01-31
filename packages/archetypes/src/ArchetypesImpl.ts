import { RuleModule } from "@monorepolint/config";
import { forceError, oncePerPackage } from "@monorepolint/rules";
import {
  ArchetypeConfig,
  ArchetypeRulesProvider,
  Archetypes,
  ArchetypesOptions,
} from "./archetypes.js";

export class ArchetypesImpl<T extends ArchetypeConfig> implements Archetypes {
  archetypes: Map<string, { packages: string[]; options: T }> = new Map();
  #singletonKey = Symbol("archetypeManagerSingletonKey");
  options: ArchetypesOptions<T>;
  rulesProvider: ArchetypeRulesProvider<T>;

  constructor(
    rulesProvider: ArchetypeRulesProvider<T>,
    options: ArchetypesOptions<T>,
  ) {
    this.rulesProvider = rulesProvider;
    this.options = options;
  }

  addArchetype(name: string, packages: string[], options: T) {
    if (this.archetypes.has(name)) {
      throw new Error("Archetype already exists: " + name);
    }
    this.archetypes.set(name, { packages, options });

    return this;
  }

  buildRules(): RuleModule[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rules: RuleModule<any>[] = [];
    for (const [_name, { packages, options }] of this.archetypes.entries()) {
      const shared = { includePackages: packages };
      rules.push(
        oncePerPackage({
          ...shared,
          options: { singletonKey: this.#singletonKey },
        }),
      );
      rules.push(...this.rulesProvider({ includePackages: packages }, options));
    }

    if (this.options.unmatched === "skip") {
      // no-op
    } else if (this.options.unmatched === "error") {
      const shared = {
        excludePackages: [...this.archetypes.entries()].flatMap((x) => x[1].packages),
      };

      rules.push(
        forceError({
          ...shared,
          options: {
            customMessage: "Package did not match any archetypes",
          },
        }),
      );
    } else {
      const shared = {
        excludePackages: [...this.archetypes.entries()].flatMap((x) => x[1].packages),
      };
      rules.push(
        oncePerPackage({
          ...shared,
          options: { singletonKey: this.#singletonKey },
        }),
        ...this.rulesProvider(shared, this.options.unmatched),
      );
    }
    return rules;
  }
}
