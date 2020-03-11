/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/core";
import { LockFileObject, parse as lockfileParse } from "@yarnpkg/lockfile";
import { readFileSync } from "fs";
import path from "path";
import * as r from "runtypes";

const Options = r.Record({
  bannedTransitiveDependencies: r.Array(r.String),
});

type Options = r.Static<typeof Options>;

export const bannedTransitiveDependencies: RuleModule<typeof Options> = {
  check: (context: Context, opts: Options) => {
    const { bannedTransitiveDependencies: bannedDeps } = opts;

    const packagePath = context.getWorkspaceContext().packageDir;
    const yarnLockFilePath = path.join(packagePath, "yarn.lock");

    const yarnLock: LockFileObject = lockfileParse(readFileSync(yarnLockFilePath).toString()).object;
    const allDeps = Object.keys(yarnLock);

    for (const dep of allDeps) {
      if (bannedDeps.includes(dep)) {
        context.addError({
          file: packagePath,
          message: `Banned transitive depdendencies in repo: ${dep}`,
        });
      }
    }
  },
  optionsRuntype: Options,
};
