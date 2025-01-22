/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { findPackages } from "find-packages";
import { existsSync } from "fs";
import * as glob from "glob";
import * as fs from "node:fs";
import * as path from "node:path";
import readYamlFile from "read-yaml-file";
import { Host } from "./Host.js";
import { PackageJson } from "./PackageJson.js";

async function findPNPMWorkspacePackages(workspaceRoot: string) {
  workspaceRoot = fs.realpathSync(workspaceRoot);
  const workspaceManifest = await readYamlFile.default<{ packages?: string[] }>(
    path.join(workspaceRoot, "pnpm-workspace.yaml"),
  );

  return findPackages(workspaceRoot, {
    ignore: ["**/node_modules/**", "**/bower_components/**"],
    includeRoot: true,
    patterns: workspaceManifest.packages,
  });
}

export async function getWorkspacePackageDirs(
  host: Pick<Host, "readJson" | "exists">,
  workspaceDir: string,
  resolvePaths: boolean = false,
) {
  const packageJson = host.readJson(
    path.join(workspaceDir, "package.json"),
  ) as PackageJson;

  const isPnpmWorkspace = host.exists(
    path.join(workspaceDir, "pnpm-workspace.yaml"),
  );
  if (isPnpmWorkspace) {
    const workspacePackages = await findPNPMWorkspacePackages(workspaceDir);
    if (workspacePackages.length === 0) {
      throw new Error("Invalid workspaceDir: " + workspaceDir);
    }
    return workspacePackages.map((project) => project.dir).filter((d) =>
      d !== workspaceDir
    );
  }

  if (!packageJson.workspaces) {
    throw new Error(
      "Unsupported! Monorepo is not backed by either pnpm nor yarn workspaces.",
    );
  }

  const ret: string[] = [];
  const packageGlobs = Array.isArray(packageJson.workspaces)
    ? packageJson.workspaces
    : packageJson.workspaces.packages || [];

  for (const pattern of packageGlobs) {
    for (const packagePath of glob.sync(pattern, { cwd: workspaceDir })) {
      const packageJsonPath = path.join(
        workspaceDir,
        packagePath,
        "package.json",
      );

      if (existsSync(packageJsonPath)) {
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
