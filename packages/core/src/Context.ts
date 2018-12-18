import { PackageJson } from "@monorepo-lint/utils";
import { WorkspaceContext } from './WorkspaceContext';
export interface FailureOptions {
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
  addWarning(opts: FailureOptions): void;
  addError(opts: FailureOptions): void;

  isFailure(): boolean;

  finish(): void;

  setFailed(): void;

  getWorkspaceContext(): WorkspaceContext;
  
}
