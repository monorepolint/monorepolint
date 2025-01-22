/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepolint/config";
import { mutateJson, PackageJson } from "@monorepolint/utils";
import * as r from "runtypes";
import { coerce, SemVer } from "semver";
import { createRuleFactory } from "./util/createRuleFactory.js";
export const Options = r.Record({
  matchDependencyVersions: r.Dictionary(r.Union(r.String, r.Array(r.String))),
});

export type Options = r.Static<typeof Options>;

export const consistentVersions = createRuleFactory({
  name: "consistentVersions",
  check: checkConsistentVersions,
  validateOptions: Options.check,
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

  const expectedPackageDependencyVersion = coerce(
    expectedPackageDependencyValue,
  );
  if (expectedPackageDependencyVersion == null) {
    throw new Error(
      `Malformed expected package dependency version defined in monorepolint configuration: ${dependencyPackageName} @ '${expectedPackageDependencyValue}'`,
    );
  }

  const actualPackageDependencyValue = packageJson.dependencies
    && packageJson.dependencies[dependencyPackageName];
  const actualPackageDependencyVersion = coerce(actualPackageDependencyValue);
  if (
    actualPackageDependencyVersion != null
    && actualPackageDependencyVersion.raw
      !== expectedPackageDependencyVersion.raw
  ) {
    context.addError({
      file: packageJsonPath,
      message:
        `Expected dependency on ${dependencyPackageName} to match version defined in monorepolint configuration '${expectedPackageDependencyValue}', got '${actualPackageDependencyValue}' instead.`,
      fixer: () =>
        mutateJson<PackageJson>(packageJsonPath, context.host, (input) => {
          input.dependencies![dependencyPackageName] =
            expectedPackageDependencyValue;
          return input;
        }),
    });
  }

  const actualPackageDevDependencyValue = packageJson.devDependencies
    && packageJson.devDependencies[dependencyPackageName];
  const actualPackageDevDependencyVersion = coerce(
    actualPackageDevDependencyValue,
  );
  if (
    actualPackageDevDependencyVersion != null
    && actualPackageDevDependencyVersion.raw
      !== expectedPackageDependencyVersion.raw
  ) {
    context.addError({
      file: packageJsonPath,
      message:
        `Expected devDependency on ${dependencyPackageName} to match version defined in monorepolint configuration '${expectedPackageDependencyValue}', got '${actualPackageDevDependencyValue}' instead`,
      fixer: () =>
        mutateJson<PackageJson>(packageJsonPath, context.host, (input) => {
          input.devDependencies![dependencyPackageName] =
            expectedPackageDependencyValue;
          return input;
        }),
    });
  }
};

const ensurePackageMatchesSomeVersion = (
  context: Context,
  dependencyPackageName: string,
  acceptedPackageDependencyValues: string[],
) => {
  const packageJson = context.getPackageJson();
  const packageJsonPath = context.getPackageJsonPath();

  const acceptedPackageDependencyVersions: SemVer[] =
    acceptedPackageDependencyValues.map(
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
  const actualPackageDependencyVersion = coerce(actualPackageDependencyValue);
  if (
    actualPackageDependencyVersion != null
    && acceptedPackageDependencyVersions.every(
      (acceptedPackageDependencyVersion) =>
        actualPackageDependencyVersion.raw
          !== acceptedPackageDependencyVersion.raw,
    )
  ) {
    context.addError({
      file: packageJsonPath,
      message:
        `Expected dependency on ${dependencyPackageName} to match one of '${
          JSON.stringify(
            acceptedPackageDependencyValues,
          )
        }', got '${actualPackageDependencyValue}' instead.`,
    });
  }

  const actualPackageDevDependencyValue = packageJson.devDependencies
    && packageJson.devDependencies[dependencyPackageName];
  const actualPackageDevDependencyVersion = coerce(
    actualPackageDevDependencyValue,
  );
  if (
    actualPackageDevDependencyVersion != null
    && acceptedPackageDependencyVersions.every(
      (acceptedPackageDependencyVersion) =>
        actualPackageDevDependencyVersion.raw
          !== acceptedPackageDependencyVersion.raw,
    )
  ) {
    context.addError({
      file: packageJsonPath,
      message:
        `Expected devDependency on ${dependencyPackageName} to match one of '${
          JSON.stringify(
            acceptedPackageDependencyValues,
          )
        }', got '${actualPackageDevDependencyValue}' instead.`,
    });
  }
};
