/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

export interface FileSystem {
  readJson(path: string): unknown;
  writeJson(path: string, obj: unknown): void;

  readFile(path: string, options?: { encoding?: null; flag?: string }): Buffer;
  readFile(path: string, options: { encoding: string; flag?: string } | string): string;

  writeFile(path: string, data: string | Buffer): void;
  exists(path: string): boolean;
  unlink(path: string): void;
  mkdir(path: string, options?: MkdirOptions): void;

  flush(): void;

  mutateJson<T extends object>(path: string, mutator: (f: T) => T): void;
  getWorkspacePackageDirs(workspaceDir: string, resolvePaths?: boolean): string[];
  getPackageNameToDir(workspaceDir: string, resolvePaths?: boolean): Map<string, string>;
  findWorkspaceDir(dir: string): string | undefined;
}

export interface MkdirOptions {
  recursive?: boolean;
}
