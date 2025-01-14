import { coverageConfigDefaults, defineProject } from "vitest/config";
export default defineProject({
  test: {
    coverage: {
      provider: "v8",
      enabled: true,
      exclude: [...coverageConfigDefaults.exclude, "vitest.config.*", "**/build/**", "packages/docs/**"],
    },
  },
});
