/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepolint/core";
import { RuleModule } from "@monorepolint/core";
import diff from "jest-diff";
import * as path from "path";
import * as r from "runtypes";

const Options = r.Union(
  r.Record({
    file: r.String,
    generator: r.Function,
    template: r.Undefined.optional(),
    templateFile: r.Undefined.optional(),
  }),

  r.Record({
    file: r.String,
    generator: r.Undefined.optional(),
    template: r.String,
    templateFile: r.Undefined.optional(),
  }),

  r.Record({
    file: r.String,
    generator: r.Undefined.optional(),
    template: r.Undefined.optional(),
    templateFile: r.String,
  })
);

type Options = r.Static<typeof Options>;

export const fileContents = {
  check: function expectFileContents(context: Context, opts: Options) {
    const fullPath = path.join(context.packageDir, opts.file);
    const expectedContent = getExpectedContents(context, opts);

    const pathExists = context.host.exists(fullPath);
    const actualContent = pathExists ? context.host.readFile(fullPath, { encoding: "utf-8" }) : undefined;
    if (actualContent !== expectedContent) {
      context.addError({
        file: fullPath,
        message: "Expect file contents to match",
        longMessage: diff(expectedContent, actualContent, { expand: true }),
        fixer: () => {
          if (expectedContent === undefined) {
            if (pathExists) context.host.deleteFile(fullPath);
          } else {
            context.host.mkdir(path.dirname(fullPath), { recursive: true });
            context.host.writeFile(fullPath, expectedContent, { encoding: "utf-8" });
          }
        },
      });
    }
  },
  optionsRuntype: Options,
} as RuleModule<typeof Options>;

const optionsCache = new Map<Options, ((context: Context) => string | undefined) | string | undefined>();

function getExpectedContents(context: Context, opts: Options) {
  // we need to use has because undefined is a valid value in the cache
  if (optionsCache.has(opts)) {
    const cachedEntry = optionsCache.get(opts);
    if (cachedEntry && typeof cachedEntry === "function") {
      return cachedEntry(context);
    }
    return cachedEntry;
  }

  if (opts.generator) {
    optionsCache.set(opts, opts.generator);
    return opts.generator(context) as string | undefined; // we have no guarentee its the right kind of function
  } else if (opts.templateFile) {
    const { packageDir: workspacePackageDir } = context.getWorkspaceContext();
    const fullPath = path.resolve(workspacePackageDir, opts.templateFile);
    const template = context.host.readFile(fullPath, { encoding: "utf-8" });

    optionsCache.set(opts, template);
    return template;
  } else {
    optionsCache.set(opts, opts.template);
    return opts.template;
  }
}
