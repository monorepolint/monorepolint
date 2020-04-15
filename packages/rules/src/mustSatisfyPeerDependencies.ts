/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/core";
import { mutateJson, PackageJson } from "@monorepolint/utils";
import path from "path";
import * as r from "runtypes";
import { coerce } from "semver";
import { IPackageDependencyGraphNode, PackageDependencyGraphService } from "./util/packageDependencyGraphService";

const Options = r.Union(
  r.Partial({
    skipUnparseableRanges: r.Undefined,
  }),
  r.Record({
    skipUnparseableRanges: r.Boolean,
  })
);

type Options = r.Static<typeof Options>;

export const mustSatisfyPeerDependencies: RuleModule<typeof Options> = {
  check: checkSatisfyPeerDependencies,
  optionsRuntype: Options,
};

// do not accept `<` or `>`
export const ALLOWED_RANGE_REGEX = /^\^?\d+(\.x|\.x\.x|\.\d+|\.\d+\.x|\.d+\.d+)?( \|\| \^?\d+(\.x|\.x\.x|\.\d+|\.\d+\.x|\.d+\.d+)?)*$/;

function checkSatisfyPeerDependencies(context: Context, opts: Options) {
  const { skipUnparseableRanges } = opts;
  const graphService = new PackageDependencyGraphService();
  const rootNode = graphService.buildDependencyGraph(path.resolve(context.getPackageJsonPath()), 1);
  const rootPeerDependencies = rootNode.packageJson.peerDependencies || {};

  interface IPeerDependencyRequirement {
    node: IPackageDependencyGraphNode;
    range: string;
  }
  const allRequiredPeerDependencies: { [peerDependencyName: string]: IPeerDependencyRequirement[] } = {};

  for (const [, dependencyNode] of rootNode.dependencies) {
    const requiredPeerDependencies = dependencyNode.packageJson.peerDependencies;
    if (requiredPeerDependencies == null) {
      continue;
    }
    for (const [peerDependencyName, range] of Object.entries(requiredPeerDependencies)) {
      if (!ALLOWED_RANGE_REGEX.test(range)) {
        if (skipUnparseableRanges) {
          continue;
        }
        throw new Error(
          `Unable to parse dependency range ${peerDependencyName} @ ${range} in ${dependencyNode.paths.packageJsonPath}`
        );
      }
      if (allRequiredPeerDependencies[peerDependencyName] == null) {
        allRequiredPeerDependencies[peerDependencyName] = [];
      }
      allRequiredPeerDependencies[peerDependencyName].push({ node: dependencyNode, range });
    }
  }

  for (const [peerDependencyName, peerDependencyRequirements] of Object.entries(allRequiredPeerDependencies)) {
    let mostStrictPeerRequirement: IPeerDependencyRequirement = peerDependencyRequirements[0];
    for (const peerRequirement of peerDependencyRequirements) {
      if (peerRequirement === mostStrictPeerRequirement) {
        continue;
      } else {
        if (doesASatisfyB(peerRequirement.range, mostStrictPeerRequirement.range)) {
          mostStrictPeerRequirement = peerRequirement;
        } else if (doesASatisfyB(mostStrictPeerRequirement.range, peerRequirement.range)) {
          continue;
        } else {
          context.addError({
            file: rootNode.paths.packageJsonPath,
            message: `[1] Package ${rootNode.packageJson.name} has conflicting inherited ${peerDependencyName} peer depdendencies.`,
            longMessage: `Dependency ${peerRequirement.node.packageJson.name} requires ${peerRequirement.range} and dependency ${mostStrictPeerRequirement.node.packageJson.name} requires ${mostStrictPeerRequirement.range}.`,
          });
        }
      }
    }
    const rootPeerDependency = rootPeerDependencies[peerDependencyName];
    if (rootPeerDependency == null || !doesASatisfyB(rootPeerDependency, mostStrictPeerRequirement.range)) {
      context.addError({
        file: rootNode.paths.packageJsonPath,
        message:
          rootPeerDependency == null
            ? `[2] Package ${rootNode.packageJson.name} is missing ${peerDependencyName} peer dependency.`
            : `[3] Package ${rootNode.packageJson.name} peer dependency on ${peerDependencyName} is not strict enough.`,
        longMessage: `Dependency ${mostStrictPeerRequirement.node.packageJson.name} requires ${mostStrictPeerRequirement.range} or stricter.`,
        fixer: () => {
          mutateJson<PackageJson>(rootNode.paths.packageJsonPath, packageJson => {
            if (packageJson.peerDependencies == null) {
              packageJson.peerDependencies = {};
            }
            packageJson.peerDependencies[peerDependencyName] = mostStrictPeerRequirement.range;
            return packageJson;
          });
        },
      });
    }
  }
}

