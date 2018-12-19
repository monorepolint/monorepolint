/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { findWorkspaceDir } from "@monorepolint/utils";
import minimatch from "minimatch";
import { ResolvedConfig, ResolvedRule } from "./Config";
import { Context } from "./Context";
import { WorkspaceContext } from "./WorkspaceContext";

export function check(
  resolvedConfig: ResolvedConfig,
  cwd = process.cwd()
): boolean {
  const workspaceDir = findWorkspaceDir(cwd);
  if (workspaceDir === undefined) {
    throw new Error(`Unable to find a workspace from ${cwd}`);
  }

  const workspaceContext = new WorkspaceContext(workspaceDir, resolvedConfig);

  if (workspaceDir === cwd) {
    checkPackage(workspaceContext);
    for (const packageDir of workspaceContext.getWorkspacePackageDirs()) {
      checkPackage(workspaceContext.createChildContext(packageDir));
    }
  } else {
    checkPackage(workspaceContext.createChildContext(cwd));
  }

  return !workspaceContext.failed;
}

function checkPackage(context: Context) {
  if (context.resolvedConfig.verbose) {
    // tslint:disable-next-line:no-console
    console.log(`Starting check against ${context.getName()}`);
  }
  for (const ruleConfig of context.resolvedConfig.rules) {
    if (shouldSkipPackage(context, ruleConfig)) {
      continue;
    }

    ruleConfig.optionsRuntype.check(ruleConfig.options);
    ruleConfig.check(context, ruleConfig.options);
  }
  context.finish();
}

/**
 *
 * @internal
 * @param context
 * @param ruleConfig
 */
export function shouldSkipPackage(context: Context, ruleConfig: ResolvedRule) {
  const exclude = (ruleConfig.excludePackages || []).some(a =>
    minimatch(context.getName(), a)
  );
  const include =
    ruleConfig.includePackages === undefined
      ? true
      : ruleConfig.includePackages.some(a => minimatch(context.getName(), a));

  if (
    context.getWorkspaceContext() === context &&
    !ruleConfig.includeWorkspaceRoot
  ) {
    return true;
  }

  if (exclude || !include) {
    return true;
  }

  return false;
}
