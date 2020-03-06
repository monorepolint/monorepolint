/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as nodeFs from "fs"; // tslint:disable-line:import-blacklist
import { AbstractFileSystem } from "./AbstractFileSystem";
import { FileSystem, MkdirOptions } from "./FileSystem";
import { NormalFileSystem } from "./NormalFileSystem";

export class CachedFileSystem extends AbstractFileSystem implements FileSystem {
  private existsCache = new Map<string, boolean>();
  private toDelete = new Set<string>();
  private toWrite = new Set<string>();
  private contentsCache = new Map<string, string | Buffer | Error>();
  private jsonContentsCache = new Map<string, unknown>();
  private directoriesToCreate = new Map<string, { recursive?: boolean } | undefined>();

  public readJson(path: string): unknown {
    if (!this.jsonContentsCache.has(path)) {
      this.jsonContentsCache.set(path, JSON.parse(this.readFile(path, { encoding: "utf-8" })));
    }

    return this.jsonContentsCache.get(path);
  }

  public writeJson(path: string, obj: unknown): void {
    this.writeFile(path, JSON.stringify(obj, undefined, 2) + "\n");
    this.jsonContentsCache.set(path, obj); // Must happen after writeFile as writeFile clears this
  }

  public readFile(path: string, options?: { encoding?: null; flag?: string } | undefined): Buffer;
  public readFile(path: string, options: { encoding: string; flag?: string }): string;
  public readFile(path: string, options?: { encoding?: string | null; flag?: string }): Buffer | string {
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
    this.toWrite.add(path);
    this.existsCache.set(path, true);
    this.toDelete.delete(path);
    this.contentsCache.set(path, data);
    this.jsonContentsCache.delete(path);
  }

  public exists(path: string): boolean {
    if (!this.existsCache.has(path)) {
      this.existsCache.set(path, nodeFs.existsSync(path));
    }
    return this.existsCache.get(path)!; // bang since we know it has it
  }

  public unlink(path: string): void {
    this.toDelete.add(path);
    this.contentsCache.delete(path);
    this.jsonContentsCache.delete(path);
  }

  public flush() {
    const fs = new NormalFileSystem();
    for (const filePath of this.toDelete) {
      fs.unlink(filePath);
    }

    for (const [filePath, options] of this.directoriesToCreate) {
      fs.mkdir(filePath, options);
    }

    for (const filePath of this.toWrite) {
      fs.writeFile(filePath, this.contentsCache.get(filePath));
    }
  }

  public mkdir(filePath: string, options?: MkdirOptions): void {
    if (!this.directoriesToCreate.has(filePath)) {
      this.directoriesToCreate.set(filePath, options);
      return;
    }

    const existingResult = this.directoriesToCreate.get(filePath);

    if (options === undefined) {
      // then we either want whats in the map already or its equiv.
      // NO OP
    } else if (existingResult && existingResult.recursive) {
      // Already maxed out.
    } else {
      this.directoriesToCreate.set(filePath, options);
    }
  }
}
