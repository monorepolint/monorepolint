import * as path from "path";
import * as fs from "fs";
import diff from "jest-diff";
import { Context } from "@monorepo-lint/core";

export interface Opts {
  file: string;
  generator: (context: Context) => string;
}

export default function expectFileContents(context: Context, opts: Opts) {
  const fullPath = path.join(context.packageDir, opts.file);
  const expectedContent = opts.generator(context);

  const actualContent = fs.existsSync(fullPath)
    ? fs.readFileSync(fullPath, "utf-8")
    : undefined;

  if (actualContent !== expectedContent) {
    context.addError({
      file: fullPath,
      message: "Expect file contents to match",
      longMessage: diff(expectedContent, actualContent, { expand: true }),
      fixer: () => {
        if (expectedContent === undefined) {
          fs.unlinkSync(fullPath);
        } else {
          fs.writeFileSync(fullPath, expectedContent);
        }
      }
    });
  }
}
