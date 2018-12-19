/*!
 * Copyright (c) 2018 monorepo-lint (http://monorepo-lint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { findWorkspaceDir } from "@monorepo-lint/utils";
import * as path from "path";
import { Context } from "./Context";
import { MonorepoLintConfig } from "./MonorepoLintConfig";
import { WorkspaceContext } from "./WorkspaceContext";

export type Checker = (context: Context, args: any) => void;

export function check(opts: MonorepoLintConfig, cwd = process.cwd()): boolean {
  const workspaceDir = findWorkspaceDir(cwd);
  if (workspaceDir === undefined) {
    throw new Error(`Unable to find a workspace from ${cwd}`);
  }

  const workspaceContext = new WorkspaceContext(workspaceDir, opts);

  if (workspaceDir === cwd) {
    checkPackage(opts, workspaceContext);
    for (const packageDir of workspaceContext.getWorkspacePackageDirs()) {
      checkPackage(opts, workspaceContext.createChildContext(packageDir));
    }
  } else {
    checkPackage(opts, workspaceContext.createChildContext(cwd));
  }

  return !workspaceContext.failed;
}

function checkPackage(opts: MonorepoLintConfig, context: Context) {
  const workspaceContext = context.getWorkspaceContext();

  for (const c of opts.checks) {
    if (c.exclude && c.exclude.indexOf(context.getName()) !== -1) {
      continue;
    }
    const checker = resolveChecker(c.type, workspaceContext);
    checker(context, c.args);
  }
  context.finish();
}

function resolveChecker(type: string, context: WorkspaceContext) {
  const q = type.startsWith(".")
    ? path.resolve(context.packageDir, type)
    : type;
  return require(q).default;
}
