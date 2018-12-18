/*!
 * Copyright (c) 2018 Eric L Anderson (http://monorepo-lint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context } from "@monorepo-lint/core";
import { PackageJson } from "@monorepo-lint/utils";
import * as fs from "fs";
import diff from "jest-diff";

export interface Opts {
  name: string;
  value: string;
}

export const MSG_NO_SCRIPTS_BLOCK = "No scripts block in package.json";

export default function expectPackageScript(context: Context, opts: Opts) {
  const packageJson = context.getPackageJson();
  if (packageJson.scripts === undefined) {
    context.addError({
      file: context.getPackageJsonPath(),
      message: MSG_NO_SCRIPTS_BLOCK,
      fixer: () => {
        mutateJson<PackageJson>(context.getPackageJsonPath(), input => {
          input.scripts = {};
          return input;
        });
      }
    });
    return;
  }

  if (packageJson.scripts[opts.name] !== opts.value) {
    context.addError({
      file: context.getPackageJsonPath(),
      message: `Expected standardized script entry for '${opts.name}'`,
      longMessage: diff(
        opts.value + "\n",
        (packageJson.scripts[opts.name] || "") + "\n"
      ),
      fixer: () => {
        mutateJson<PackageJson>(context.getPackageJsonPath(), input => {
          input.scripts![opts.name] = opts.value;
          return input;
        });
      }
    });
  }
}

function mutateJson<T>(path: string, mutator: ((f: T) => T)) {
  let file: T = JSON.parse(fs.readFileSync(path, "utf-8"));
  file = mutator(file);
  fs.writeFileSync(path, JSON.stringify(file, undefined, 2) + "\n");
}
