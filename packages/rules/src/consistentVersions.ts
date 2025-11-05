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

const shouldUpdateVersion = (
  actualValue: string,
  expectedValue: string,
  isProtocolVersionString: boolean,
  expectedSemVer: SemVer | null,
): boolean => {
  if (isProtocolVersionString) {
    return actualValue !== expectedValue;
  }

  const actualSemVer = coerce(actualValue);
  return actualSemVer != null && actualSemVer.raw !== expectedSemVer!.raw;
};

const matchesAnyVersion = (
  actualValue: string,
  protocolVersions: string[],
  acceptedSemVerVersions: SemVer[],
): boolean => {
  if (protocolVersions.includes(actualValue)) {
    return true;
  }

  const actualSemVer = coerce(actualValue);
  if (actualSemVer == null) {
    return false;
  }

  return acceptedSemVerVersions.some(
    (acceptedSemVer) => actualSemVer.raw === acceptedSemVer.raw,
  );
};

const ensurePackageIsCorrectVersion = (
  context: Context,
  dependencyPackageName: string,
  expectedPackageDependencyValue: string,
) => {
  const packageJson = context.getPackageJson();
  const packageJsonPath = context.getPackageJsonPath();

  // Allow protocol version strings like "catalog:", "workspace:", etc.
  const isProtocolVersion = expectedPackageDependencyValue.endsWith(":");
  let expectedPackageDependencyVersion: SemVer | null = null;

  if (!isProtocolVersion) {
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
    const shouldUpdate = shouldUpdateVersion(
      actualPackageDependencyValue,
      expectedPackageDependencyValue,
      isProtocolVersion,
      expectedPackageDependencyVersion,
    );

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
    const shouldUpdateDev = shouldUpdateVersion(
      actualPackageDevDependencyValue,
      expectedPackageDependencyValue,
      isProtocolVersion,
      expectedPackageDependencyVersion,
    );

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

  // Separate protocol versions from regular semver versions
  const protocolVersions = acceptedPackageDependencyValues.filter(val => val.endsWith(":"));
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
    const matches = matchesAnyVersion(
      actualPackageDependencyValue,
      protocolVersions,
      acceptedPackageDependencyVersions,
    );

    if (!matches) {
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
    const matches = matchesAnyVersion(
      actualPackageDevDependencyValue,
      protocolVersions,
      acceptedPackageDependencyVersions,
    );

    if (!matches) {
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
