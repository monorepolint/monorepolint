/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { join as pathJoin } from "path";
import { getWorkspacePackageDirs } from "./getWorkspacePackageDirs";
import { Host } from "./Host";
import { PackageJson } from "./PackageJson";

/**
 * returns a map of package names to their directories in the workspace.
 * if `resolvePaths` is true, the returned directory names are absolute paths
 * resolved against the `workspaceDir`.
 */
export function getPackageNameToDir(host: Pick<Host, "readJson">, workspaceDir: string, resolvePaths: boolean = false) {
  const ret = new Map<string, string>();

  for (const packageDir of getWorkspacePackageDirs(host, workspaceDir, resolvePaths)) {
    const packagePath = pathJoin(packageDir, "package.json");
    const { name } = host.readJson(packagePath) as PackageJson;
    if (name === undefined) {
      throw new Error(`Package needs a name: ${packagePath}`);
    }
    ret.set(name, packageDir);
  }
  return ret;
}
