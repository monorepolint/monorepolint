// @ts-check
/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/default",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  moduleFileExtensions: ["js", "ts", "tsx", "cjs", "cts"],
  transform: {
    "^.+\\.m?[tj]sx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.json", // because we re-export this file, this will be relative to that spot
      },
    ],
  },
  // transformIgnorePatterns: ["node_modules/(?!(@monorepolint|find-up))"],

  clearMocks: true,

  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageReporters: ["json", "text", "lcov", "clover"],

  notify: true,

  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/__tests__/*.spec.+(ts|tsx|js|cts|cjs)"],
  testPathIgnorePatterns: ["/node_modules/", "/build", "/lib"],

  verbose: true,
};
