---
title: Tips and Tricks
---

## Standardizing package.json Exports

To maintain consistency across packages, it is recommended to define a standard for exports, such as mapping all files in the `public/` directory as root exports. This can be achieved by using the following configuration:

```ts
  packageEntry({
    options: {
      entries: {
        exports: {
          ".": {
            types: "./dist/index.d.ts",
            import: "./dist/index.mjs",
            require: "./dist/index.js",
          },
          "./*": {
            types: "./dist/public/*.d.ts",
            import: "./dist/public/*.mjs",
            require: "./dist/public/*.js",
          },
        },
      },
    },
  }),
```

This configuration can be combined with tools like `tsup` to automatically bundle exports:

```json
{
    ...
    "entry": ["src/index.ts", "src/public/*.ts"]
    ...
}
```

## Pre-formatting Generated Content with dprint

Pre-formatting generated content using [dprint](https://dprint.dev/) can be challenging since it cannot be used directly from node. However, it is possible to create wrappers by executing it in a shell:

```js
const formatWithDprint = (contents, ext) => async (context) => {
  const result = child_process.spawnSync(
    `pnpm exec dprint fmt --stdin foo.${ext}`,
    {
      input: contents,
      encoding: "utf8",
      shell: true,
    },
  );

  if (result.error) {
    throw result.error;
  }
  return result.stdout;
};
```

By utilizing this wrapper, you can ensure that your files are properly formatted:

```ts
const tsupContents = formatWithDprint(`
  import { defineConfig } from "tsup";

  export default defineConfig(async (options) =>
  (await import("mytsup")).default(options)
  );     
`, "js);

// ...

return [
  fileContents({
    ...shared,
    options: {
    file: "tsup.config.js",
    template: tsupContents
  })
];
```
