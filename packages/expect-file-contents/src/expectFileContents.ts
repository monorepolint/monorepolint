/*!
 * Copyright (c) 2018 monorepo-lint (http://monorepo-lint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepo-lint/core";
import * as fs from "fs";
import diff from "jest-diff";
import * as path from "path";

interface BaseOpts {
  file: string;
  generator: (context: Context) => string;
  template: string;
  templateFile: string;
}

type Limit<T, Q extends keyof T> = {
  [P in keyof T]: P extends Q ? T[P] : undefined
};

export type Opts =
  | Limit<BaseOpts, "file" | "generator">
  | Limit<BaseOpts, "file" | "template">
  | Limit<BaseOpts, "file" | "templateFile">;

export default function expectFileContents(context: Context, opts: Opts) {
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
}

function getGenerator(context: Context, opts: Opts) {
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
