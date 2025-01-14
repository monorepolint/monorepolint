import { defineWorkspace, defaultExclude } from "vitest/config";
import { getPackagesSync } from "@manypkg/get-packages";

export default defineWorkspace(["packages/*/vitest.config.mjs"]);

export function createConfigForMonorepo() {
  return getPackagesSync(process.cwd()).packages.map((p) => ({
    test: {
      name: p.packageJson.name.replace("@monorepolint", "@"),
      //   root: p.relativeDir,
      dir: p.relativeDir,
      exclude: [...defaultExclude, "**/build/**"],
    },
  }));
}
