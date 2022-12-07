import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: true,
  outDir: "build/js",
  clean: true,

  format: ["cjs", "esm"],
  esbuildOptions: (options) => {
    options.external = [
      "./node_modules/*",
      "../node_modules/*",
      "../../node_modules/*",
      "../../../node_modules/*",
      "../../../../node_modules/*",
    ];
    options.logLevel = "debug";
  },
});
