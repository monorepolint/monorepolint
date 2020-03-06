/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import glob from "glob";
import * as path from "path";
import { FileSystem } from "./FileSystem";
import { PackageJson } from "./PackageJson";

export abstract class AbstractFileSystem implements FileSystem {
  public abstract readJson(path: string): unknown;
  public abstract writeJson(path: string, obj: unknown): void;

  public abstract readFile(path: string, options?: { encoding?: null; flag?: string }): Buffer;
  public abstract readFile(path: string, options: string | { encoding: string; flag?: string }): string;

  public abstract writeFile(path: string, data: string | Buffer): void;
  public abstract exists(path: string): boolean;
  public abstract unlink(path: string): void;
  public abstract flush(): void;

  public abstract mkdir(path: string, options?: import("./FileSystem").MkdirOptions | undefined): void;

  public mutateJson<T extends object>(filePath: string, mutator: (f: T) => T) {
    let file: T = this.readJson(filePath) as T;
    file = mutator(file);
    this.writeJson(filePath, file);
  }

  public findWorkspaceDir(dir: string): string | undefined {
    const packagePath = path.join(dir, "package.json");
    if (this.exists(packagePath)) {
      const packageJson = this.readJson(packagePath) as PackageJson;
      if (packageJson.workspaces !== undefined) {
        return dir;
      }
    }

    const nextDir = path.normalize(path.join(dir, ".."));
    if (nextDir === dir) {
      return undefined;
    }

    return this.findWorkspaceDir(nextDir);
  }

  public getPackageNameToDir(workspaceDir: string, resolvePaths: boolean = false) {
    const ret = new Map<string, string>();

    for (const packageDir of this.getWorkspacePackageDirs(workspaceDir, resolvePaths)) {
      const packagePath = path.join(packageDir, "package.json");
      const { name } = this.readJson(packagePath) as PackageJson;
      if (name === undefined) {
        throw new Error(`Package needs a name: ${packagePath}`);
      }
      ret.set(name, packageDir);
    }
    return ret;
  }

  public getWorkspacePackageDirs(workspaceDir: string, resolvePaths: boolean = false) {
    const ret: string[] = [];

    const packageJson = this.readJson(path.join(workspaceDir, "package.json")) as PackageJson;

    if (packageJson.workspaces === undefined) {
      throw new Error("Invalid workspaceDir: " + workspaceDir);
    }

    const packageGlobs = Array.isArray(packageJson.workspaces)
      ? packageJson.workspaces
      : packageJson.workspaces.packages || [];

    for (const pattern of packageGlobs) {
      for (const packagePath of glob.sync(pattern, { cwd: workspaceDir })) {
        const packageJsonPath = path.join(workspaceDir, packagePath, "package.json");

        if (this.exists(packageJsonPath)) {
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
}
