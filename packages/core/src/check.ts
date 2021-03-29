/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { findWorkspaceDir } from "@monorepolint/utils";
import minimatch from "minimatch";
import { dirname as pathDirname, resolve as pathResolve } from "path";
import { ResolvedConfig, ResolvedRule } from "./Config";
import { Context } from "./Context";
import { WorkspaceContext } from "./WorkspaceContext";

export async function check(
  resolvedConfig: ResolvedConfig,
  cwd = process.cwd(),
  paths?: ReadonlyArray<string>
): Promise<boolean> {
  const workspaceDir = findWorkspaceDir(cwd);
  if (workspaceDir === undefined) {
    throw new Error(`Unable to find a workspace from ${cwd}`);
  }

  const workspaceContext = new WorkspaceContext(workspaceDir, resolvedConfig);

  if (paths !== undefined) {
    const resolvedPaths = paths.map((p) => pathDirname(pathResolve(p)));

    for (const path of resolvedPaths) {
      if (workspaceDir === path) {
        await checkPackage(workspaceContext);
      } else {
        await checkPackage(workspaceContext.createChildContext(path));
      }
    }
  } else if (workspaceDir === cwd) {
    await checkPackage(workspaceContext);

    for (const packageDir of workspaceContext.getWorkspacePackageDirs()) {
      await checkPackage(workspaceContext.createChildContext(packageDir));
    }
  } else {
    await checkPackage(workspaceContext.createChildContext(cwd));
  }

  return !workspaceContext.failed;
}

async function checkPackage(context: Context): Promise<void> {
  if (context.resolvedConfig.verbose) {
    // tslint:disable-next-line:no-console
    console.log(`Starting check against ${context.getName()}`);
  }
  for (const ruleConfig of context.resolvedConfig.rules) {
    if (shouldSkipPackage(context, ruleConfig)) {
      continue;
    }

    ruleConfig.optionsRuntype.check(ruleConfig.options);

    // Although check functions can be asynchronous, run them serially to
    // prevent overlapping CLI output.
    await ruleConfig.check(context, ruleConfig.options);
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
  const exclude = (ruleConfig.excludePackages || []).some((a) => minimatch(context.getName(), a));
  const include =
    ruleConfig.includePackages === undefined
      ? true
      : ruleConfig.includePackages.some((a) => minimatch(context.getName(), a));

  if (context.getWorkspaceContext() === context && !ruleConfig.includeWorkspaceRoot) {
    return true;
  }

  if (exclude || !include) {
    return true;
  }

  return false;
}
