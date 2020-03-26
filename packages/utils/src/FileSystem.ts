/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

export interface FileSystem {
  /**
   * Given a path, reads a json object from that file path.
   * @param path
   */
  readJson(path: string): unknown;

  /**
   * Given a path and a json object, writes that json object to the file path.
   */
  writeJson(path: string, obj: unknown): void;

  readFile(path: string, options?: { encoding?: null; flag?: string }): Buffer;
  readFile(path: string, options: { encoding: string; flag?: string } | string): string;

  writeFile(path: string, data: string | Buffer): void;
  exists(path: string): boolean;
  unlink(path: string): void;
  mkdir(path: string, options?: MkdirOptions): void;

  /**
   * Ensures all changes are written to disk. Important since some
   * implementations don't write until you finally flush().
   */
  flush(): void;

  /**
   * Helper method for reading json from a path, changing it, and writing it back to the path
   * @param path
   * @param mutator
   */
  mutateJson<T extends object>(path: string, mutator: (f: T) => T): void;

  /**
   * Given a yarn workspace directory, returns the dir of all packages in
   * the worksapce.
   *
   * @param workspaceDir
   * @param resolvePaths
   */
  getWorkspacePackageDirs(workspaceDir: string, resolvePaths?: boolean): string[];

  /**
   * Given a yarn workspace directory, returns a map of all package names to
   * their package directory
   * @param workspaceDir
   * @param resolvePaths
   */
  getPackageNameToDir(workspaceDir: string, resolvePaths?: boolean): Map<string, string>;

  /**
   * When given a dir, walks up the tree until it finds a yarn workspace.
   * @param dir
   */
  findWorkspaceDir(dir: string): string | undefined;
}

export interface MkdirOptions {
  recursive?: boolean;
}
