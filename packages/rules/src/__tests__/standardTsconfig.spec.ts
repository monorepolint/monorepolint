/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepolint/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { standardTsconfig } from "../standardTsconfig.js";
import { AddErrorSpy, createTestingWorkspace, HOST_FACTORIES, TestingWorkspace } from "./utils.js";

describe.each(HOST_FACTORIES)("standardTsconfig ($name)", (hostFactory) => {
  let workspace: TestingWorkspace;
  let spy: AddErrorSpy;
  let context: Context;

  beforeEach(async () => {
    workspace = await createTestingWorkspace({
      fixFlag: true,
      host: hostFactory.make(),
    });
    context = workspace.context;
    spy = vi.spyOn(workspace.context, "addError");
  });

  it("creates tsconfig.json when missing with template", async () => {
    const template = { compilerOptions: { strict: true } };

    await standardTsconfig({ options: { template } }).check(context);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(workspace.readFile("tsconfig.json")).toContain("\"strict\": true");
  });

  it("does nothing when tsconfig.json matches template", async () => {
    const template = { compilerOptions: { strict: true } };
    const expectedContent = JSON.stringify({ ...template, references: [] }, undefined, 2) + "\n";

    workspace.writeFile("tsconfig.json", expectedContent);

    await standardTsconfig({ options: { template } }).check(context);

    expect(spy).toHaveBeenCalledTimes(0);
  });

  describe("Options Validation", () => {
    it("should accept valid options", () => {
      const ruleModule1 = standardTsconfig({
        options: { template: { compilerOptions: { strict: true } } },
      });
      const ruleModule2 = standardTsconfig({ options: { templateFile: "tsconfig.template.json" } });
      const ruleModule3 = standardTsconfig({
        options: { generator: () => JSON.stringify({ compilerOptions: {} }) },
      });

      expect(() => ruleModule1.validateOptions({ template: { compilerOptions: { strict: true } } }))
        .not.toThrow();
      expect(() => ruleModule2.validateOptions({ templateFile: "tsconfig.template.json" })).not
        .toThrow();
      expect(() =>
        ruleModule3.validateOptions({
          generator: () => JSON.stringify({ compilerOptions: {} }),
          excludedReferences: ["@types/*"],
        })
      ).not.toThrow();
    });

    it("should reject invalid options", () => {
      const ruleModule = standardTsconfig({ options: { template: {} } });

      // Missing required source
      expect(() => ruleModule.validateOptions({})).toThrow();

      // Multiple sources (violates constraint)
      expect(() =>
        ruleModule.validateOptions({
          template: {},
          templateFile: "file.json",
        })
      ).toThrow();

      expect(() =>
        ruleModule.validateOptions({
          generator: () => "",
          template: {},
        })
      ).toThrow();
    });
  });
});
