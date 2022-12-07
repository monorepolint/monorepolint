/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { join as pathJoin } from "path";
import { getWorkspacePackageDirs } from "./getWorkspacePackageDirs.js";
import { Host } from "./Host.js";
import { PackageJson } from "./PackageJson.js";
/**
 * returns a map of package names to their directories in the workspace.
 * if `resolvePaths` is true, the returned directory names are absolute paths
 * resolved against the `workspaceDir`.
 */
export async function getPackageNameToDir(
  host: Pick<Host, "readJson" | "exists">,
  workspaceDir: string,
  resolvePaths: boolean = false
) {
  const ret = new Map<string, string>();

  const workspacePackages = await getWorkspacePackageDirs(host, workspaceDir, resolvePaths);
  for (const packageDir of workspacePackages) {
    const packagePath = pathJoin(packageDir, "package.json");
    const { name } = host.readJson(packagePath) as PackageJson;
    if (name === undefined) {
      throw new Error(`Package needs a name: ${packagePath}`);
    }
    ret.set(name, packageDir);
  }
  return ret;
}
