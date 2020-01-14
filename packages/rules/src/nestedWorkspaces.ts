/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/core";
import globby from "globby";
import * as r from "runtypes";

export const Options = r.Undefined;

type Options = r.Static<typeof Options>;

// Custom monorepolint rule to enforce that the root package.json contains
// all of the workspaces in the repo (including nested packages)
export const nestedWorkspaces: RuleModule<typeof Options> = {
  check: async (context: Context) => {
    const rootPackageJson = context.getWorkspaceContext().getPackageJson();

    // Expand a set of globs covering all package.json files in the entire repo (except the root)
    const packageJsonPaths = await globby(["*/**/package.json", "!**/node_modules/**"]);

    const workspaces = Array.isArray(rootPackageJson.workspaces)
      ? rootPackageJson.workspaces
      : rootPackageJson.workspaces !== undefined
      ? rootPackageJson.workspaces.packages
      : undefined;

    if (workspaces === undefined && packageJsonPaths.length > 0) {
      context.addError({
        file: context.getPackageJsonPath(),
        message: 'The "workspace" field is missing, even though there are workspaces in the repository.',
      });
      return;
    }

    // Build a set of globs for each package.json that exists in packages specified by a workspace.
    const workspacePackageJsons = (workspaces || []).map(item => `${item}/package.json`);

    // Expand the globs to get an array of all package.json files that are in packages specified by a workspace.
    const expandedWorkspacesGlobs = await globby([...workspacePackageJsons, "!**/node_modules/**"]);

    // Check that sets are equal (we know the inverse is true already)
    const setsAreEqual = packageJsonPaths.every(packageJsonPath => expandedWorkspacesGlobs.includes(packageJsonPath));

    if (!setsAreEqual) {
      context.addError({
        file: context.getPackageJsonPath(),
        message:
          'The "workspace" field is missing one or more values. This is usually because there is an unlisted nested workspace.' +
          'Nested workspaces should be listed individually, e.g. "packages/workspace-a/*".',
      });
    }
  },
  optionsRuntype: Options,
};
