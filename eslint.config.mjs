// @ts-check

import eslint from "@eslint/js";
import turboConfig from "eslint-config-turbo/flat";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...turboConfig,
  {
    rules: {
      "@typescript-eslint/no-empty-interface": "off", // this rule could make perf worse!
      "@typescript-eslint/no-inferrable-types": "off", // same.
      "@typescript-eslint/no-explicit-any": "warn", // bad rule
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
      }],
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: globals.commonjs,
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["vitest.workspace.js"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["**/__tests__/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  { ignores: ["**/build/"] },
);
