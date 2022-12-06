/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { getPackageNameToDir, getWorkspacePackageDirs, Host } from "@monorepolint/utils";
import * as Config from "@monorepolint/config";
import { PackageContextImpl } from "./PackageContext";

// Right now, this stuff is done serially so we are writing less code to support that. Later we may want to redo this.
export class WorkspaceContextImpl extends PackageContextImpl implements Config.WorkspaceContext {
  private packageNameToDir: Map<string, string> | undefined;
  private workspacePackageDirsCache: string[] | undefined;

  constructor(packageDir: string, opts: Config.ResolvedConfig, host: Host, parent?: Config.Context) {
    super(packageDir, opts, host, parent);
  }

  public async getWorkspacePackageDirs() {
    this.workspacePackageDirsCache =
      this.workspacePackageDirsCache ?? (await getWorkspacePackageDirs(this.host, this.packageDir));

    return this.workspacePackageDirsCache;
  }

  public createChildContext(dir: string) {
    return new PackageContextImpl(dir, this.resolvedConfig, this.host, this);
  }

  public async getPackageNameToDir() {
    this.packageNameToDir = this.packageNameToDir ?? (await getPackageNameToDir(this.host, this.packageDir));
    return this.packageNameToDir;
  }
}
