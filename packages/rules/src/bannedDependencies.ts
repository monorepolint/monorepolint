/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepolint/config";
import { matchesAnyGlob } from "@monorepolint/utils";
import { AggregateTiming } from "@monorepolint/utils";
import * as path from "node:path";
import * as r from "runtypes";
import { createRuleFactory } from "./util/createRuleFactory.js";
import {
  IPackageDependencyGraphNode,
  PackageDependencyGraphService,
} from "./util/packageDependencyGraphService.js";
// FIXME: This rule is messed. bannedTransitiveDependencies doesnt glob

const bannedDepGlobsField = r.Union(
  r.Array(r.String),
  r.Record({
    glob: r.Array(r.String).optional(),
    exact: r.Array(r.String).optional(),
  }),
);

const Options = r.Union(
  r.Record({
    bannedDependencies: bannedDepGlobsField,
    bannedTransitiveDependencies: r.Undefined.optional(),
  }),
  r.Record({
    bannedDependencies: bannedDepGlobsField.optional(),
    bannedTransitiveDependencies: r.Array(r.String),
  }),
  r.Record({
    bannedDependencies: bannedDepGlobsField.optional(),
    bannedTransitiveDependencies: r.Array(r.String).optional(),
  }),
);

export type Options = r.Static<typeof Options>;

/**
 * We use this locally to avoid making a billion sets. Because check is called once per package
 * (with the exact same config object reference) we can save quite a bit of time by reusing this cache.
 */
const setCache = new Map<ReadonlyArray<string>, Set<string>>();

const aggregateTiming = new AggregateTiming(":bannedDependencies stats");

export const bannedDependencies = createRuleFactory<Options>({
  name: "bannedDependencies",
  check: (context, opts, extra) => {
    aggregateTiming.start(extra?.id ?? "unknown id");

    const packageJson = context.getPackageJson();
    const packagePath = context.getPackageJsonPath();

    const curDeps = packageJson.dependencies
      && Object.keys(packageJson.dependencies);
    const curDevDeps = packageJson.devDependencies
      && Object.keys(packageJson.devDependencies);
    const curPeerDeps = packageJson.peerDependencies
      && Object.keys(packageJson.peerDependencies);

    const {
      bannedDependencies: banned,
      bannedTransitiveDependencies: transitives,
    } = opts;

    const globs = banned && (Array.isArray(banned) ? banned : banned.glob);
    const exacts = banned && (Array.isArray(banned) ? undefined : banned.exact);

    const violations = new Set<string>();

    if (globs) {
      if (curDeps) populateProblemsGlobs(globs, curDeps, violations);
      if (curDevDeps) populateProblemsGlobs(globs, curDevDeps, violations);
      if (curPeerDeps) populateProblemsGlobs(globs, curPeerDeps, violations);
    }

    if (exacts) {
      let set = setCache.get(exacts);
      if (set === undefined) {
        set = new Set(exacts);
        setCache.set(exacts, set);
      }
      if (curDeps) populateProblemsExact(set, curDeps, violations);
      if (curDevDeps) populateProblemsExact(set, curDevDeps, violations);
      if (curPeerDeps) populateProblemsExact(set, curPeerDeps, violations);
    }

    if (violations.size > 0) {
      context.addError({
        file: packagePath,
        message: `Found ${violations.size} banned dependencies of package.json:\n\t`
          + Array.from(violations)
            .map((v) => `'${v}'`)
            .join(", "),
      });
    }

    if (transitives) {
      let set = setCache.get(transitives);
      if (set === undefined) {
        set = new Set(transitives);
        setCache.set(transitives, set);
      }
      checkTransitives(context, set);
    }

    aggregateTiming.stop();
  },
  validateOptions: Options.check,
  printStats: () => {
    aggregateTiming.printResults();
  },
});

function populateProblemsExact(
  banned: Set<string>,
  dependencies: ReadonlyArray<string>,
  violations: Set<string>,
) {
  for (const dependency of dependencies) {
    if (banned.has(dependency)) {
      violations.add(dependency);
    }
  }
}

function populateProblemsGlobs(
  bannedDependencyGlobs: ReadonlyArray<string>,
  dependencies: ReadonlyArray<string>,
  violations: Set<string>,
) {
  for (const dependency of dependencies) {
    if (matchesAnyGlob(dependency, bannedDependencyGlobs)) {
      violations.add(dependency);
    }
  }
}

// This function is slow. God help you if you use this on a big repo
function checkTransitives(context: Context, banned: Set<string>) {
  const graphService = new PackageDependencyGraphService();
  const root = graphService.buildDependencyGraph(
    path.resolve(context.getPackageJsonPath()),
    context.host,
  );
  for (const { dependencies, importPath } of graphService.traverse(root)) {
    for (const [dependency] of dependencies) {
      if (banned.has(dependency)) {
        // Remove the starting package since it's obvious in CLI output.
        const [, ...importPathWithoutRoot] = importPath;
        const pathing = [
          ...importPathWithoutRoot.map(nameOrPackageJsonPath),
          dependency,
        ].join(" -> ");

        context.addError({
          file: root.paths.packageJsonPath,
          message: `Banned transitive dependencies in repo: ${pathing}`,
        });
      }
    }
  }
}

function nameOrPackageJsonPath(node: IPackageDependencyGraphNode): string {
  return node.packageJson.name ?? node.paths.packageJsonPath;
}
