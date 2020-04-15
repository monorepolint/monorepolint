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
/**
 * separating on `|`, this regex allows any of the following formats:
 * - `*`
 * - `x`
 *
 * More info: https://docs.npmjs.com/about-semantic-versioning
 */
export const MATCH_ANY_VERSION_RANGE = /^(\*|x)$/;

/**
 * separating on `|`, this regex allows any of the following formats:
 * - `15`
 * - `^15`
 * - `15.x`
 * - `^15.x`
 * - `15.x.x`
 * - `^15.x.x`
 * - `^15.2`
 * - `^15.2.x`
 * - `^15.2.1`
 *
 * More info: https://docs.npmjs.com/about-semantic-versioning
 */
export const MATCH_MAJOR_VERSION_RANGE = /^(\^?\d+|\^?\d+\.x|\^?\d+\.x\.x|\^\d+\.\d+|\^\d+\.\d+\.x|\^\d+\.\d+\.\d+)$/;

// does not currently accept `<`, `>`, `=`, or `-` (e.g. `>= 1.5.2 < 2` / `1.0.0 - 1.2.0`)
// TODO: accept minor pins `~4.2.1`
export const RANGE_REGEX = /^(\*|x|\^?\d+(\.x|\.x\.x|\.\d+|\.\d+\.x|\.\d+\.\d+)?( \|\| \^?\d+(\.x|\.x\.x|\.\d+|\.\d+\.x|\.\d+\.\d+)?)*)$/;

