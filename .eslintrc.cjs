module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  rules: {
    "@typescript-eslint/no-empty-interface": "warn", // this rule could make perf worse!
    "@typescript-eslint/no-inferrable-types": "warn", // same.
  },
  ignorePatterns: ["build/"],
};
