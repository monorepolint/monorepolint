/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/core";
import { writeJson } from "@monorepolint/utils";
import diff from "jest-diff";
import minimatch from "minimatch";
import path from "path";
import * as r from "runtypes";
import { PackageDependencyGraphService } from "./util/packageDependencyGraphService";

const Options = r.Union(
  r
    .Record({
      bannedDependencies: r.Array(r.String),
    })
    .And(
      r.Partial({
        bannedTransitiveDependencies: r.Undefined,
      })
    ),
  r
    .Record({
      bannedTransitiveDependencies: r.Array(r.String),
    })
    .And(
      r.Partial({
        bannedDependencies: r.Undefined,
      })
    ),
  r.Record({
    bannedDependencies: r.Array(r.String),
    bannedTransitiveDependencies: r.Array(r.String),
  })
);

type Options = r.Static<typeof Options>;

export const bannedDependencies: RuleModule<typeof Options> = {
  check: function expectAllowedDependencies(context: Context, opts: Options) {
    // tslint:disable-next-line:no-shadowed-variable
    const { bannedDependencies, bannedTransitiveDependencies } = opts;

    if (bannedDependencies) {
      checkBanned(context, bannedDependencies, "dependencies");
      checkBanned(context, bannedDependencies, "devDependencies");
      checkBanned(context, bannedDependencies, "peerDependencies");
    }

    if (bannedTransitiveDependencies) {
      checkTransitives(context, bannedTransitiveDependencies);
    }
  },
  optionsRuntype: Options,
};

function checkBanned(
  context: Context,
  // tslint:disable-next-line:no-shadowed-variable
  bannedDependencies: ReadonlyArray<string>,
  block: "dependencies" | "devDependencies" | "peerDependencies"
) {
  const packageJson = context.getPackageJson();
  const packagePath = context.getPackageJsonPath();

  const dependencies = packageJson[block];

  if (dependencies === undefined) {
    return;
  }

  const expectedDependencies: Record<string, string> = {};

  for (const dependency of Object.keys(dependencies)) {
    for (const bannedDependency of bannedDependencies) {
      if (!minimatch(dependency, bannedDependency)) {
        expectedDependencies[dependency] = dependencies[dependency];
      }
    }
  }

  if (Object.keys(expectedDependencies).length !== Object.keys(dependencies).length) {
    context.addError({
      file: packagePath,
      message: `Banned depdendencies in ${block} in package.json`,
      longMessage: diff(expectedDependencies, dependencies, { expand: true }),
      fixer: () => {
        const newPackageJson = { ...packageJson };
        newPackageJson[block] = expectedDependencies;
        writeJson(packagePath, newPackageJson);
      },
    });
  }
}

function checkTransitives(
  context: Context,
  // tslint:disable-next-line: no-shadowed-variable
  bannedDependencies: ReadonlyArray<string>
) {
  const graphService = new PackageDependencyGraphService();
  const root = graphService.buildDependencyGraph(path.resolve(context.getPackageJsonPath()));
  for (const { dependencies } of graphService.traverse(root)) {
    for (const [dependency, dependencyNode] of dependencies) {
      if (bannedDependencies.includes(dependency)) {
        context.addError({
          file: dependencyNode.paths.packageJsonPath,
          message: `Banned transitive depdendencies in repo: ${dependency}`,
        });
      }
    }
  }
}
