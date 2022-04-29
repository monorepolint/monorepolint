/*!
 * Copyright 2022 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

export interface Host {
  /**
   * Reads and parses a json file.
   */
  readJson(filename: string): any;

  /**
   * Writes a json file.
   * @param path path to write
   * @param o object to write
   */
  writeJson(path: string, o: object): void;

  writeFile(path: string, buffer: Buffer): void;
  writeFile(path: string, body: string, opts: { encoding: BufferEncoding }): void;

  readFile(path: string, opts?: undefined): Buffer;
  readFile(path: string, opts: { encoding: BufferEncoding }): string;
  readFile(path: string, opts: { asJson: true }): object;

  exists(path: string): boolean;
  mkdir(directoryPath: string, opts?: { recursive: boolean }): void;
  rmdir(directoryPath: string): void;

  deleteFile(path: string): void;
  flush(): Promise<unknown>;
}
