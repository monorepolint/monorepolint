/*!
 * Copyright (c) 2018 monorepo-lint (http://monorepo-lint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

export interface PackageJson {
  name?: string;
  scripts?: {
    [key: string]: string;
  };
  dependencies?: {
    [dependency: string]: string;
  };
  devDependencies?: {
    [dependency: string]: string;
  };
  workspaces?:
    | {
        packages?: string[];
        nohoist?: string[];
      }
    | string[];
  [otherKey: string]: any;
}