/*
  Returns `true` if `a` is more strict than or equal to `b`
  Returns `false` otherwise

  This code assumes that major versions are not repeated in union ranges.
  e.g. `^15.0.5 || ^16.0.0`, but not `15.0.5 || 15.0.999`

  To determine that `a` is "more strict than or equal to" `b`:
  For set `a` of version values (`15.0.5`) and ranges (`^16.0.0`),
  each entry must be permitted by (equal to or greater than) some entry in `b`.

  Actual dependencies of `a` can be more restrictive along matching `^`? majors in `b`, but not less.
  For example, the following values are more strict than or equal to
  (satisfy a required dependency) `^15.0.5 || ^16.0.0`:
  - `^15.0.5 || ^16.0.0`
  - `^15.0.5 || ^16.x.x`
  - `^15.0.5 || ^16`
  - `15.0.5 || 16.0.0`
  - `^15.0.999 || ^16.0.0`
  - `^15.0.5 || ^16.0.999`
  - `^15.0.999`
  - `^16.0.0`
  - `16.0.0`
  Here are some sample values that are less strict than (do not satisfy a required dependency) `^15.0.0 || ^16.0.0`:
  - `^15.0.5 || ^16.0.0 || ^17.0.0`
  - `^14.0.0 || ^15.0.5 || ^16.0.0`
  - `^15.0.0 || ^16.0.0`
  - `^17.0.0`
  - `17.0.0`
*/
export function doesASatisfyB(a: string, b: string): boolean {
  const aVersions = a.includes("||") ? a.split("||").map(s => s.trim()) : [a];
  const bVersions = b.includes("||") ? b.split("||").map(s => s.trim()) : [b];

  return aVersions.every(aVersion => {
    const aMajor = coerce(aVersion)!.major;
    const majorMatchingBVersion = bVersions.find(m => coerce(m)!.major === aMajor);
    if (majorMatchingBVersion === undefined) {
      // `a` permits a major version that is not permitted by `b`, therefore `a` is "less strict"
      return false;
    }

    const aSemVer = coerce(aVersion)!;
    const aVersionIsRange = aVersion.startsWith("^");
    const majorMatchingBSemVer = coerce(majorMatchingBVersion)!;
    const majorMatchingBVersionIsRange = majorMatchingBVersion.startsWith("^");

    if (majorMatchingBVersionIsRange) {
      // `a` satisfies `b` so long as `aSemVer` is greater than or equal to `majorMatchingBSemVer`
      // this is true whether or not `aVersionIsRange`
      return aSemVer.compare(majorMatchingBSemVer) !== -1;
    } else {
      // `majorMatchingBVersionIsRange` is `false`
      if (aVersionIsRange) {
        // `a` permits more values than `b`, therefore `a` is "less strict"
        // e.g if `b` is `15.5.5`, this is true whether `a` is `^15.0.0`, `^15.5.5`, or `^15.9.9`
        return false;
      } else {
        // `aVersionIsRange` is `false`
        // `a` satisfies `b` if and only if `aSemVer` is equal to `majorMatchingBSemVer`
        return aSemVer.compare(majorMatchingBSemVer) === 0;
      }
    }
  });
}
