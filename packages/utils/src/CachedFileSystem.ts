/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as nodeFs from "fs"; // tslint:disable-line:import-blacklist
import * as nodePath from "path";
import { AbstractFileSystem } from "./AbstractFileSystem";
import { FileSystem, MkdirOptions } from "./FileSystem";
import { findExistingRoot } from "./findExistingRoot";
import { getPathsAfterRoot } from "./getPathsAfterRoot";
import { NormalFileSystem } from "./NormalFileSystem";

export class CachedFileSystem extends AbstractFileSystem implements FileSystem {
  private existsCache = new Map<string, boolean>();
  private toDelete = new Set<string>();
  private toWrite = new Set<string>();
  private contentsCache = new Map<string, string | Buffer | Error>();
  private jsonContentsCache = new Map<string, unknown>();
  private directoriesToCreate = new Set<string>();

  public readJson(path: string): unknown {
    path = this.canonicalizePath(path);

    if (!this.jsonContentsCache.has(path)) {
      this.jsonContentsCache.set(path, JSON.parse(this.readFile(path, { encoding: "utf-8" })));
    }

    return this.jsonContentsCache.get(path);
  }

  public writeJson(path: string, obj: unknown): void {
    path = this.canonicalizePath(path);

    this.writeFile(path, JSON.stringify(obj, undefined, 2) + "\n");
    this.jsonContentsCache.set(path, obj); // Must happen after writeFile as writeFile clears this
  }

  public readFile(path: string, options?: { encoding?: null; flag?: string } | undefined): Buffer;
  public readFile(path: string, options: { encoding: string; flag?: string } | string): string;
  public readFile(path: string, options?: { encoding?: string | null; flag?: string } | string): Buffer | string {
    path = this.canonicalizePath(path);

    if (this.existsCache.get(path) === false) {
      throw new Error("File does not exist");
    }

    if (!this.contentsCache.has(path)) {
      try {
        this.contentsCache.set(path, nodeFs.readFileSync(path, options));
      } catch (e) {
        this.contentsCache.set(path, e);
      }
    }

    const ret = this.contentsCache.get(path)!; // bang because we know it exists
    if (ret instanceof Error) {
      throw ret;
    }
    return ret;
  }

  public writeFile(path: string, data: string | Buffer): void {
    path = this.canonicalizePath(path);
    const dir = nodePath.dirname(path);

    if (this.existsCache.get(path) === true || this.existsCache.get(dir) === true) {
      // we think this file or its directory already exists
    }

    this.toWrite.add(path);
    this.existsCache.set(path, true);
    this.toDelete.delete(path);
    this.contentsCache.set(path, data);

    /*
      Next statement avoids the problem where someone:

      fs.writeJson("./foo.json", { hello: "world" });
      fs.writeFile("./foo.json", "{}");
      const contents = fs.readJson("./foo.json");

      Without clearing the jsonContentsCache, `contents` would look like `{ hello: "world" }` instead of `{}` 
    */
    this.jsonContentsCache.delete(path);
  }

  public exists(path: string): boolean {
    path = this.canonicalizePath(path);

    if (!this.existsCache.has(path)) {
      this.existsCache.set(path, nodeFs.existsSync(path));
    }
    return this.existsCache.get(path)!; // bang since we know it has it
  }

  public unlink(path: string): void {
    path = this.canonicalizePath(path);

    this.toDelete.add(path);
    this.toWrite.delete(path);
    this.existsCache.set(path, false);
    this.contentsCache.delete(path);
    this.jsonContentsCache.delete(path);
  }

  public flush() {
    const fs = new NormalFileSystem();
    for (const filePath of this.toDelete) {
      fs.unlink(filePath);
    }

    for (const filePath of this.directoriesToCreate) {
      fs.mkdir(filePath);
    }

    for (const filePath of this.toWrite) {
      fs.writeFile(filePath, this.contentsCache.get(filePath));
    }
  }

  public mkdir(path: string, options?: MkdirOptions): void {
    path = this.canonicalizePath(path);

    if (options && options.recursive) {
      const root = findExistingRoot(path);
      for (const dir of getPathsAfterRoot(path, root)) {
        this.existsCache.set(dir, true);
        this.directoriesToCreate.add(dir);
      }
      return;
    }

    if (!this.exists(nodePath.dirname(path))) {
      throw new Error("Parent directory doesn't exist: " + nodePath.dirname(path));
    }
    this.existsCache.set(path, true);
    this.directoriesToCreate.add(path);
  }

  private canonicalizePath(path: string) {
    const resolvedPath = nodePath.resolve(process.cwd(), path);
    const dir = findExistingRoot(resolvedPath);
    const newDir = nodeFs.realpathSync(dir);
    return nodePath.join(newDir, resolvedPath.slice(dir.length));
  }
}
