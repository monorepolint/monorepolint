/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { AddErrorOptions, WorkspaceContext } from "@monorepolint/config";
import { WorkspaceContextImpl } from "@monorepolint/core";
import { CachingHost, Host, SimpleHost } from "@monorepolint/utils";
import { expect, jest } from "@jest/globals";
import * as path from "node:path";
import * as tmp from "tmp";

export function jsonToString(obj: {}) {
  return JSON.stringify(obj, undefined, 2) + "\n";
}

interface TestingWorkspaceOpts {
  host: Host;
  rootProjectName?: string;
  fixFlag: boolean;
}

export async function createTestingWorkspace(inboundOpts: TestingWorkspaceOpts) {
  tmp.setGracefulCleanup();
  const tmpdir = tmp.dirSync();
  const opts = {
    ...inboundOpts,
    rootProjectName: inboundOpts.rootProjectName ?? "rootProject",
  };
  const rootPath = tmpdir.name;
  opts.host.mkdir(rootPath, { recursive: true });

  opts.host.writeJson(path.join(rootPath, "package.json"), {
    name: opts.rootProjectName,
    workspaces: {
      packages: ["packages/*"],
    },
  });

  await opts.host.flush();

  return new DefaultTestingWorkspace(
    { ...opts, rootPath },
    new WorkspaceContextImpl(rootPath, { fix: opts.fixFlag, rules: [] }, opts.host)
  );
}

interface RealTestingWorkspaceOpts extends Required<TestingWorkspaceOpts> {
  rootPath: string;
}

export interface TestingWorkspace {
  /**
   * Adds a utf8 file to `packageName` with `relativePath` to the package directory.
   *
   * @param packageName The child package to add to or undefined for root package
   * @param filePath The path of the file to be written. Will be prepended with package dir
   * @param contents the contents to be written (as utf8)
   */
  writeFile(filePath: string, contents: string): void;

  writeJsonFile(filePath: string, json: object): void;
  addProject(name: string, fields: object): void;
  getFilePath(filePath: string): string;
  readFile(filePath: string): string;

  /**
   * Helper method for matching failures via jest `expect().toMatchObject
   *
   */
  failureMatcher(opts: { file: string; message: string; hasFixer: boolean }): any;

  readonly context: WorkspaceContext;
}

class DefaultTestingWorkspace implements TestingWorkspace {
  constructor(private opts: RealTestingWorkspaceOpts, public readonly context: WorkspaceContext) {}

  addProject(name: string, fields: object) {
    this.writeJsonFile(path.join("packages", name, "package.json"), {
      name,
      ...fields,
    });
  }

  writeJsonFile(filePath: string, json: object) {
    this.writeFile(filePath, JSON.stringify(json, undefined, 2));
  }

  /**
   * Adds a utf8 file to `packageName` with `relativePath` to the package directory.
   *
   * @param packageName The child package to add to or undefined for root package
   * @param filePath The path of the file to be written. Will be prepended with package dir
   * @param contents the contents to be written (as utf8)
   */
  writeFile(filePath: string, contents: string) {
    const fullFilePath = this.getFilePath(filePath);
    this.opts.host.mkdir(path.dirname(fullFilePath), { recursive: true });
    this.opts.host.writeFile(fullFilePath, contents, { encoding: "utf-8" });
  }

  getFilePath(filePath: string) {
    return path.join(this.opts.rootPath, filePath);
  }

  readFile(filePath: string) {
    return this.opts.host.readFile(this.getFilePath(filePath), { encoding: "utf-8" });
  }

  failureMatcher(opts: { file: string; message: string; hasFixer: boolean }) {
    return {
      file: this.getFilePath(opts.file),
      message: opts.message,
      ...(opts.hasFixer ? { fixer: expect.any(Function) } : {}),
    };
  }
}

export type AddErrorSpy = jest.SpiedFunction<(options: AddErrorOptions) => void>;

export const HOST_FACTORIES: Array<{ name: string; make: () => Host }> = [
  { name: "SimpleHost", make: () => new SimpleHost() },
  { name: "CachingHost", make: () => new CachingHost() },
];
