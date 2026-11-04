# Archetypes and Large Monorepos

After a monorepo grows in complexity, managing your rules can be quite complex. You may have a lot of different types of packages which can make applying consistent rules across classes of packages especially challenging. For that we build `@monorepolint/archetypes`.

Instead of creating complex rule chains with include/exclude patterns that are hard to follow, you can instead define different archetypes and know that your rules are only applied consistently and only once per package.

## Examples

### Example using archetypes

In this example, we will assume that our monorepo has the following archetypical packages:

1. Test-only packages written in typescript that we don't publish
2. Benchmarks written purely in JS that we don't publish
3. Sample apps, written in react, that we don't publish
4. Our actual library packages, written in typescript that we do publish

Additionally, we will configure our archetypes builder to error if it finds any packages that do not match any of these archetypes.

```ts
import { archetypes, ifTrue } from "@monorepolint/archetypes";
import { packageEntry, standardTsconfig } from "@monorepolint/rules";

interface MyRules {
  react?: boolean;
  private?: boolean;
  jsOnly?: boolean;
}

export default {
  rules: archetypes<MyRules>(
    (shared, rules) => {
      return [
        ...ifTrue(
          !rules.jsOnly,
          [
            standardTsconfig({
              ...shared,
              options: {
                template: {
                  compilerOptions: {
                    rootDir: "src",
                    outDir: "lib",
                    ...(rules.react
                      ? { jsx: "react" }
                      : {}),
                  },
                  include: ["./src/**/*"],
                },
              },
            }),
          ],
        ),
        packageEntry({
          ...shared,
          options: {
            entries: {
              private: !!rules.private,
            },
          },
        }),
      ];
    },
    { unmatched: "error" },
  )
    .addArchetype(
      "tests",
      ["@mine/tests.*"],
      {
        private: true,
      },
    )
    .addArchetype(
      "benchmarks",
      ["@mine/benchmarks.*"],
      {
        private: true,
        jsOnly: true,
      },
    )
    .addArchetype(
      "sample apps",
      ["@mine/examples.*"],
      {
        private: true,
        react: true,
      },
    )
    .addArchetype(
      "libraries",
      ["@mine/a", "@mine/b"],
      {},
    )
    .buildRules(),
};
```

### Using fallback configuration

If in our earlier example we want all unmatched packages to use a default configuration instead of erroring we can do that as well:

```ts
const rulesForUnmatchedPackages: {
  private: true;
};

export default {
  rules: archetypes<MyRules>(
    (shared, rules) => {
      return [
        // ... our rules here
      ];
    },
    {
      unmatched: rulesForUnmatchedPackages,
    },
  ).addArchetype(
    "libraries",
    ["@mine/a", "@mine/b"],
    {},
  ).buildRules(),
};
```

### Catching packages declared as two different archetypes

One thing that can be challenging about using monorepolint is that rules can accidentally be applied multiple times with different values.

Take plain monorepolint configuration for example:

```ts
const REACT = ["@mine/docs", "@mine/example", "@mine/react-*"];
const PUBLIC = ["@mine/react-lib"];

export default [
  [
    Rules.standardTsconfig({
      options: { templateFile: "./tmpl/tsconfig.react.json" },
      includePackages: REACT,
    }),
    Rules.standardTsconfig({
      options: { templateFile: "./tmpl/tsconfig.json" },
      includePackages: PUBLIC,
    }),
  ],
];
```

Here, `@mine/react-lib` will be triggered by both rules creating a hard to debug situation. But with archetypes, we get a clean error:

```ts
export default {
  rules: archetypes<MyRules>(
    myCustomRuleFunc,
    { unmatched: rulesForUnmatchedPackages },
  ).addArchetype(
    "uses react",
    ["@mine/docs", "@mine/example", "@mine/react-*"],
    { react: true },
  ).addArchetype(
    "public packages",
    ["@mine/react-lib"],
    {},
  ).buildRules(),
};
```

With this configuration, you would get an error that `@mine/react-lib` was already included in the archetype `"uses react"` allowing you to fix your conflict much quicker.
