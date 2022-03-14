/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { existsSync } from "fs";
import * as path from "path";
import { Host } from "./Host";
import { PackageJson } from "./PackageJson";

export function findWorkspaceDir(host: Pick<Host, "readJson">, dir: string): string | undefined {
  const packagePath = path.join(dir, "package.json");
  if (existsSync(packagePath)) {
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
