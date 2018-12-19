/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepolint/core";
import { RuleModule } from "@monorepolint/core";
import * as fs from "fs";
import diff from "jest-diff";
import * as path from "path";
import * as r from "runtypes";

const Options = r.Union(
  r.Record({
    file: r.String,
    generator: r.Function,
    template: r.Undefined,
    templateFile: r.Undefined
  }),

  r.Record({
    file: r.String,
    generator: r.Undefined,
    template: r.String,
    templateFile: r.Undefined
  }),

  r.Record({
    file: r.String,
    generator: r.Undefined,
    template: r.Undefined,
    templateFile: r.String
  })
);

export type Options = r.Static<typeof Options>;

export default {
  check: function expectFileContents(context: Context, opts: Options) {
    const fullPath = path.join(context.packageDir, opts.file);
    const generator = getGenerator(context, opts);
    const expectedContent = generator(context);

    const actualContent = fs.existsSync(fullPath)
      ? fs.readFileSync(fullPath, "utf-8")
      : undefined;

    if (actualContent !== expectedContent) {
      context.addError({
        file: fullPath,
        message: "Expect file contents to match",
        longMessage: diff(expectedContent, actualContent, { expand: true }),
        fixer: () => {
          if (expectedContent === undefined) {
            fs.unlinkSync(fullPath);
          } else {
            fs.writeFileSync(fullPath, expectedContent);
          }
        }
      });
    }
  },
  optionsRuntype: Options
} as RuleModule<typeof Options>;

function getGenerator(context: Context, opts: Options) {
  if (opts.generator) {
    return opts.generator;
  } else if (opts.templateFile) {
    const { packageDir: workspacePackageDir } = context.getWorkspaceContext();
    const fullPath = path.resolve(workspacePackageDir, opts.templateFile);
    const template = fs.readFileSync(fullPath, "utf-8");

    return makeGenerator(template);
  } else if (opts.template) {
    return makeGenerator(opts.template);
  } else {
    throw new Error("Unable to make generator");
  }
}

function makeGenerator(template: string) {
  // tslint:disable-next-line:variable-name
  return function generator(_context: Context) {
    return template;
  };
}
