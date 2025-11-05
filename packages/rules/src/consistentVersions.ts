/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepolint/config";
import { mutateJson, PackageJson } from "@monorepolint/utils";
import { coerce, SemVer } from "semver";
import { z } from "zod";
import { createRuleFactory } from "./util/createRuleFactory.js";
export const Options = z.object({
  matchDependencyVersions: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export type Options = z.infer<typeof Options>;

export const consistentVersions = createRuleFactory({
  name: "consistentVersions",
  check: checkConsistentVersions,
  validateOptions: Options.parse,
});

function checkConsistentVersions(context: Context, options: Options) {
  for (
    const [dependencyPackageName, expectedPackageDependencyValue] of Object
      .entries(
        options.matchDependencyVersions,
      )
  ) {
    if (Array.isArray(expectedPackageDependencyValue)) {
      ensurePackageMatchesSomeVersion(
        context,
        dependencyPackageName,
        expectedPackageDependencyValue,
      );
    } else {
      ensurePackageIsCorrectVersion(
        context,
        dependencyPackageName,
        expectedPackageDependencyValue,
      );
    }
  }
}

const ensurePackageIsCorrectVersion = (
  context: Context,
  dependencyPackageName: string,
  expectedPackageDependencyValue: string,
) => {
  const packageJson = context.getPackageJson();
  const packageJsonPath = context.getPackageJsonPath();

  // Allow special version strings like "catalog:", "workspace:", etc.
  const isSpecialVersion = expectedPackageDependencyValue.endsWith(":");
  let expectedPackageDependencyVersion: SemVer | null = null;

  if (!isSpecialVersion) {
    expectedPackageDependencyVersion = coerce(expectedPackageDependencyValue);
    if (expectedPackageDependencyVersion == null) {
      throw new Error(
        `Malformed expected package dependency version defined in monorepolint configuration: ${dependencyPackageName} @ '${expectedPackageDependencyValue}'`,
      );
    }
  }

  const actualPackageDependencyValue = packageJson.dependencies
    && packageJson.dependencies[dependencyPackageName];

  if (actualPackageDependencyValue != null) {
    const shouldUpdate = isSpecialVersion
      ? actualPackageDependencyValue !== expectedPackageDependencyValue
      : (() => {
        const actualPackageDependencyVersion = coerce(actualPackageDependencyValue);
        return actualPackageDependencyVersion != null
          && actualPackageDependencyVersion.raw !== expectedPackageDependencyVersion!.raw;
      })();

    if (shouldUpdate) {
      context.addError({
        file: packageJsonPath,
        message:
          `Expected dependency on ${dependencyPackageName} to match version defined in monorepolint configuration '${expectedPackageDependencyValue}', got '${actualPackageDependencyValue}' instead.`,
        fixer: () =>
          mutateJson<PackageJson>(packageJsonPath, context.host, (input) => {
            input.dependencies![dependencyPackageName] = expectedPackageDependencyValue;
            return input;
          }),
      });
    }
  }

  const actualPackageDevDependencyValue = packageJson.devDependencies
    && packageJson.devDependencies[dependencyPackageName];

  if (actualPackageDevDependencyValue != null) {
    const shouldUpdateDev = isSpecialVersion
      ? actualPackageDevDependencyValue !== expectedPackageDependencyValue
      : (() => {
        const actualPackageDevDependencyVersion = coerce(actualPackageDevDependencyValue);
        return actualPackageDevDependencyVersion != null
          && actualPackageDevDependencyVersion.raw !== expectedPackageDependencyVersion!.raw;
      })();

    if (shouldUpdateDev) {
      context.addError({
        file: packageJsonPath,
        message:
          `Expected devDependency on ${dependencyPackageName} to match version defined in monorepolint configuration '${expectedPackageDependencyValue}', got '${actualPackageDevDependencyValue}' instead`,
        fixer: () =>
          mutateJson<PackageJson>(packageJsonPath, context.host, (input) => {
            input.devDependencies![dependencyPackageName] = expectedPackageDependencyValue;
            return input;
          }),
      });
    }
  }
};

const ensurePackageMatchesSomeVersion = (
  context: Context,
  dependencyPackageName: string,
  acceptedPackageDependencyValues: string[],
) => {
  const packageJson = context.getPackageJson();
  const packageJsonPath = context.getPackageJsonPath();

  // Separate special versions from regular semver versions
  const specialVersions = acceptedPackageDependencyValues.filter(val => val.endsWith(":"));
  const regularVersions = acceptedPackageDependencyValues.filter(val => !val.endsWith(":"));

  const acceptedPackageDependencyVersions: SemVer[] = regularVersions.map(
    (acceptedPackageDependencyValue) => {
      const acceptedPackageDependencyVersion = coerce(
        acceptedPackageDependencyValue,
      );
      if (acceptedPackageDependencyVersion == null) {
        throw new Error(
          `Malformed accepted package dependency version defined in monorepolint configuration: ${dependencyPackageName} @ '${acceptedPackageDependencyValue}'`,
        );
      }
      return acceptedPackageDependencyVersion;
    },
  );

  const actualPackageDependencyValue = packageJson.dependencies
    && packageJson.dependencies[dependencyPackageName];

  if (actualPackageDependencyValue != null) {
    // Check if actual version matches any special version or regular semver version
    const matchesSpecialVersion = specialVersions.includes(actualPackageDependencyValue);
    const matchesRegularVersion = (() => {
      const actualPackageDependencyVersion = coerce(actualPackageDependencyValue);
      return actualPackageDependencyVersion != null
        && acceptedPackageDependencyVersions.some(
          (acceptedPackageDependencyVersion) =>
            actualPackageDependencyVersion.raw === acceptedPackageDependencyVersion.raw,
        );
    })();

    if (!matchesSpecialVersion && !matchesRegularVersion) {
      context.addError({
        file: packageJsonPath,
        message: `Expected dependency on ${dependencyPackageName} to match one of '${
          JSON.stringify(
            acceptedPackageDependencyValues,
          )
        }', got '${actualPackageDependencyValue}' instead.`,
      });
    }
  }

  const actualPackageDevDependencyValue = packageJson.devDependencies
    && packageJson.devDependencies[dependencyPackageName];

  if (actualPackageDevDependencyValue != null) {
    // Check if actual dev version matches any special version or regular semver version
    const matchesSpecialDevVersion = specialVersions.includes(actualPackageDevDependencyValue);
    const matchesRegularDevVersion = (() => {
      const actualPackageDevDependencyVersion = coerce(actualPackageDevDependencyValue);
      return actualPackageDevDependencyVersion != null
        && acceptedPackageDependencyVersions.some(
          (acceptedPackageDependencyVersion) =>
            actualPackageDevDependencyVersion.raw === acceptedPackageDependencyVersion.raw,
        );
    })();

    if (!matchesSpecialDevVersion && !matchesRegularDevVersion) {
      context.addError({
        file: packageJsonPath,
        message: `Expected devDependency on ${dependencyPackageName} to match one of '${
          JSON.stringify(
            acceptedPackageDependencyValues,
          )
        }', got '${actualPackageDevDependencyValue}' instead.`,
      });
    }
  }
};
