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
    return workspacePackages.map((project) => project.dir).filter((d) => d !== workspaceDir);
  }

  if (!packageJson.workspaces) {
    throw new Error(
      "Unsupported! Monorepo is not backed by either pnpm nor yarn workspaces.",
    );
  }

  const packageGlobs = Array.isArray(packageJson.workspaces)
    ? packageJson.workspaces
    : packageJson.workspaces.packages || [];

  // Yarn and npm workspaces both support excluding a directory via a "!"-prefixed
  // pattern (e.g. ["packages/*", "!packages/excluded"]). Negation like this is
  // inherently cross-pattern, so we expand the positive and negative patterns
  // separately and then filter the accumulated set, rather than passing each
  // pattern to glob.sync() in isolation (which would treat "!packages/excluded"
  // as a literal, unmatchable path).
  const positivePatterns = packageGlobs.filter((pattern) => !pattern.startsWith("!"));
  const negativePatterns = packageGlobs
    .filter((pattern) => pattern.startsWith("!"))
    .map((pattern) => pattern.slice(1));

  const excludedPackagePaths = new Set<string>();
  for (const pattern of negativePatterns) {
    for (const packagePath of glob.sync(pattern, { cwd: workspaceDir })) {
      excludedPackagePaths.add(packagePath);
    }
  }

  const ret: string[] = [];
  for (const pattern of positivePatterns) {
    for (const packagePath of glob.sync(pattern, { cwd: workspaceDir })) {
      if (excludedPackagePaths.has(packagePath)) {
        continue;
      }

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
