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
import findPNPMWorkspacePackages from "@pnpm/find-workspace-packages";

export async function getWorkspacePackageDirs(
  host: Pick<Host, "readJson" | "exists">,
  workspaceDir: string,
  resolvePaths: boolean = false
) {
  const packageJson: PackageJson = host.readJson(pathJoin(workspaceDir, "package.json"));

  const isPnpmWorkspace = host.exists(pathJoin(workspaceDir, "pnpm-workspace.yaml"));
  if (isPnpmWorkspace) {
    const workspacePackages = await findPNPMWorkspacePackages(workspaceDir);
    if (workspacePackages.length === 0) {
      throw new Error("Invalid workspaceDir: " + workspaceDir);
    }
    return workspacePackages.map((project) => project.dir).filter((d) => d != workspaceDir);
  }

  if (!packageJson.workspaces) {
    throw new Error("Unsupported! Monorepo is not backed by either pnpm nor yarn workspaces.");
  }

  const ret: string[] = [];
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
