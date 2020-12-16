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
import { resolveDependencyManifest } from "./util/resolveDependencyManifest";

const Options = r.Union(
  r.Partial({
    skipUnparseableRanges: r.Undefined,
    dependencyWhitelist: r.Undefined,
    dependencyBlacklist: r.Undefined,
    enforceForDevDependencies: r.Undefined,
  }),
  r
    .Record({
      skipUnparseableRanges: r.Boolean,
    })
    .And(
      r.Partial({
        dependencyWhitelist: r.Undefined,
        dependencyBlacklist: r.Undefined,
        enforceForDevDependencies: r.Undefined,
      })
    ),
  r
    .Record({
      dependencyWhitelist: r.Array(r.String),
    })
    .And(
      r.Partial({
        skipUnparseableRanges: r.Undefined,
        dependencyBlacklist: r.Undefined,
        enforceForDevDependencies: r.Undefined,
      })
    ),
  r
    .Record({
      dependencyBlacklist: r.Array(r.String),
    })
    .And(
      r.Partial({
        skipUnparseableRanges: r.Undefined,
        dependencyWhitelist: r.Undefined,
        enforceForDevDependencies: r.Undefined,
      })
    ),
  r
    .Record({
      enforceForDevDependencies: r.Boolean,
    })
    .And(
      r.Partial({
        skipUnparseableRanges: r.Undefined,
        dependencyWhitelist: r.Undefined,
        dependencyBlacklist: r.Undefined,
      })
    ),
  r
    .Record({
      skipUnparseableRanges: r.Boolean,
      dependencyWhitelist: r.Array(r.String),
    })
    .And(
      r.Partial({
        dependencyBlacklist: r.Undefined,
        enforceForDevDependencies: r.Undefined,
      })
    ),
  r
    .Record({
      skipUnparseableRanges: r.Boolean,
      dependencyBlacklist: r.Array(r.String),
    })
    .And(
      r.Partial({
        dependencyWhitelist: r.Undefined,
        enforceForDevDependencies: r.Undefined,
      })
    ),
  r
    .Record({
      skipUnparseableRanges: r.Boolean,
      enforceForDevDependencies: r.Boolean,
    })
    .And(
      r.Partial({
        dependencyWhitelist: r.Undefined,
        dependencyBlacklist: r.Undefined,
      })
    ),
  r
    .Record({
      dependencyWhitelist: r.Array(r.String),
      dependencyBlacklist: r.Array(r.String),
    })
    .And(
      r.Partial({
        skipUnparseableRanges: r.Undefined,
        enforceForDevDependencies: r.Undefined,
      })
    ),
  r
    .Record({
      dependencyWhitelist: r.Array(r.String),
      enforceForDevDependencies: r.Boolean,
    })
    .And(
      r.Partial({
        skipUnparseableRanges: r.Undefined,
        dependencyBlacklist: r.Undefined,
      })
    ),
  r
    .Record({
      dependencyBlacklist: r.Array(r.String),
      enforceForDevDependencies: r.Boolean,
    })
    .And(
      r.Partial({
        skipUnparseableRanges: r.Undefined,
        dependencyWhitelist: r.Undefined,
      })
    ),
  r
    .Record({
      skipUnparseableRanges: r.Boolean,
      dependencyWhitelist: r.Array(r.String),
      dependencyBlacklist: r.Array(r.String),
    })
    .And(
      r.Partial({
        enforceForDevDependencies: r.Undefined,
      })
    ),
  r
    .Record({
      skipUnparseableRanges: r.Boolean,
      dependencyWhitelist: r.Array(r.String),
      enforceForDevDependencies: r.Boolean,
    })
    .And(
      r.Partial({
        dependencyBlacklist: r.Undefined,
      })
    ),
  r
    .Record({
      skipUnparseableRanges: r.Boolean,
      dependencyBlacklist: r.Array(r.String),
      enforceForDevDependencies: r.Boolean,
    })
    .And(
      r.Partial({
        dependencyWhitelist: r.Undefined,
      })
    ),
  r
    .Record({
      dependencyWhitelist: r.Array(r.String),
      dependencyBlacklist: r.Array(r.String),
      enforceForDevDependencies: r.Boolean,
    })
    .And(
      r.Partial({
        skipUnparseableRanges: r.Undefined,
      })
    ),
  r.Record({
    skipUnparseableRanges: r.Boolean,
    dependencyWhitelist: r.Array(r.String),
    dependencyBlacklist: r.Array(r.String),
    enforceForDevDependencies: r.Boolean,
  })
);

