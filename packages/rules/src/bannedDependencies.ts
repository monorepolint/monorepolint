/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/core";
import diff from "jest-diff";
import minimatch from "minimatch";
import path from "path";
import * as r from "runtypes";
import { IPackageDependencyGraphNode, PackageDependencyGraphService } from "./util/packageDependencyGraphService";

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

export type Options = r.Static<typeof Options>;

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

  const newPackageJson = { ...packageJson };
  const violations: string[] = [];

  for (const dependency of Object.keys(dependencies)) {
    for (const bannedDependency of bannedDependencies) {
      if (minimatch(dependency, bannedDependency)) {
        violations.push(dependency);
        delete newPackageJson[block]![dependency];
      }
    }
  }

  if (violations.length > 0) {
    context.addError({
      file: packagePath,
      message:
        `Found ${violations.length} banned dependencies in '${block}' block of package.json:\n\t` +
        violations.map((v) => `'${v}'`).join(", "),
      longMessage: diff(newPackageJson[block], dependencies, { expand: true }),
      fixer: () => {
        context.host.writeJson(packagePath, newPackageJson);
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
  for (const { dependencies, importPath } of graphService.traverse(root)) {
    for (const [dependency] of dependencies) {
      if (bannedDependencies.includes(dependency)) {
        // Remove the starting package since it's obvious in CLI output.
        const [, ...importPathWithoutRoot] = importPath;
        const pathing = [...importPathWithoutRoot.map(nameOrPackageJsonPath), dependency].join(" -> ");

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
