/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { PackageContext } from "./PackageContext.js";
// Right now, this stuff is done serially so we are writing less code to support that. Later we may want to redo this.
export interface WorkspaceContext extends PackageContext {
  getWorkspacePackageDirs(): Promise<string[]>;
  createChildContext(dir: string): PackageContext;
  getPackageNameToDir(): Promise<Map<string, string>>;
}
