import * as fs from "fs";
import * as path from "path";
import { readJson } from "./readJson";
import { PackageJson } from './PackageJson';

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
