/*!
 * Copyright (c) 2018 monorepo-lint (http://monorepo-lint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { PackageJson, readJson } from "@monorepo-lint/utils";
import chalk from "chalk";
import * as path from "path";
import { Context } from "./Context";
import { MonorepoLintConfig } from "./MonorepoLintConfig";
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
    public readonly opts: MonorepoLintConfig,
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

    this.print(`${chalk.yellow("Warning!")}: ${message}`);
    if (this.opts.verbose && longMessage) {
      for (let i = 0; i <= this.depth + 1; i++) {
        // tslint:disable-next-line:no-console
        console.group();
      }
      this.print(`${longMessage}`, 0);
      for (let i = 0; i <= this.depth + 1; i++) {
        // tslint:disable-next-line:no-console
        console.groupEnd();
      }
    }
  }

  public addError({ file, message, longMessage, fixer }: FailureOptions) {
    this.printName();

    const shortFile = path.relative(this.packageDir, file);

    if (this.opts.fix && fixer) {
      fixer();
      this.print(
        `${chalk.green("Fixed!")} ${chalk.magenta(shortFile)}: ${message}`
      );
    } else {
      this.setFailed();
      this.print(
        `${chalk.red("Error!")} ${chalk.magenta(shortFile)}: ${message}`
      );

      if (this.opts.verbose && longMessage) {
        for (let i = 0; i <= this.depth + 1; i++) {
          // tslint:disable-next-line:no-console
          console.group();
        }
        this.print(`${longMessage}`, 0);
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
    // tslint:disable-next-line:no-console
    console.log(" ".repeat(depth * 2) + str);
  }

  private printName() {
    if (this.printedName) {
      return;
    }
    this.print(chalk.blue(this.getName()), this.depth);
    this.printedName = true;
  }
}
