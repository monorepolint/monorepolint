import { RuleEntry, RuleModule } from "@monorepolint/config";
import { ArchetypesImpl } from "./ArchetypesImpl.js";

export type ArchetypeConfig = Record<string, any>;

export interface Archetypes {
  addArchetype(
    name: string,
    packages: string[],
    options: ArchetypeConfig,
  ): Archetypes;
  buildRules(): RuleModule[];
}

export type ArchetypeRulesProvider<T extends ArchetypeConfig> = (
  shared: Pick<
    RuleEntry,
    "includePackages" | "excludePackages"
  >,
  options: T,
) => RuleModule[];

export interface ArchetypesOptions<T extends ArchetypeConfig> {
  unmatched: T | "skip" | "error";
}

export function archetypes<T extends ArchetypeConfig>(
  rulesProvider: ArchetypeRulesProvider<T>,
  options: ArchetypesOptions<T>,
) {
  return new ArchetypesImpl(rulesProvider, options);
}
