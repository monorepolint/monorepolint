/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { existsSync } from "fs";
import glob from "glob";
import { join as pathJoin, resolve as pathResolve } from "path";
import { Host } from "./Host";
import { PackageJson } from "./PackageJson";

export function getWorkspacePackageDirs(
  host: Pick<Host, "readJson">,
  workspaceDir: string,
  resolvePaths: boolean = false
) {
  const ret: string[] = [];

  const packageJson: PackageJson = host.readJson(pathJoin(workspaceDir, "package.json"));

  if (packageJson.workspaces === undefined) {
    throw new Error("Invalid workspaceDir: " + workspaceDir);
  }

  const packageGlobs = Array.isArray(packageJson.workspaces)
    ? packageJson.workspaces
    : packageJson.workspaces.packages || [];

  for (const pattern of packageGlobs) {
    for (const packagePath of glob.sync(pattern, { cwd: workspaceDir })) {
      const packageJsonPath = pathJoin(workspaceDir, packagePath, "package.json");

      if (existsSync(packageJsonPath)) {
        if (resolvePaths === true) {
          ret.push(pathResolve(pathJoin(workspaceDir, packagePath)));
        } else {
          ret.push(packagePath);
        }
      }
    }
  }

  return ret;
}