export type Options = r.Static<typeof Options>;

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
 * This regex allows any of the following formats:
 * - `>=15`
 * - `>=15.2`
 * - `>=15.2.1`
 * - `>=15.2.1-rc.0`
 * - `>=15.2.1+sha`
 * - `>=15.2.1-rc.0+sha`
 *
 * See https://semver.org/#spec-item-9 for details about semver formatting, and
 * https://regex101.com/r/vkijKf/1/ for a sample Regex.
 *
 * Note that the semver spec does _not_ specify npm range syntax. (`^`, `||`, `~`, `>`, etc.)
 *
 * More info: https://docs.npmjs.com/about-semantic-versioning
 */
export const MATCH_GREATER_OR_EQUAL_VERSION_RANGE = /^>= ?\d+(?:\.\d+|\.\d+\.\d+(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)?$/;

/**
 * This regex allows any of the following formats:
 * - `15`
 * - `^15`
 * - `15.x`
 * - `^15.x`
 * - `15.x.x`
 * - `^15.x.x`
 * - `^15.2`
 * - `^15.2.x`
 * - `^15.2.1`
 * - `^15.2.1-rc.0`
 * - `^15.2.1+sha`
 * - `^15.2.1-rc.0+sha`
 *
 * See https://semver.org/#spec-item-9 for details about semver formatting, and
 * https://regex101.com/r/vkijKf/1/ for a sample Regex.
 *
 * Note that the semver spec does _not_ specify npm range syntax. (`^`, `||`, `~`, `>`, etc.)
 *
 * More info: https://docs.npmjs.com/about-semantic-versioning
 */
export const MATCH_MAJOR_VERSION_RANGE = /^(?:\^?\d+|\^?\d+\.x|\^?\d+\.x\.x|\^\d+\.\d+|\^\d+\.\d+\.x|\^\d+\.\d+\.\d+(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)$/;

/**
 * Does not currently accept `<`, `<=`, `>`, `=` or `-` for ranges (e.g. `> 2.5.1 < 3` or `1.0.0 - 1.2.0`),
 * though it will accept isolated `>=` ranges (e.g. `>=2.5.1`, but not `^1 || >=2.5.1`)
 *
 * See https://semver.org/#spec-item-9 for details about semver formatting, and
 * https://regex101.com/r/vkijKf/1/ for a sample Regex.
 *
 * Note that the semver spec does _not_ specify npm range syntax. (`^`, `||`, `~`, `>`, etc.)
 *
 * More info: https://docs.npmjs.com/about-semantic-versioning
 *
 * TODO: accept minor pins `~4.2.1`
 */
export const RANGE_REGEX = /^(\*|x|>= ?\d+(?:\.\d+|\.\d+\.\d+(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)?|\^?\d+(\.x|\.x\.x|\.\d+|\.\d+\.x|\.\d+\.\d+(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)?( \|\| \^?\d+(\.x|\.x\.x|\.\d+|\.\d+\.x|\.\d+\.\d+(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)?)*)$/;

interface IPeerDependencyRequirement {
  fromPackageName: string;
  range: ValidRange;
}

interface IResolvedPeerDependencyRequirement {
  fromPeerDependencyRequirements: IPeerDependencyRequirement[];
  range: ValidRange;
}

function checkSatisfyPeerDependencies(context: Context, opts: Options) {
  const { dependencyBlacklist, dependencyWhitelist, enforceForDevDependencies, skipUnparseableRanges } = opts;
  const packageJsonPath = path.resolve(context.getPackageJsonPath());
  const packageJson: PackageJson = require(packageJsonPath);
  const packageDependencies = packageJson.dependencies || {};
  const packageDevDependencies = packageJson.devDependencies || {};
  const packagePeerDependencies = packageJson.peerDependencies || {};
  const packageName = packageJson.name || packageJsonPath;

  // check that no peer dependencies are also declared as regular dependencies
  for (const [peerDependencyName, peerDependencyRange] of Object.entries(packagePeerDependencies)) {
    if (shouldSkipPackage({ dependencyBlacklist, dependencyWhitelist, packageName: peerDependencyName })) {
      continue;
    }

    const dependencyRange = packageDependencies[peerDependencyName];
    if (dependencyRange != null) {
      context.addError({
        file: packageJsonPath,
        message:
          `[0] Package ${packageName} has overloaded ${peerDependencyName} dependencies.\n\t` +
          `Peer dependency '${peerDependencyRange}' and regular dependency '${dependencyRange}'.`,
      });
    }
  }

  // map of all inherited peer dependency requirements
  const allRequiredPeerDependencies: { [peerDependencyName: string]: IPeerDependencyRequirement[] } = {};

  // for each of this package's dependencies, add the dependency's peer requirements into `allRequiredPeerDependencies`
  const allDependencies = enforceForDevDependencies
    ? [...Object.keys(packageDependencies), ...Object.keys(packageDevDependencies)]
    : Object.keys(packageDependencies);
  for (const dependency of allDependencies) {
    const dependencyPackageJsonPath = resolveDependencyManifest(dependency, {
      paths: [path.dirname(packageJsonPath)],
    });
    const dependencyPackageJson: PackageJson = require(dependencyPackageJsonPath);
    const requiredPeerDependencies = dependencyPackageJson.peerDependencies;
    if (requiredPeerDependencies == null) {
      continue;
    }
    for (const [peerDependencyName, range] of Object.entries(requiredPeerDependencies)) {
      if (shouldSkipPackage({ dependencyBlacklist, dependencyWhitelist, packageName: peerDependencyName })) {
        continue;
      }

      if (!isValidRange(range)) {
        const message = `Unable to parse ${dependencyPackageJson.name}'s ${peerDependencyName} peer dependency range '${range}'.`;
        if (skipUnparseableRanges) {
          context.addWarning({ file: dependencyPackageJsonPath, message });
          continue;
        }
        throw new Error(message);
      }
      if (allRequiredPeerDependencies[peerDependencyName] == null) {
        allRequiredPeerDependencies[peerDependencyName] = [];
      }
      allRequiredPeerDependencies[peerDependencyName].push({ fromPackageName: dependencyPackageJson.name!, range });
    }
  }

  for (const [peerDependencyName, peerDependencyRequirements] of Object.entries(allRequiredPeerDependencies)) {
    // for each inherited peer dependency, determine the strictest range
    let mostStrictPeerRequirement: IResolvedPeerDependencyRequirement = {
      fromPeerDependencyRequirements: [peerDependencyRequirements[0]],
      range: peerDependencyRequirements[0].range,
    };
    for (const peerRequirement of peerDependencyRequirements) {
      if (doesASatisfyB(mostStrictPeerRequirement.range, peerRequirement.range)) {
        continue;
      } else if (doesASatisfyB(peerRequirement.range, mostStrictPeerRequirement.range)) {
        mostStrictPeerRequirement = {
          fromPeerDependencyRequirements: [peerRequirement],
          range: peerRequirement.range,
        };
      } else {
        const maybeIntersection = findIntersection(peerRequirement.range, mostStrictPeerRequirement.range);
        if (maybeIntersection !== undefined) {
          mostStrictPeerRequirement = {
            fromPeerDependencyRequirements: [
              ...mostStrictPeerRequirement.fromPeerDependencyRequirements,
              peerRequirement,
            ],
            range: maybeIntersection,
          };
        } else {
          context.addError({
            file: packageJsonPath,
            message:
              `[1] Package ${packageName} has conflicting inherited ${peerDependencyName} peer dependencies.\n\t` +
              `Dependency ${peerRequirement.fromPackageName} requires '${peerRequirement.range}' but\n\t` +
              getMostStrictStatement(mostStrictPeerRequirement),
          });
        }
      }
    }

    // if this package has a dependency on an inherited peer dependency,
    // the range must be equal to or stricter than `mostStrictPeerRequirement`
    const packageDependencyRange = packageDependencies[peerDependencyName];
    if (packageDependencyRange != null) {
      if (!isValidRange(packageDependencyRange)) {
        const message = `Unable to parse ${packageName}'s ${peerDependencyName} dependency range '${packageDependencyRange}'.`;
        if (skipUnparseableRanges) {
          context.addWarning({ file: packageJsonPath, message });
        } else {
          throw new Error(message);
        }
      } else if (!doesASatisfyB(packageDependencyRange, mostStrictPeerRequirement.range)) {
        context.addError({
          file: packageJsonPath,
          message:
            `[2] Package ${packageName} dependency on ${peerDependencyName} '${packageDependencyRange}' does not satisfy inherited peer dependencies.\n\t` +
            getMostStrictStatement(mostStrictPeerRequirement),
        });
      }
    }

    // for every inherited peer dependency, this package must declare a dependency or peer dependency
    // equal to or stricter than `mostStrictPeerRequirement`
    const packagePeerDependencyRange = packagePeerDependencies[peerDependencyName];
    if (packageDependencyRange == null && packagePeerDependencyRange == null) {
      context.addError({
        file: packageJsonPath,
        message:
          `[3] Package ${packageName} is missing required ${peerDependencyName} dependency.\n\t` +
          getMostStrictStatement(mostStrictPeerRequirement),
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
    if (packagePeerDependencyRange != null) {
      if (!isValidRange(packagePeerDependencyRange)) {
        const message = `Unable to parse ${packageName}'s ${peerDependencyName} peer dependency range '${packagePeerDependencyRange}'.`;
        if (skipUnparseableRanges) {
          context.addWarning({ file: packageJsonPath, message });
        } else {
          throw new Error(message);
        }
      } else if (!doesASatisfyB(packagePeerDependencyRange, mostStrictPeerRequirement.range)) {
        context.addError({
          file: packageJsonPath,
          message:
            `[4] Package ${packageName} peer dependency on ${peerDependencyName} '${packagePeerDependencyRange}' is not strict enough.\n\t` +
            getMostStrictStatement(mostStrictPeerRequirement),
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
}

function shouldSkipPackage({
  dependencyBlacklist,
  dependencyWhitelist,
  packageName,
}: {
  dependencyBlacklist?: string[];
  dependencyWhitelist?: string[];
  packageName: string;
}) {
  // blacklist should take precedance
  if (
    (dependencyBlacklist != null && dependencyBlacklist.includes(packageName)) ||
    (dependencyWhitelist != null && !dependencyWhitelist.includes(packageName))
  ) {
    return true;
  }
  return false;
}

function getMostStrictStatement(mostStrictPeerRequirement: IResolvedPeerDependencyRequirement) {
  if (mostStrictPeerRequirement.fromPeerDependencyRequirements.length === 1) {
    const dependencyName = mostStrictPeerRequirement.fromPeerDependencyRequirements[0].fromPackageName;
    return `Dependency ${dependencyName} requires '${mostStrictPeerRequirement.range}'.`;
  } else {
    const dependencyNames = mostStrictPeerRequirement.fromPeerDependencyRequirements
      .map((peerDependencyRequirement) => peerDependencyRequirement.fromPackageName)
      .join(", ");
    const dependencyRequirements = mostStrictPeerRequirement.fromPeerDependencyRequirements
      .map((peerDependencyRequirement) => `'${peerDependencyRequirement.range}'`)
      .join(", ");
    return (
      `Dependencies [${dependencyNames}] require [${dependencyRequirements}] respectively, ` +
      `resolving to '${mostStrictPeerRequirement.range}'.`
    );
  }
}

/**
 * Given two version ranges, find the maximum intersecting range
 * of `a` and `b`. `findIntersection(a,b)` should return the same
 * result as `findIntersection(b,a)`.
 *
 * NOTE: This code assumes that input version ranges match `RANGE_REGEX`.
 * Additionally, major version ranges must not be repeated in union ranges.
 * e.g. `^15.0.5 || ^16.0.0` is permitted, but `15.0.5 || 15.0.999` is not.
 *
 * EXAMPLES:
 * findIntersection("15.1.0", "*") => "15.1.0"
 * findIntersection("^15", "*") => "^15"
 * findIntersection(">=15", "*") => ">=15"
 * findIntersection("*", "*") => "*"
 * findIntersection("15.1.0", ">=1") => "15.1.0"
 * findIntersection("^15", ">=1") => "^15"
 * findIntersection(">=15", ">=1") => ">=15"
 * findIntersection("15.1.0", "^15") => "15.1.0"
 * findIntersection("^15.2", "^15") => "^15.2"
 * findIntersection("14", "^15") => undefined
 * findIntersection("15.1.0", "^15 || ^16") => "15.1.0"
 * findIntersection("^15.2", "^15 || ^16") => "^15.2"
 * findIntersection("14", "^15 || ^16") => undefined
 * findIntersection("^15.2 || ^16", "^15 || ^16.4") => "^15.2 || ^16.4"
 *
 * @param a version range that matches `RANGE_REGEX`
 * @param b version range that matches `RANGE_REGEX`
 * @returns the maximum intersecting `ValidRange`, or `undefined` if there is no intersection
 */
export function findIntersection(a: ValidRange, b: ValidRange): ValidRange | undefined {
  if (doesASatisfyB(a, b)) {
    return a;
  } else if (doesASatisfyB(b, a)) {
    return b;
  }

  // It's safe to assume that `isAnyVersionRange(a)` and `isAnyVersionRange(b)` are false,
  // since a `MATCH_ANY_VERSION_RANGE` would have been satisfied by anything.
  if (isAnyVersionRange(a) || isAnyVersionRange(b)) {
    throw new Error();
  }

  const aVersions = a.includes("||") ? a.split("||").map((s) => s.trim()) : [a];
  const bVersions = b.includes("||") ? b.split("||").map((s) => s.trim()) : [b];

  const aIsGreaterOrEqualVersionRange = isGreaterOrEqualVersionRange(a);
  const bIsGreaterOrEqualVersionRange = isGreaterOrEqualVersionRange(b);
  if (aIsGreaterOrEqualVersionRange && bIsGreaterOrEqualVersionRange) {
    // If the ranges were equal, they'd both satisfy each other.
    // Otherwise, the higher range should have satisfied the lower range.
    throw new Error();
  }

  if (aIsGreaterOrEqualVersionRange) {
    const aSemVer = coerce(a)!;
    // keep every version where `bSemVer` is >= `aSemVer`
    const compatibleBVersions = bVersions.filter((bVersion) => {
      const bSemVer = coerce(bVersion)!;
      return bSemVer.compare(aSemVer) !== -1;
    });
    if (compatibleBVersions.length === 0) {
      return undefined;
    }
    return compatibleBVersions.join(" || ") as ValidRange;
  }
  if (bIsGreaterOrEqualVersionRange) {
    const bSemVer = coerce(b)!;
    // keep every version where `aSemVer` is >= `bSemVer`
    const compatibleAVersions = aVersions.filter((aVersion) => {
      const aSemVer = coerce(aVersion)!;
      return aSemVer.compare(bSemVer) !== -1;
    });
    if (compatibleAVersions.length === 0) {
      return undefined;
    }
    return compatibleAVersions.join(" || ") as ValidRange;
  }

  const compatibleVersions = aVersions
    .map((aVersion) => {
      const aSemVer = coerce(aVersion)!;
      const majorMatchingBVersion = bVersions.find((m) => coerce(m)!.major === aSemVer.major);
      if (majorMatchingBVersion === undefined) {
        // there is no intersecting `b` major version for this `a` major version
        return undefined;
      }
      if (doesASatisfyB(aVersion as ValidRange, majorMatchingBVersion as ValidRange)) {
        return aVersion;
      } else if (doesASatisfyB(majorMatchingBVersion as ValidRange, aVersion as ValidRange)) {
        return majorMatchingBVersion;
      } else {
        return undefined;
      }
    })
    .filter((aVersion) => aVersion !== undefined);
  if (compatibleVersions.length === 0) {
    return undefined;
  }
  return compatibleVersions.join(" || ") as ValidRange;
}

/**
 * Given two version ranges, determine whether `a` satisfies `b`.
 * `a` satisfies `b` iff `a` is a "more strict than or equal to" subset of `b`.
 * For example, both `^15` and `^15.2.0` satisfy `^15`, but `^15 || ^16` does not.
 *
 * NOTE: This code assumes that input version ranges match `RANGE_REGEX`.
 * Additionally, major version ranges must not be repeated in union ranges.
 * e.g. `^15.0.5 || ^16.0.0` is permitted, but `15.0.5 || 15.0.999` is not.
 *
 * To determine that `a` is "more strict than or equal to" `b`, we first
 * split the set of all versions or ranges that are potentially unioned in `a` and `b`.
 * For example, if `a` is `15.0.5`, we produce the set `[ "15.0.5" ]`,
 * and if `b` is `^15 || ^16`, we produce the set `[ "^15", "^16" ]`.
 * `a` is "more strict than or equal to" `b` iff each entry in `a`'s set
 * satisfies (equal to or greater than) some entry in `b`.
 *
 * The following version ranges satisfy `^15.0.5 || ^16.0.0`:
 * - `^15.0.5 || ^16.0.0`
 * - `^15.0.5 || ^16.x.x`
 * - `15.0.5 || 16.0.0`
 * - `^15.0.999 || ^16.0.0`
 * - `^15.0.5 || ^16.0.999`
 * - `^15.0.999`
 * - `^16.0.0`
 * - `16.0.0`
 * The following version ranges do not satisfy `^15.0.5 || ^16.0.0`:
 * - `^15.0.0 || ^16.0.0`
 * - `^15.0.5 || ^17.0.0`
 * - `^14.0.0 || ^15.0.5 || ^16.0.0`
 * - `^17.0.0`
 * - `17.0.0`
 *
 * @param a version range that matches `RANGE_REGEX`
 * @param b version range that matches `RANGE_REGEX`
 * @returns `true` if `a` is more strict than or equal to `b`, `false` otherwise
 */
export function doesASatisfyB(a: ValidRange, b: ValidRange): boolean {
  if (a === b) {
    return true;
  }

  const aIsAnyVersionRange = isAnyVersionRange(a);
  const bIsAnyVersionRange = isAnyVersionRange(b);
  if (bIsAnyVersionRange) {
    return true;
  } else if (aIsAnyVersionRange) {
    // `bIsAnyVersionRange` is `false`
    // `a` permits more values than `b`, therefore `a` is "less strict"
    return false;
  }

  const aVersions = a.includes("||") ? a.split("||").map((s) => s.trim()) : [a];
  const bVersions = b.includes("||") ? b.split("||").map((s) => s.trim()) : [b];

  const aIsGreaterOrEqualVersionRange = isGreaterOrEqualVersionRange(a);
  const bIsGreaterOrEqualVersionRange = isGreaterOrEqualVersionRange(b);
  if (aIsGreaterOrEqualVersionRange && bIsGreaterOrEqualVersionRange) {
    const aSemVer = coerce(a)!;
    const bSemVer = coerce(b)!;
    // `a` satisfies `b` so long as `aSemVer` is greater than or equal to `bSemVer`
    return aSemVer.compare(bSemVer) !== -1;
  } else if (bIsGreaterOrEqualVersionRange) {
    const bSemVer = coerce(b)!;
    return aVersions.every((aVersion) => {
      const aSemVer = coerce(aVersion)!;
      // `a` satisfies `b` so long as `aSemVer` is greater than or equal to `bSemVer`
      return aSemVer.compare(bSemVer) !== -1;
    });
  } else if (aIsGreaterOrEqualVersionRange) {
    // `bIsGreaterOrEqualVersionRange` is `false` (and `bIsAnyVersionRange` is `false`)
    // `a` permits more values than `b`, therefore `a` is "less strict"
    return false;
  }

  return aVersions.every((aVersion) => {
    const aSemVer = coerce(aVersion)!;
    const majorMatchingBVersion = bVersions.find((m) => coerce(m)!.major === aSemVer.major);
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

function isGreaterOrEqualVersionRange(version: string): boolean {
  return MATCH_GREATER_OR_EQUAL_VERSION_RANGE.test(version);
}

function isMajorVersionRange(version: string): boolean {
  return MATCH_MAJOR_VERSION_RANGE.test(version);
}

export type ValidRange = string & { _type: "valid range" };
export function isValidRange(version: string): version is ValidRange {
  return RANGE_REGEX.test(version);
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
    mutateJson<PackageJson>(packageJsonPath, (packageJson) => {
      if (packageJson[dependencyType] == null) {
        packageJson[dependencyType] = {};
      }
      packageJson[dependencyType]![dependencyName] = version;
      return packageJson;
    });
  };
}
