/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as path from "path";
import { Host } from "./Host";
import { PackageJson } from "./PackageJson";
import findPnpmWorkspaceDir from "@pnpm/find-workspace-dir";

export async function findWorkspaceDir(
  host: Pick<Host, "readJson" | "exists">,
  dir: string
): Promise<string | undefined> {
  // Defining workspaces in package.json is not necessary in PNPM
  const maybePnpmWorkspaceDir = await findPnpmWorkspaceDir(dir);
  if (maybePnpmWorkspaceDir != null) {
    return maybePnpmWorkspaceDir;
  }

  // We may not be in a repository that uses PNPM, look for workspaces in package.json
  const packagePath = path.join(dir, "package.json");
  if (host.exists(packagePath)) {
    const packageJson = host.readJson(packagePath) as PackageJson;
    if (packageJson.workspaces !== undefined) {
      return dir;
    }
  }

  const nextDir = path.normalize(path.join(dir, ".."));
  if (nextDir === dir) {
    return undefined;
  }

  return findWorkspaceDir(host, nextDir);
}
