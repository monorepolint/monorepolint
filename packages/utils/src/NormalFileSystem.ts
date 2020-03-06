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

export class NormalFileSystem extends AbstractFileSystem implements FileSystem {
  public readJson(path: string): unknown {
    const contents = nodeFs.readFileSync(path, "utf-8");
    return JSON.parse(contents);
  }

  public writeJson(path: string, obj: unknown): void {
    return nodeFs.writeFileSync(path, JSON.stringify(obj, undefined, 2) + "\n");
  }

  public readFile(path: string, options?: { encoding?: null; flag?: string } | undefined): Buffer;
  public readFile(path: string, options: { encoding: string; flag?: string }): string;
  public readFile(path: string, options?: { encoding?: string | null; flag?: string }): Buffer | string {
    return nodeFs.readFileSync(path, options);
  }

  public writeFile(
    path: string,
    data: any,
    options?: { encoding?: string | null; mode?: string | number; flag?: string }
  ): void {
    return nodeFs.writeFileSync(path, data, options);
  }

  public exists(path: string): boolean {
    return nodeFs.existsSync(path);
  }

  public unlink(path: string): void {
    return nodeFs.unlinkSync(path);
  }

  public flush(): Promise<unknown> {
    // no op in immediate
    return Promise.resolve();
  }

  public mkdir(directoryPath: string, options?: MkdirOptions) {
    if (options && options.recursive) {
      // node < 10 doesn't support mkdirSync w/ recursive: true
      // so we manually do it instead
      const dirSegments = directoryPath.split(nodePath.sep);
      for (let i = 0; i < dirSegments.length; i++) {
        if (dirSegments[i].length > 0) {
          // we skip the empty segment
          const curDirPath = dirSegments.slice(0, i + 1).join(nodePath.sep);
          if (!this.exists(curDirPath)) {
            nodeFs.mkdirSync(curDirPath);
          }
        }
      }
    }
  }
}
