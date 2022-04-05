/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { SimpleHost } from "@monorepolint/utils";
import { shouldSkipPackage } from "../check";
import { ResolvedConfig } from "../Config";
import { WorkspaceContext } from "../WorkspaceContext";

describe("shouldSkipPackage", () => {
  const resolvedConfig: ResolvedConfig = {
    rules: [],
    verbose: false,
    fix: false,
  };
  const workspaceContext = new WorkspaceContext(".", resolvedConfig, new SimpleHost());
  jest.spyOn(workspaceContext, "getName").mockImplementation(() => "root");

  const fooContext = createChild(workspaceContext, "packages/foo", "@foo/bar");

  it("should skip if specified in excludePackages no matter what", () => {
    const actual = shouldSkipPackage(fooContext, {
      check: () => true,
      excludePackages: [fooContext.getName(), "other"],
      includePackages: [fooContext.getName()],
      optionsRuntype: {} as any,
      name: "idk",
      id: "idc",
    });

    expect(actual).toEqual(true);
  });

  it("should skip if includes is specified but package is not", () => {
    const actual = shouldSkipPackage(fooContext, {
      check: () => true,
      includePackages: [],
      optionsRuntype: {} as any,
      name: "idk",
      id: "idc",
    });

    expect(actual).toEqual(true);
  });

  it("should not skip if excludes and includes are omitted", () => {
    const actual = shouldSkipPackage(fooContext, {
      check: () => true,
      optionsRuntype: {} as any,
      name: "idk",
      id: "idc",
    });

    expect(actual).toEqual(false);
  });

  it("should skip root by default", () => {
    const actual = shouldSkipPackage(workspaceContext, {
      check: () => true,
      optionsRuntype: {} as any,
      name: "idk",
      id: "idc",
    });

    expect(actual).toEqual(true);
  });

  it("should skip properly with globs", () => {
    const actual = shouldSkipPackage(workspaceContext, {
      check: () => true,
      excludePackages: ["@foo/*", "other"],
      optionsRuntype: {} as any,
      name: "idk",
      id: "idc",
    });

    expect(actual).toEqual(true);
  });

  it("should properly not skip with globs", () => {
    const actual = shouldSkipPackage(workspaceContext, {
      check: () => true,
      includePackages: ["@foo/*", "other"],
      optionsRuntype: {} as any,
      name: "idk",
      id: "idc",
    });

    expect(actual).toEqual(true);
  });
});

function createChild(c: WorkspaceContext, path: string, name: string) {
  const ret = c.createChildContext(path);
  jest.spyOn(ret, "getName").mockImplementation(() => name);
  return ret;
}
