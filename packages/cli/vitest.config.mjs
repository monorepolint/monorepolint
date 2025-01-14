
import { coverageConfigDefaults, defineProject, defaultExclude } from 'vitest/config'

export default defineProject({
  test: {
   exclude: [...defaultExclude, "**/build/**"],
    coverage: {
      provider: "v8",
      enabled: true,
      exclude: [...coverageConfigDefaults.exclude, "vitest.config.*"]
    }
  },
})
          