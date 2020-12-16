/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

/**
 * As of node v12.16.2, if a module does not explicitly export its package.json then require.resolve will return a
 * ERR_PACKAGE_PATH_NOT_EXPORTED. Not all packages have their package.json explicitly declared. To get around this, we
 * catch the error and fallback to picking the package.json path that should always be present on the filesystem.
 * N.B. this function should become obsolete once import.meta.resolve() is no longer an experimental feature.
 */
export function resolveDependencyManifest(dependency: string, context?: { paths: string[] }): string {
  try {
    return require.resolve(`${dependency}/package.json`, context);
  } catch (e) {
    if (e.code !== "ERR_PACKAGE_PATH_NOT_EXPORTED") {
      throw e;
    }
    const depPackageEntrypointPath = require.resolve(`${dependency}`, context);
    const packageDir = depPackageEntrypointPath.substring(
      0,
      depPackageEntrypointPath.lastIndexOf(dependency) + dependency.length
    );
    return `${packageDir}/package.json`;
  }
}
