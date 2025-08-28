/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepolint/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { oncePerPackage } from "../oncePerPackage.js";
import { AddErrorSpy, createTestingWorkspace, HOST_FACTORIES, TestingWorkspace } from "./utils.js";

describe.each(HOST_FACTORIES)("oncePerPackage ($name)", (hostFactory) => {
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

  it("allows first visit to a package", () => {
    const uniqueKey = `test-key-${Math.random()}`;
    oncePerPackage({ options: { singletonKey: uniqueKey } }).check(context);

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it("prevents second visit to the same package with same key", () => {
    const uniqueKey = `test-key-${Math.random()}`;
    const rule = oncePerPackage({ options: { singletonKey: uniqueKey } });

    // First visit - should be fine
    rule.check(context);
    expect(spy).toHaveBeenCalledTimes(0);

    // Second visit - should error
    rule.check(context);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      message: `This package has already been visited for this key: ${uniqueKey}`,
      file: context.getPackageJsonPath(),
    });
  });

  describe("Options Validation", () => {
    it("should accept valid options", () => {
      const ruleModule = oncePerPackage({ options: { singletonKey: "unique-key" } });

      expect(() => ruleModule.validateOptions({ singletonKey: "unique-key" })).not.toThrow();
      expect(() =>
        ruleModule.validateOptions({
          singletonKey: Symbol("unique"),
          customMessage: "Custom error message",
        })
      ).not.toThrow();
    });

    it("should reject invalid options", () => {
      const ruleModule = oncePerPackage({ options: { singletonKey: "unique-key" } });

      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({})).toThrow();
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({ singletonKey: 123 })).toThrow();
      // @ts-expect-error testing invalid input
      expect(() => ruleModule.validateOptions({ customMessage: "test" })).toThrow();
    });
  });
});
