/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as fs from "fs";
import * as path from "path";
import { PackageJson } from "./PackageJson";
import { readJson } from "./readJson";

export function findWorkspaceDir(dir: string): string | undefined {
  const packagePath = path.join(dir, "package.json");
  if (fs.existsSync(packagePath)) {
    const packageJson = readJson(packagePath) as PackageJson;
    if (packageJson.workspaces !== undefined) {
      return dir;
    }
  }

  const nextDir = path.normalize(path.join(dir, ".."));
  if (nextDir === dir) {
    return undefined;
  }

  return findWorkspaceDir(nextDir);
}
