// packages/utils/vitest.config.mjs
import {
  coverageConfigDefaults,
  defaultExclude,
  defineProject,
} from "file:///Volumes/git/oss/monorepolint/node_modules/.pnpm/vitest@2.1.8_@types+node@18.18.14_terser@5.37.0/node_modules/vitest/dist/index.js";
var vitest_config_default = defineProject({
  test: {
    exclude: [...defaultExclude, "**/build/**"],
    coverage: {
      provider: "v8",
      enabled: true,
      exclude: [...coverageConfigDefaults.exclude, "vitest.config.*"],
    },
  },
});
export { vitest_config_default as default };
// # sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGFja2FnZXMvdXRpbHMvdml0ZXN0LmNvbmZpZy5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVm9sdW1lcy9naXQvb3NzL21vbm9yZXBvbGludC9wYWNrYWdlcy91dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1ZvbHVtZXMvZ2l0L29zcy9tb25vcmVwb2xpbnQvcGFja2FnZXMvdXRpbHMvdml0ZXN0LmNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1ZvbHVtZXMvZ2l0L29zcy9tb25vcmVwb2xpbnQvcGFja2FnZXMvdXRpbHMvdml0ZXN0LmNvbmZpZy5tanNcIjtcbmltcG9ydCB7IGNvdmVyYWdlQ29uZmlnRGVmYXVsdHMsIGRlZmluZVByb2plY3QsIGRlZmF1bHRFeGNsdWRlIH0gZnJvbSAndml0ZXN0J1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVQcm9qZWN0KHtcbiAgdGVzdDoge1xuICAgZXhjbHVkZTogWy4uLmRlZmF1bHRFeGNsdWRlLCBcIioqL2J1aWxkLyoqXCJdLFxuICAgIGNvdmVyYWdlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZXhjbHVkZTogWy4uLmNvdmVyYWdlQ29uZmlnRGVmYXVsdHMuZXhjbHVkZSwgXCJ2aXRlc3QuY29uZmlnLipcIl1cbiAgICB9XG4gIH0sXG59KVxuICAgICAgICAgICJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFTLHdCQUF3QixlQUFlLHNCQUFzQjtBQUV0RSxJQUFPLHdCQUFRLGNBQWM7QUFBQSxFQUMzQixNQUFNO0FBQUEsSUFDTCxTQUFTLENBQUMsR0FBRyxnQkFBZ0IsYUFBYTtBQUFBLElBQ3pDLFVBQVU7QUFBQSxNQUNSLFNBQVM7QUFBQSxNQUNULFNBQVMsQ0FBQyxHQUFHLHVCQUF1QixTQUFTLGlCQUFpQjtBQUFBLElBQ2hFO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
