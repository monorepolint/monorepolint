/*!
 * Copyright 2022 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as realFs from "fs";

import { Host } from "./Host";

export class SimpleHost implements Host {
  constructor(private fs: typeof realFs = realFs) {}
  mkdir(directoryPath: string, opts?: { recursive: boolean }): void {
    this.fs.mkdirSync(directoryPath, { recursive: opts?.recursive ?? false });
    throw new Error("Method not implemented.");
  }
  rmdir(directoryPath: string): void {
    this.fs.rmdirSync(directoryPath);
    throw new Error("Method not implemented.");
  }

  exists(path: string): boolean {
    return this.fs.existsSync(path);
  }

  writeFile(path: string, buffer: Buffer): void;
  writeFile(path: string, body: string, opts: { encoding: BufferEncoding }): void;
  writeFile(path: any, body: any, opts?: { encoding: BufferEncoding }): any {
    if (opts) {
      this.fs.writeFileSync(path, body, { encoding: opts.encoding });
    } else {
      this.fs.writeFileSync(path, body);
    }
  }
  readFile(path: string, opts?: undefined): Buffer;
  readFile(path: string, opts: { encoding: BufferEncoding }): string;
  readFile(path: string, opts: { asJson: true }): object;
  readFile(path: any, opts?: { encoding?: BufferEncoding; asJson?: boolean }): string | object | Buffer {
    if (opts?.asJson) {
      return JSON.parse(this.fs.readFileSync(path, "utf-8"));
    }
    return this.fs.readFileSync(path, opts?.encoding);
  }
  deleteFile(path: string) {
    this.fs.unlinkSync(path);
  }
  readJson(filename: string) {
    const contents = this.fs.readFileSync(filename, "utf-8");
    return JSON.parse(contents);
  }
  writeJson(path: string, o: object): void {
    return this.fs.writeFileSync(path, JSON.stringify(o, undefined, 2) + "\n");
  }
  flush() {
    // noop in the simple case
    return Promise.resolve();
  }
}
