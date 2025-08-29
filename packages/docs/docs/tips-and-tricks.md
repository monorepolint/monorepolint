---
title: Tips and Tricks
---

## Using the REMOVE Symbol

The `REMOVE` symbol provides a clean way to remove entries, dependencies, scripts, and files across your monorepo. Import it from `@monorepolint/rules`:

```js
import { REMOVE } from "@monorepolint/rules";
```

### Benefits of REMOVE

- **Explicit Intent**: Makes removal operations explicit and intentional
- **Conditional Behavior**: Only reports errors when items exist, avoiding noise
- **Clean Configuration**: More readable than legacy `undefined` approaches
- **Type Safety**: Provides better TypeScript support

### Supported Rules

The `REMOVE` symbol works with these rules:

- **fileContents**: Remove files from packages
- **packageScript**: Remove scripts from package.json
- **requireDependency**: Remove dependencies from package.json
- **packageEntry**: Remove arbitrary fields from package.json

### Migration Cleanup Example

Here's a comprehensive example showing how to use `REMOVE` for migrating from Jest to Vitest:

```js
import {
  fileContents,
  packageScript,
  REMOVE,
  requireDependency,
} from "@monorepolint/rules";

export default {
  rules: [
    // Remove Jest configuration files
    fileContents({
      options: {
        file: "jest.config.js",
        template: REMOVE,
      },
    }),
    fileContents({
      options: {
        file: "jest.config.json",
        template: REMOVE,
      },
    }),

    // Remove Jest scripts
    packageScript({
      options: {
        scripts: {
          jest: REMOVE,
          "jest:watch": REMOVE,
          "test:jest": REMOVE,
        },
      },
    }),

    // Remove Jest dependencies
    requireDependency({
      options: {
        devDependencies: {
          jest: REMOVE,
          "@types/jest": REMOVE,
          "ts-jest": REMOVE,
          "jest-environment-jsdom": REMOVE,
        },
      },
    }),

    // Add Vitest configuration and dependencies
    fileContents({
      options: {
        file: "vitest.config.mjs",
        templateFile: "./templates/vitest.config.mjs",
      },
    }),
    packageScript({
      options: {
        scripts: {
          test: "vitest run --passWithNoTests",
          "test:watch": "vitest --passWithNoTests",
        },
      },
    }),
    requireDependency({
      options: {
        devDependencies: {
          vitest: "^1.0.0",
          "@vitest/ui": "^1.0.0",
        },
      },
    }),
  ],
};
```

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
const tsupContents = formatWithDprint(
  `
  import { defineConfig } from "tsup";

  export default defineConfig(async (options) =>
  (await import("mytsup")).default(options)
  );     
`,
  "js",
);

// ...

return [
  fileContents({
    ...shared,
    options: {
      file: "tsup.config.js",
      template: tsupContents,
    },
  }),
];
```
