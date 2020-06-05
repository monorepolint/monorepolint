/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/core";
import { mutateJson, PackageJson } from "@monorepolint/utils";
import * as r from "runtypes";
import { coerce } from "semver";

export const Options = r.Record({
  matchDependencyVersions: r.Dictionary(r.String),
});

export type Options = r.Static<typeof Options>;

export const consistentVersions: RuleModule<typeof Options> = {
  check: checkConsistentVersions,
  optionsRuntype: Options,
};

function checkConsistentVersions(context: Context, options: Options) {
  for (const [dependencyPackageName, expectedPackageDependencyValue] of Object.entries(
    options.matchDependencyVersions
  )) {
    ensurePackageIsCorrectVersion(context, dependencyPackageName, expectedPackageDependencyValue);
  }
}

const ensurePackageIsCorrectVersion = (
  context: Context,
  dependencyPackageName: string,
  expectedPackageDependencyValue: string
) => {
  const packageJson = context.getPackageJson();
  const packageJsonPath = context.getPackageJsonPath();

  const expectedPackageDependencyVersion = coerce(expectedPackageDependencyValue);
  if (expectedPackageDependencyVersion == null) {
    throw new Error(
      `Malformed expected package dependency version defined in monorepolint configuration: ${dependencyPackageName} @ '${expectedPackageDependencyValue}'`
    );
  }

  const actualPackageDependencyValue = packageJson.dependencies && packageJson.dependencies[dependencyPackageName];
  const actualPackageDependencyVersion = coerce(actualPackageDependencyValue);
  if (
    actualPackageDependencyVersion != null &&
    actualPackageDependencyVersion.raw !== expectedPackageDependencyVersion.raw
  ) {
    context.addError({
      file: packageJsonPath,
      message: `Expected dependency on ${dependencyPackageName} to match version defined in monorepolint configuration '${expectedPackageDependencyValue}', got '${actualPackageDependencyValue}' instead.`,
      fixer: () =>
        mutateJson<PackageJson>(packageJsonPath, input => {
          input.dependencies![dependencyPackageName] = expectedPackageDependencyValue;
          return input;
        }),
    });
  }

  const actualPackageDevDependencyValue =
    packageJson.devDependencies && packageJson.devDependencies[dependencyPackageName];
  const actualPackageDevDependencyVersion = coerce(actualPackageDevDependencyValue);
  if (
    actualPackageDevDependencyVersion != null &&
    actualPackageDevDependencyVersion.raw !== expectedPackageDependencyVersion.raw
  ) {
    context.addError({
      file: packageJsonPath,
      message: `Expected devDependency on ${dependencyPackageName} to match version defined in monorepolint configuration '${expectedPackageDependencyValue}', got '${actualPackageDevDependencyValue}' instead`,
      fixer: () =>
        mutateJson<PackageJson>(packageJsonPath, input => {
          input.devDependencies![dependencyPackageName] = expectedPackageDependencyValue;
          return input;
        }),
    });
  }
};
