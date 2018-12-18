import { PackageContext, WorkspaceContext } from "./packages/core";
import { getPackageNameToDir } from "./packages/utils";
import * as path from "path";

module.exports = {
  checks: [
    {
      type: "./packages/expect-file-contents",
      args: {
        file: "tsconfig.json",
        generator: (context: PackageContext) => {
          if (context.parent === undefined) {
            return undefined; // No need for this at the root
          }

          const template = {
            compilerOptions: {
              target: "es5",
              module: "commonjs",
              lib: ["es2015"],
              declaration: true,
              declarationMap: true,
              sourceMap: true,
              outDir: "./build",
              rootDir: "./src",
              composite: true,
              importHelpers: true,
              strict: true,
              noUnusedLocals: true,
              noUnusedParameters: true,
              noImplicitReturns: true,
              noFallthroughCasesInSwitch: true,

              allowSyntheticDefaultImports: true,
              esModuleInterop: true
            },
            references: []
          };

          const workspaceContext = (context.parent as any) as WorkspaceContext;
          const nameToDirectory = getPackageNameToDir(
            context.parent.packageDir
          );

          const packageJson = context.getPackageJson();
          [
            ...Object.keys(packageJson.dependencies || {}),
            ...Object.keys(packageJson.devDependencies || {})
          ]
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
        }
      }
    }
  ]
};
