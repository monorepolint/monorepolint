/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/config";
import { matchesAnyGlob } from "@monorepolint/utils";
import { diff } from "jest-diff";
import { createNewRuleConversion } from "./util/createNewRuleConversion.js";
import * as path from "path";
import * as r from "runtypes";

const DEFAULT_TSCONFIG_FILENAME = "tsconfig.json";

const Options = r
  .Partial({
    file: r.String,
    generator: r.Function,
    tsconfigReferenceFile: r.String,
    template: r.Record({}).Or(r.String),
    templateFile: r.String,
    excludedReferences: r.Array(r.String).Or(r.Undefined),
    additionalReferences: r.Array(r.String).Or(r.Undefined),
  })
  .withConstraint(({ generator, template, templateFile }) => {
    let count = 0;
    if (generator) {
      count++;
    }
    if (template) {
      count++;
    }
    if (templateFile) {
      count++;
    }

    return count === 1 || "Expect one of { generator, template, templateFile }";
  });

export interface Options extends r.Static<typeof Options> {}

export const standardTsconfig = {
  check: async function expectStandardTsconfig(context: Context, opts: Options) {
    const tsconfigFileName = opts.file ?? DEFAULT_TSCONFIG_FILENAME;
    const fullPath = path.resolve(context.packageDir, tsconfigFileName);
    const generator = getGenerator(context, opts);
    const expectedContent = await generator(context);

    const actualContent = context.host.exists(fullPath)
      ? context.host.readFile(fullPath, { encoding: "utf-8" })
      : undefined;

    if (expectedContent === undefined) {
      context.addWarning({
        file: fullPath,
        message: "Excluding from expect-standard-tsconfig",
      });
      return;
    }

    if (actualContent !== expectedContent) {
      context.addError({
        file: fullPath,
        message: "Expect file contents to match",
        longMessage: diff(expectedContent, actualContent, { expand: true }),
        fixer: () => {
          context.host.writeFile(fullPath, expectedContent, {
            encoding: "utf-8",
          });
        },
      });
    }
  },
  optionsRuntype: Options,
} as RuleModule<typeof Options>;

export const StandardTsConfig = createNewRuleConversion("StandardTsconfig", standardTsconfig);

function getGenerator(context: Context, opts: Options) {
  if (opts.generator) {
    return opts.generator;
  } else if (opts.templateFile) {
    const { packageDir: workspacePackageDir } = context.getWorkspaceContext();
    const fullPath = path.resolve(workspacePackageDir, opts.templateFile);
    const template = JSON.parse(context.host.readFile(fullPath, { encoding: "utf-8" }));

    return makeGenerator(template, opts.excludedReferences, opts.additionalReferences, opts.tsconfigReferenceFile);
  } else if (opts.template) {
    return makeGenerator(opts.template, opts.excludedReferences, opts.additionalReferences, opts.tsconfigReferenceFile);
  } else {
    throw new Error("Unable to make generator");
  }
}

function makeGenerator(
  template: any,
  excludedReferences: ReadonlyArray<string> | undefined,
  additionalReferences: ReadonlyArray<string> | undefined,
  tsconfigReferenceFile?: string
) {
  return async function generator(context: Context) {
    template = {
      ...template,
      references: [],
    }; // make a copy and ensure we have a references array

    const nameToDirectory = await context.getWorkspaceContext().getPackageNameToDir();

    const packageJson = context.getPackageJson();
    const deps = [...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.devDependencies || {})];

    for (const dep of deps) {
      const packageDir = nameToDirectory.get(dep);
      if (packageDir !== undefined && (excludedReferences === undefined || matchesAnyGlob(dep, excludedReferences))) {
        const absoluteReferencePath =
          tsconfigReferenceFile !== undefined ? path.join(packageDir, tsconfigReferenceFile) : packageDir;
        template.references.push({
          path: path.relative(context.packageDir, absoluteReferencePath),
        });
      }
    }

    if (additionalReferences) {
      for (const additionalReference of additionalReferences) {
        template.references.push({
          path: additionalReference,
        });
      }
    }

    return JSON.stringify(template, undefined, 2) + "\n";
  };
}
