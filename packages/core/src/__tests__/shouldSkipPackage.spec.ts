/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { vi, describe, expect, it } from "vitest";
import { SimpleHost } from "@monorepolint/utils";
import { shouldSkipPackage } from "../check.js";
import { ResolvedConfig } from "@monorepolint/config";
import { WorkspaceContextImpl } from "../WorkspaceContext.js";

describe("shouldSkipPackage", () => {
  const resolvedConfig: ResolvedConfig = {
    rules: [],
    verbose: false,
    fix: false,
  };
  const workspaceContext = new WorkspaceContextImpl(".", resolvedConfig, new SimpleHost());
  vi.spyOn(workspaceContext, "getName").mockImplementation(() => "root");

  const fooContext = createChild(workspaceContext, "packages/foo", "@foo/bar");

  it("should skip if specified in excludePackages no matter what", () => {
    const actual = shouldSkipPackage(fooContext, {
      check: () => true,
      ruleEntry: {
        excludePackages: [fooContext.getName(), "other"],
        includePackages: [fooContext.getName()],
      },
      validateOptions: () => {},
      name: "idk",
      id: "idc",
    });

    expect(actual).toEqual(true);
  });

  it("should skip if includes is specified but package is not", () => {
    const actual = shouldSkipPackage(fooContext, {
      check: () => true,
      ruleEntry: {
        includePackages: [],
      },
      validateOptions: () => {},
      name: "idk",
      id: "idc",
    });

    expect(actual).toEqual(true);
  });

  it("should not skip if excludes and includes are omitted", () => {
    const actual = shouldSkipPackage(fooContext, {
      check: () => true,
      ruleEntry: {},
      validateOptions: () => {},
      name: "idk",
      id: "idc",
    });

    expect(actual).toEqual(false);
  });

  it("should skip root by default", () => {
    const actual = shouldSkipPackage(workspaceContext, {
      check: () => true,
      ruleEntry: {},
      validateOptions: () => {},
      name: "idk",
      id: "idc",
    });

    expect(actual).toEqual(true);
  });

  it("should skip properly with globs", () => {
    const actual = shouldSkipPackage(workspaceContext, {
      check: () => true,
      ruleEntry: {
        excludePackages: ["@foo/*", "other"],
      },
      validateOptions: () => {},
      name: "idk",
      id: "idc",
    });

    expect(actual).toEqual(true);
  });

  it("should properly not skip with globs", () => {
    const actual = shouldSkipPackage(workspaceContext, {
      check: () => true,
      ruleEntry: {
        excludePackages: ["@foo/*", "other"],
      },
      validateOptions: () => {},
      name: "idk",
      id: "idc",
    });

    expect(actual).toEqual(true);
  });
});

function createChild(c: WorkspaceContextImpl, path: string, name: string) {
  const ret = c.createChildContext(path);
  vi.spyOn(ret, "getName").mockImplementation(() => name);
  return ret;
}
