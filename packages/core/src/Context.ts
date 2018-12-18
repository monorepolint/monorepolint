/*!
 * Copyright (c) 2018 Eric L Anderson (http://monorepo-lint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { PackageJson } from "@monorepo-lint/utils";
import { WorkspaceContext } from "./WorkspaceContext";
export interface Failure {
  message: string;
  file?: string;
  longMessage?: string;
  fixer?: () => void;
}
export interface Context {
  readonly depth: number;
  readonly failed: boolean;
  readonly packageDir: string;
  readonly parent?: Context;

  getName(): string;

  getPackageJsonPath(): string;

  getPackageJson(): PackageJson;
  addWarning(opts: Failure): void;
  addError(opts: Failure): void;

  isFailure(): boolean;

  finish(): void;

  setFailed(): void;

  getWorkspaceContext(): WorkspaceContext;
}
