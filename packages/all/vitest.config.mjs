import { coverageConfigDefaults, defaultExclude, defineProject } from "vitest/config";

export default defineProject({
  test: {
    exclude: [...defaultExclude, "**/build/**"],
    coverage: {
      provider: "v8",
      enabled: true,
      pool: "forks",
      exclude: [...coverageConfigDefaults.exclude, "vitest.config.*"],
    },
  },
});
