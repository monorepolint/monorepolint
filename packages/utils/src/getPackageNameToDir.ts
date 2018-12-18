import { join as pathJoin } from "path";
import { getWorkspacePackageDirs } from "./getWorkspacePackageDirs";
import { readJson } from "./readJson";
import { PackageJson } from './PackageJson';

export function getPackageNameToDir(workspaceDir: string) {
  const ret = new Map<string, string>();

  for (const packageDir of getWorkspacePackageDirs(workspaceDir)) {
    const packagePath = pathJoin(packageDir, "package.json");
    const { name } = readJson(packagePath) as PackageJson;
    if (name === undefined) {
      throw new Error(`Package needs a name: ${packagePath}`);
    }
    ret.set(name, packageDir);
  }
  return ret;
}
