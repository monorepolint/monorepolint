/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { PackageJson, readJson } from "@monorepolint/utils";
import chalk from "chalk";
import * as path from "path";
import { ResolvedConfig } from "./Config";
import { Context } from "./Context";
import { WorkspaceContext } from "./WorkspaceContext";

interface FailureOptions {
  file: string;
  message: string;
  longMessage?: string;
  fixer?: () => void;
}

// Right now, this stuff is done serially so we are writing less code to support that. Later we may want to redo this.
export class PackageContext implements Context {
  public depth: number;
  public failed = false;

  protected printedName = false;

  constructor(
    public readonly packageDir: string,
    public readonly resolvedConfig: ResolvedConfig,
    public readonly parent?: Context
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
    return readJson(this.getPackageJsonPath());
  }

  public addWarning({ message, longMessage }: FailureOptions) {
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

  public addError({ file, message, longMessage, fixer }: FailureOptions) {
    this.printName();

    const shortFile = path.relative(this.packageDir, file);

    if (this.resolvedConfig.fix && fixer) {
      fixer();
      this.print(`${chalk.green("Fixed!")} ${chalk.magenta(shortFile)}: ${message}`);
    } else {
      this.setFailed();
      this.printError(`${chalk.red("Error!")} ${chalk.magenta(shortFile)}: ${message}`);

      if (longMessage) {
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
    // tslint:disable-next-line:no-console
    console.warn(this.getMessage(str, depth));
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
    this.print(`${chalk.blue(this.getName())} (${this.packageDir})`, this.depth);
    this.printedName = true;
  }
}
