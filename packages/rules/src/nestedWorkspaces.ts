/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as globby from "globby";
import * as path from "node:path";
import { z } from "zod";
import { createRuleFactory } from "./util/createRuleFactory.js";

export const Options = z.undefined();

type Options = z.infer<typeof Options>;

// Enforce that the root package.json contains all of the workspaces in the repo (including nested packages)
export const nestedWorkspaces = createRuleFactory({
  name: "nestedWorkspaces",
  check: (context) => {
    const rootPackageJson = context.getWorkspaceContext().getPackageJson();

    // Expand a set of globs covering all package.json files in the entire repo (except the root)
    const packageJsonPaths = globby.globbySync([
      "*/**/package.json",
      "!**/node_modules/**",
    ]);

    const workspaces = Array.isArray(rootPackageJson.workspaces)
      ? rootPackageJson.workspaces
      : rootPackageJson.workspaces !== undefined
      ? rootPackageJson.workspaces.packages
      : undefined;

    if (workspaces === undefined && packageJsonPaths.length > 0) {
      context.addError({
        file: context.getPackageJsonPath(),
        message:
          "The \"workspace\" field is missing, even though there are workspaces in the repository.",
      });
      return;
    }

    // Build a set of globs for each package.json that exists in packages specified by a workspace.
    const workspacePackageJsons = (workspaces || []).map((item) => `${item}/package.json`);

    // Expand the globs to get an array of all package.json files that are in packages specified by a workspace.
    const expandedWorkspacesGlobs = globby.globbySync([
      ...workspacePackageJsons,
      "!**/node_modules/**",
    ]);

    // Ensure there are no package.jsons which are not included in the globbed workspaces set
    const difference = packageJsonPaths.filter((packageJsonPath) =>
      !expandedWorkspacesGlobs.includes(packageJsonPath)
    );

    if (difference.length !== 0) {
      const differencesList = difference.map((packageJsonPath) => path.dirname(packageJsonPath))
        .join(", ");
      context.addError({
        file: context.getPackageJsonPath(),
        message: `The "workspace" field is missing one or more values: ${differencesList}. `
          + "You may be able to use a glob to avoid listing each workspace individually, e.g. \"packages/nested-workspace/*\".",
      });
    }
  },
  validateOptions: Options.parse,
});
