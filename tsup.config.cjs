import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/public/*.ts"],
  splitting: true,
  sourcemap: true,
  outDir: "build/js",
  target: "node16",
  clean: true,

  format: ["esm"],
  esbuildOptions: (options) => {
    options.external = [
      "./node_modules/*",
      "../node_modules/*",
      "../../node_modules/*",
      "../../../node_modules/*",
      "../../../../node_modules/*",
    ];
  },
});
