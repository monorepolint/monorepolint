import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { getRunCommand } from "./getRunCommand.js";

describe(getRunCommand, () => {
  describe.each([
    [
      "/Users/myuser/.cache/node/corepack/pnpm/9.15.4/bin/pnpm.cjs",
      "pnpm exec mrl",
    ],
    [undefined, "mrl"],
  ])("for npm_exec path: %s", (npmExecPath, expected) => {
    beforeAll(() => {
      vi.stubEnv("npm_execpath", npmExecPath);
    });

    it(`should return '${expected}'`, () => {
      expect(getRunCommand()).toBe(expected);
    });

    afterAll(() => {
      vi.unstubAllEnvs();
    });
  });
});
