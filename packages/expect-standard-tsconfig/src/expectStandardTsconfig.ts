import * as path from "path";
import * as fs from "fs";
import diff from "jest-diff";
import { Context } from "@monorepo-lint/core";
import { getPackageNameToDir } from "@monorepo-lint/utils";
import { __makeTemplateObject } from "tslib";

export type Opts =
  | {
      generator: (context: Context) => string;
      template?: undefined;
      templateFile?: undefined;
      exclude?: string[];
    }
  | {
      template: object;
      generator?: undefined;
      templateFile?: undefined;
      exclude?: string[];
    }
  | {
      templateFile: string;
      generator?: undefined;
      template?: undefined;
      exclude?: string[];
    };

export default function expectStandardTsconfig(context: Context, opts: Opts) {
  const fullPath = path.resolve(context.packageDir, "tsconfig.json");
  const generator = getGenerator(context, opts);
  const expectedContent = generator(context);

  const actualContent = fs.existsSync(fullPath)
    ? fs.readFileSync(fullPath, "utf-8")
    : undefined;

  if (expectedContent === undefined) {
    context.addWarning({
      file: fullPath,
      message: "Excluding from expect-standard-tsconfig"
    });
    return;
  }

  if (actualContent !== expectedContent) {
    context.addError({
      file: fullPath,
      message: "Expect file contents to match",
      longMessage: diff(expectedContent, actualContent, { expand: true }),
      fixer: () => {
        fs.writeFileSync(fullPath, expectedContent);
      }
    });
  }
}

function getGenerator(context: Context, opts: Opts) {
  if (opts.generator) {
    return opts.generator;
  } else if (opts.templateFile) {
    const { packageDir: workspacePackageDir } = context.getWorkspaceContext();
    const fullPath = path.resolve(workspacePackageDir, opts.templateFile);
    const template = JSON.parse(fs.readFileSync(fullPath, "utf-8"));

    return makeGenerator(template, new Set(opts.exclude));
  } else if (opts.template) {
    return makeGenerator(opts.template, new Set(opts.exclude));
  } else {
    throw new Error("Unable to make generator");
  }
}

function makeGenerator(template: any, excludes: Set<string>) {
  return function generator(context: Context) {
    if (excludes.has(context.getName())) {
      return undefined;
    }
    template = {
      ...template,
      references: []
    }; // make a copy and ensure we have a references array

    const nameToDirectory = getPackageNameToDir(
      context.getWorkspaceContext().packageDir
    );

    const packageJson = context.getPackageJson();
    const deps = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {})
    ];

    deps
      .filter(name => nameToDirectory.has(name))
      .forEach(packageName => {
        template.references.push({
          path: path.relative(
            context.packageDir,
            nameToDirectory.get(packageName)!
          )
        });
      });

    return JSON.stringify(template, undefined, 2) + "\n";
  };
}
