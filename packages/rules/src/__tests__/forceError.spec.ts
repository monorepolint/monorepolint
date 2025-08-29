/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepolint/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { forceError } from "../forceError.js";
import { AddErrorSpy, createTestingWorkspace, HOST_FACTORIES, TestingWorkspace } from "./utils.js";

describe.each(HOST_FACTORIES)("forceError ($name)", (hostFactory) => {
  let workspace: TestingWorkspace;
  let spy: AddErrorSpy;
  let context: Context;

  beforeEach(async () => {
    workspace = await createTestingWorkspace({
      fixFlag: false,
      host: hostFactory.make(),
    });
    context = workspace.context;
    spy = vi.spyOn(workspace.context, "addError");
  });

  it("always adds a default error", () => {
    forceError({}).check(context);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      message: "Forced error (often used to debug package selection)",
      file: context.getPackageJsonPath(),
    });
  });

  it("adds a custom error message when provided", () => {
    forceError({ options: { customMessage: "Custom test message" } }).check(context);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      message: "Custom test message",
      file: context.getPackageJsonPath(),
    });
  });

  describe("Options Validation", () => {
    it("should accept valid options", () => {
      const ruleModule = forceError({ options: undefined });
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions(null)).not.toThrow();
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions(undefined)).not.toThrow();
      expect(() => ruleModule.validateOptions({})).not.toThrow();
      expect(() => ruleModule.validateOptions({ customMessage: "test message" })).not.toThrow();
    });

    it("should reject invalid options", () => {
      const ruleModule = forceError({ options: undefined });
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({ customMessage: 123 })).toThrow();
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({ customMessage: "test", extra: "field" })).toThrow();
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions("string")).toThrow();
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions([])).not.toThrow(); // Arrays pass typeof object check
    });
  });
});