function checkSatisfyPeerDependencies(context: Context, opts: Options) {
  const { skipUnparseableRanges } = opts;
  const graphService = new PackageDependencyGraphService();
  const packageNode = graphService.buildDependencyGraph(path.resolve(context.getPackageJsonPath()), 1);
  const packageDependencies = packageNode.packageJson.dependencies || {};
  const packagePeerDependencies = packageNode.packageJson.peerDependencies || {};
  const packageJsonPath = packageNode.paths.packageJsonPath;
  const packageName = packageNode.packageJson.name || packageJsonPath;

  // check that no peer dependencies are also declared as regular dependencies
  for (const [peerDependencyName, peerDependencyRange] of Object.entries(packagePeerDependencies)) {
    const dependencyRange = packageDependencies[peerDependencyName];
    if (dependencyRange != null) {
      context.addError({
        file: packageJsonPath,
        message: `[0] Package ${packageName} has overloaded ${peerDependencyName} dependencies.`,
        longMessage: `Peer dependency '${peerDependencyRange}' and regular dependency '${dependencyRange}'.`,
      });
    }
  }

  interface IPeerDependencyRequirement {
    node: IPackageDependencyGraphNode;
    range: string;
  }
  // map of all inherited peer dependency requirements
  const allRequiredPeerDependencies: { [peerDependencyName: string]: IPeerDependencyRequirement[] } = {};

  // for each of this package's dependencies, add the dependency's peer requirements into `allRequiredPeerDependencies`
  for (const [, dependencyNode] of packageNode.dependencies) {
    const requiredPeerDependencies = dependencyNode.packageJson.peerDependencies;
    if (requiredPeerDependencies == null) {
      continue;
    }
    for (const [peerDependencyName, range] of Object.entries(requiredPeerDependencies)) {
      if (!RANGE_REGEX.test(range)) {
        const message = `Unable to parse ${dependencyNode.packageJson.name}'s ${peerDependencyName} peer dependency range '${range}'.`;
        if (skipUnparseableRanges) {
          context.addWarning({
            file: dependencyNode.paths.packageJsonPath,
            message,
          });
          continue;
        }
        throw new Error(message);
      }
      if (allRequiredPeerDependencies[peerDependencyName] == null) {
        allRequiredPeerDependencies[peerDependencyName] = [];
      }
      allRequiredPeerDependencies[peerDependencyName].push({ node: dependencyNode, range });
    }
  }

  for (const [peerDependencyName, peerDependencyRequirements] of Object.entries(allRequiredPeerDependencies)) {
    // for each inherited peer dependency, determine the strictest range
    let mostStrictPeerRequirement: IPeerDependencyRequirement = peerDependencyRequirements[0];
    for (const peerRequirement of peerDependencyRequirements) {
      if (peerRequirement === mostStrictPeerRequirement) {
        continue;
      } else {
        if (doesASatisfyB(peerRequirement.range, mostStrictPeerRequirement.range)) {
          mostStrictPeerRequirement = peerRequirement;
        } else if (!doesASatisfyB(mostStrictPeerRequirement.range, peerRequirement.range)) {
          context.addError({
            file: packageJsonPath,
            message: `[1] Package ${packageName} has conflicting inherited ${peerDependencyName} peer dependencies.`,
            longMessage:
              `Dependency ${peerRequirement.node.packageJson.name} requires ${peerRequirement.range} and ` +
              `dependency ${mostStrictPeerRequirement.node.packageJson.name} requires ${mostStrictPeerRequirement.range}.`,
          });
        }
      }
    }

    // if this package has a dependency on an inherited peer dependency,
    // the range must be equal to or stricter than `mostStrictPeerRequirement`
    const packageDependencyRange = packageDependencies[peerDependencyName];
    if (packageDependencyRange != null && !doesASatisfyB(packageDependencyRange, mostStrictPeerRequirement.range)) {
      context.addError({
        file: packageJsonPath,
        message: `[2] Package ${packageName} dependency on ${peerDependencyName} does not satisfy inherited peer dependencies.`,
        longMessage: `Dependency ${mostStrictPeerRequirement.node.packageJson.name} requires ${mostStrictPeerRequirement.range} or stricter.`,
      });
    }

    // for every inherited peer dependency, this package must declare a dependency or peer dependency
    // equal to or stricter than `mostStrictPeerRequirement`
    const packagePeerDependencyRange = packagePeerDependencies[peerDependencyName];
    if (packageDependencyRange == null && packagePeerDependencyRange == null) {
      context.addError({
        file: packageJsonPath,
        message: `[3] Package ${packageName} is missing required ${peerDependencyName} dependency.`,
        longMessage: `Dependency ${mostStrictPeerRequirement.node.packageJson.name} requires ${mostStrictPeerRequirement.range} or stricter.`,
        fixer: getAddDependencyTypeFixer({
          packageJsonPath,
          dependencyType: "peerDependencies",
          dependencyName: peerDependencyName,
          version: mostStrictPeerRequirement.range,
        }),
      });
    }

    // if this package has a peer dependency on an inherited peer dependency,
    // the range must be equal to or stricter than `mostStrictPeerRequirement`
    if (
      packagePeerDependencyRange != null &&
      !doesASatisfyB(packagePeerDependencyRange, mostStrictPeerRequirement.range)
    ) {
      context.addError({
        file: packageJsonPath,
        message: `[4] Package ${packageName} peer dependency on ${peerDependencyName} is not strict enough.`,
        longMessage: `Dependency ${mostStrictPeerRequirement.node.packageJson.name} requires ${mostStrictPeerRequirement.range} or stricter.`,
        fixer: getAddDependencyTypeFixer({
          packageJsonPath,
          dependencyType: "peerDependencies",
          dependencyName: peerDependencyName,
          version: mostStrictPeerRequirement.range,
        }),
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
  const aIsAnyVersionRange = isAnyVersionRange(a);
  const bIsAnyVersionRange = isAnyVersionRange(b);
  if (bIsAnyVersionRange) {
    return true;
  } else if (aIsAnyVersionRange) {
    // `bIsAnyVersionRange` is `false`
    // `a` permits more values than `b`, therefore `a` is "less strict"
    return false;
  }

  const aVersions = a.includes("||") ? a.split("||").map(s => s.trim()) : [a];
  const bVersions = b.includes("||") ? b.split("||").map(s => s.trim()) : [b];

  return aVersions.every(aVersion => {
    const aSemVer = coerce(aVersion)!;
    const majorMatchingBVersion = bVersions.find(m => coerce(m)!.major === aSemVer.major);
    if (majorMatchingBVersion === undefined) {
      // `a` permits a major version that is not permitted by `b`, therefore `a` is "less strict"
      return false;
    }

    const aVersionIsRange = isMajorVersionRange(aVersion);
    const majorMatchingBSemVer = coerce(majorMatchingBVersion)!;
    const majorMatchingBVersionIsRange = isMajorVersionRange(majorMatchingBVersion);

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

function isAnyVersionRange(version: string): boolean {
  return MATCH_ANY_VERSION_RANGE.test(version);
}

function isMajorVersionRange(version: string): boolean {
  return MATCH_MAJOR_VERSION_RANGE.test(version);
}

type IDependencyType = "dependencies" | "devDependencies" | "peerDependencies";

function getAddDependencyTypeFixer({
  packageJsonPath,
  dependencyType,
  dependencyName,
  version,
}: {
  packageJsonPath: string;
  dependencyType: IDependencyType;
  dependencyName: string;
  version: string;
}) {
  return () => {
    mutateJson<PackageJson>(packageJsonPath, packageJson => {
      if (packageJson[dependencyType] == null) {
        packageJson[dependencyType] = {};
      }
      packageJson[dependencyType]![dependencyName] = version;
      return packageJson;
    });
  };
}
