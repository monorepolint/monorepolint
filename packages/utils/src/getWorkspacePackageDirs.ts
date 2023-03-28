/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import { Host } from "./Host.js";
import { PackageJson } from "./PackageJson.js";

async function findPNPMWorkspacePackages(workspaceRoot: string) {
  workspaceRoot = fs.realpathSync(workspaceRoot);
  const { default: readYamlFile } = await import("read-yaml-file");
  const workspaceManifest = await readYamlFile<{ packages?: string[] }>(
    path.join(workspaceRoot, "pnpm-workspace.yaml")
  );

  const { findPackages } = await import("find-packages");
  return findPackages(workspaceRoot, {
    ignore: ["**/node_modules/**", "**/bower_components/**"],
    includeRoot: true,
    patterns: workspaceManifest.packages,
  });
}

export async function getWorkspacePackageDirs(
  host: Pick<Host, "readJson" | "exists">,
  workspaceDir: string,
  resolvePaths: boolean = false
) {
  const packageJson: PackageJson = host.readJson(path.join(workspaceDir, "package.json"));

  const isPnpmWorkspace = host.exists(path.join(workspaceDir, "pnpm-workspace.yaml"));
  if (isPnpmWorkspace) {
    const workspacePackages = await findPNPMWorkspacePackages(workspaceDir);
    if (workspacePackages.length === 0) {
      throw new Error("Invalid workspaceDir: " + workspaceDir);
    }
    return workspacePackages.map((project) => project.dir).filter((d) => d !== workspaceDir);
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
      const packageJsonPath = path.join(workspaceDir, packagePath, "package.json");

      if (fs.existsSync(packageJsonPath)) {
        if (resolvePaths === true) {
          ret.push(path.resolve(path.join(workspaceDir, packagePath)));
        } else {
          ret.push(packagePath);
        }
      }
    }
  }

  return ret;
}
