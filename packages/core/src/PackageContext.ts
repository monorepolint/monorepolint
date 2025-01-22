/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import {
  AddErrorAsyncOptions,
  AddErrorOptions,
  AddErrorSyncOrAsyncOptions,
  Context,
  Failure,
  PackageContext,
  ResolvedConfig,
  WorkspaceContext,
} from "@monorepolint/config";
import { Host, PackageJson } from "@monorepolint/utils";
import chalk from "chalk";
import * as path from "path";

// Right now, this stuff is done serially so we are writing less code to support that. Later we may want to redo this.
export class PackageContextImpl implements PackageContext {
  public depth: number;
  public failed = false;

  public printedName = false;

  constructor(
    public readonly packageDir: string,
    public readonly resolvedConfig: ResolvedConfig,
    public readonly host: Host,
    public readonly parent?: Context,
  ) {
    this.depth = this.parent ? this.parent.depth + 1 : 0;
  }

  public getName() {
    return this.getPackageJson().name || this.packageDir;
  }

  public getPackageJsonPath(): string {
    return path.join(this.packageDir, "package.json");
  }

  public getPackageJson(): PackageJson {
    return this.host.readJson(this.getPackageJsonPath()) as PackageJson;
  }

  public addWarning({ message, longMessage }: Failure) {
    this.printName();

    this.printWarning(`${chalk.yellow("Warning!")}: ${message}`);
    if (this.resolvedConfig.verbose && longMessage) {
      for (let i = 0; i <= this.depth + 1; i++) {
        // tslint:disable-next-line:no-console
        console.group();
      }
      this.printWarning(`${longMessage}`, 0);
      for (let i = 0; i <= this.depth + 1; i++) {
        // tslint:disable-next-line:no-console
        console.groupEnd();
      }
    }
  }

  public addError(options: AddErrorOptions) {
    this.addErrorSyncOrAsync(options);
  }

  public async addErrorAsync(options: AddErrorAsyncOptions): Promise<void> {
    this.addErrorSyncOrAsync(options);
  }

  private async addErrorSyncOrAsync(
    { file, message, longMessage, fixer }: AddErrorSyncOrAsyncOptions,
  ): Promise<void> {
    this.printName();

    const shortFile = path.relative(this.packageDir, file);

    if (this.resolvedConfig.fix && fixer) {
      await fixer();
      this.print(
        `${chalk.green("Fixed!")} ${chalk.magenta(shortFile)}: ${message}`,
      );
    } else {
      this.setFailed();
      this.printError(
        `${chalk.red("Error!")} ${chalk.magenta(shortFile)}: ${message}`,
      );

      if (this.resolvedConfig.verbose && longMessage) {
        for (let i = 0; i <= this.depth + 1; i++) {
          // tslint:disable-next-line:no-console
          console.group();
        }
        this.printError(`${longMessage}`, 0);
        for (let i = 0; i <= this.depth + 1; i++) {
          // tslint:disable-next-line:no-console
          console.groupEnd();
        }
      }
    }
  }

  public isFailure() {
    return this.failed;
  }

  public finish() {
    // do nothing for now
  }

  public setFailed(): void {
    this.failed = true;
    if (!this.parent) {
      return;
    }

    return this.parent!.setFailed();
  }

  public getWorkspaceContext(): WorkspaceContext {
    // Its not an alias, its a flattened recursion
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let context: Context = this;
    while (context.parent !== undefined) {
      context = context.parent;
    }
    return context as WorkspaceContext;
  }

  private print(str: string, depth: number = this.depth + 1) {
    if (this.resolvedConfig.silent) {
      return;
    }
    // tslint:disable-next-line:no-console
    console.log(this.getMessage(str, depth));
  }

  private printWarning(str: string, depth: number = this.depth + 1) {
    if (this.resolvedConfig.silent) {
      return;
    }
    // In nodejs, `console.warn` is an alias for `console.error`,
    // which is undesirable for unfixable or unimportant warnings.
    // tslint:disable-next-line:no-console
    console.log(this.getMessage(str, depth));
  }

  private printError(str: string, depth: number = this.depth + 1) {
    if (this.resolvedConfig.silent) {
      return;
    }
    // tslint:disable-next-line:no-console
    console.error(this.getMessage(str, depth));
  }

  private getMessage(str: string, depth: number) {
    return " ".repeat(depth * 2) + str;
  }

  private printName() {
    if (this.resolvedConfig.silent) {
      return;
    }
    if (this.printedName) {
      return;
    }
    this.print(
      `${chalk.blue(this.getName())} (${this.packageDir})`,
      this.depth,
    );
    this.printedName = true;
  }
}
