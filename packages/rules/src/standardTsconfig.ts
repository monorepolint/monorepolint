/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepolint/config";
import { matchesAnyGlob } from "@monorepolint/utils";
import { diff } from "jest-diff";
import * as path from "path";
import { z } from "zod";
import { createRuleFactory } from "./util/createRuleFactory.js";

const DEFAULT_TSCONFIG_FILENAME = "tsconfig.json";

const Options = z.object({
  file: z.string().optional(),
  generator: z.custom<(context: Context) => Promise<string> | string>().optional(),
  tsconfigReferenceFile: z.string().optional(),
  template: z.record(z.string(), z.unknown()).optional(),
  templateFile: z.string().optional(),
  excludedReferences: z.array(z.string()).optional(),
  additionalReferences: z.array(z.string()).optional(),
}).partial().refine(({ generator, template, templateFile }) => {
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

  return count === 1;
}, {
  message: "Expect one of { generator, template, templateFile }",
});

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Options extends z.infer<typeof Options> {}

export const standardTsconfig = createRuleFactory<Options>({
  name: "standardTsconfig",
  check: async (context, opts) => {
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
  validateOptions: Options.parse,
});

function getGenerator(context: Context, opts: Options) {
  if (opts.generator) {
    return opts.generator;
  } else if (opts.templateFile) {
    const { packageDir: workspacePackageDir } = context.getWorkspaceContext();
    const fullPath = path.resolve(workspacePackageDir, opts.templateFile);
    const template = JSON.parse(
      context.host.readFile(fullPath, { encoding: "utf-8" }),
    );

    return makeGenerator(
      template,
      opts.excludedReferences,
      opts.additionalReferences,
      opts.tsconfigReferenceFile,
    );
  } else if (opts.template) {
    return makeGenerator(
      opts.template,
      opts.excludedReferences,
      opts.additionalReferences,
      opts.tsconfigReferenceFile,
    );
  } else {
    throw new Error("Unable to make generator");
  }
}

function makeGenerator(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: any,
  excludedReferences: ReadonlyArray<string> | undefined,
  additionalReferences: ReadonlyArray<string> | undefined,
  tsconfigReferenceFile?: string,
) {
  return async function generator(context: Context) {
    template = {
      ...template,
      references: [],
    }; // make a copy and ensure we have a references array

    const nameToDirectory = await context.getWorkspaceContext()
      .getPackageNameToDir();

    const packageJson = context.getPackageJson();
    const deps = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
    ];
    for (const dep of deps) {
      const packageDir = nameToDirectory.get(dep);
      if (
        packageDir !== undefined
        && (excludedReferences === undefined
          || !matchesAnyGlob(dep, excludedReferences))
      ) {
        const absoluteReferencePath = tsconfigReferenceFile !== undefined
          ? path.join(packageDir, tsconfigReferenceFile)
          : packageDir;
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
