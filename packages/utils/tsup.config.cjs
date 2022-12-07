import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: true,
  outDir: "build/js",
  clean: true,
  external: [/node_modules/],
  format: ["cjs", "esm"],
});
