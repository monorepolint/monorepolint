/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { PackageJson } from "@monorepolint/utils";
import { ResolvedConfig } from "./Config";
import { WorkspaceContext } from "./WorkspaceContext";

export interface Failure {
  message: string;
  file?: string;
  longMessage?: string | null;
  fixer?: () => void;
}

export interface AddErrorOptions extends Failure {
  file: string;
}

export interface AddErrorAsyncOptions extends AddErrorOptions {
  fixer?: () => Promise<void>;
}

export interface Context {
  readonly depth: number;
  readonly failed: boolean;
  readonly packageDir: string;
  readonly parent?: Context;
  readonly resolvedConfig: ResolvedConfig;

  getName(): string;

  getPackageJsonPath(): string;

  getPackageJson(): PackageJson;
  addWarning(opts: Failure): void;
  addError(opts: AddErrorOptions): void;
  addErrorAsync(opts: AddErrorAsyncOptions): Promise<void>;

  isFailure(): boolean;

  finish(): void;

  setFailed(): void;

  getWorkspaceContext(): WorkspaceContext;
}
