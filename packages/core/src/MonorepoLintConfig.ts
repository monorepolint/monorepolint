/*!
 * Copyright (c) 2018 monorepo-lint (http://monorepo-lint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

export interface MonorepoLintConfig {
  verbose: boolean;
  fix: boolean;
  checks: ReadonlyArray<{
    type: string;
    args: any;
    exclude: string[];
  }>;
}
