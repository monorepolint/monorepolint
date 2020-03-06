/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { FileSystem } from "@monorepolint/utils";
import { ResolvedConfig } from "./Config";
import { Context } from "./Context";
import { PackageContext } from "./PackageContext";

// Right now, this stuff is done serially so we are writing less code to support that. Later we may want to redo this.
export class WorkspaceContext extends PackageContext {
  constructor(packageDir: string, opts: ResolvedConfig, fileSystem: FileSystem, parent?: Context) {
    super(packageDir, opts, fileSystem, parent);
  }

  public getWorkspacePackageDirs() {
    return this.fileSystem.getWorkspacePackageDirs(this.packageDir);
  }

  public createChildContext(dir: string) {
    return new PackageContext(dir, this.resolvedConfig, this.fileSystem, this);
  }
}
