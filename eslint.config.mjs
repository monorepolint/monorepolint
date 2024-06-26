// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-empty-interface": "off", // this rule could make perf worse!
      "@typescript-eslint/no-inferrable-types": "off", // same.
      "@typescript-eslint/no-explicit-any": "warn", // bad rule
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: globals.commonjs,
    },
  },
  {
    files: ["**/__tests__/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  { ignores: ["**/build/"] }
);
