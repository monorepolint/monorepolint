import * as path from "path";
import { Context } from "./Context";
import { findWorkspaceDir } from "@monorepo-lint/utils";
import { MonorepoLintConfig } from "./MonorepoLintConfig";
import { WorkspaceContext } from "./WorkspaceContext";

export interface Checker {
  (context: Context, args: any): void;
}

export function check(opts: MonorepoLintConfig, cwd = process.cwd()): boolean {
  const workspaceDir = findWorkspaceDir(cwd);
  if (workspaceDir === undefined) {
    throw new Error(`Unable to find a workspace from ${cwd}`);
  }

  const workspaceContext = new WorkspaceContext(workspaceDir, opts);

  if (workspaceDir === cwd) {
    for (const packageDir of workspaceContext.getWorkspacePackageDirs()) {
      checkPackage(opts, workspaceContext.createChildContext(packageDir));
    }
    checkPackage(opts, workspaceContext);
  } else {
    checkPackage(opts, workspaceContext.createChildContext(cwd));
  }

  return !workspaceContext.failed;
}

function checkPackage(opts: MonorepoLintConfig, context: Context) {
  const workspaceContext = getWorkspaceContext(context);

  for (const check of opts.checks) {
    const checker = resolveChecker(check.type, workspaceContext);
    checker(context, check.args);
  }
  context.finish();
}

function getWorkspaceContext(context: Context) {
  while (context.parent !== undefined) {
    context = context.parent;
  }
  return context as WorkspaceContext;
}

function resolveChecker(type: string, context: WorkspaceContext) {
  const q = type.startsWith(".")
    ? path.resolve(context.packageDir, type)
    : type;
  return require(q).default;
}
