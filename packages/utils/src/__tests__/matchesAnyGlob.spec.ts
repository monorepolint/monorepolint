/*!
 * Copyright 2022 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { describe, expect, it, vi } from "vitest";
import { matchesAnyGlob, needleInPattern } from "../matchesAnyGlob.js";

describe("matchesAnyGlob", () => {
  it("should properly inline needleInPattern functionality", () => {
    // Test basic matching functionality
    expect(matchesAnyGlob("test.js", ["*.js"])).toBe(true);
    expect(matchesAnyGlob("test.ts", ["*.js"])).toBe(false);
    expect(matchesAnyGlob("src/test.js", ["src/*.js"])).toBe(true);
    expect(matchesAnyGlob("src/test.js", ["lib/*.js"])).toBe(false);
  });

  it("should produce identical results to needleInPattern for individual pattern matching", () => {
    const testCases = [
      { needle: "test.js", pattern: "*.js" },
      { needle: "test.ts", pattern: "*.js" },
      { needle: "src/test.js", pattern: "src/*.js" },
      { needle: "lib/test.js", pattern: "src/*.js" },
      { needle: "components/Button.tsx", pattern: "components/*.{ts,tsx}" },
      { needle: "utils/helper.js", pattern: "utils/*" },
      { needle: "deep/nested/file.txt", pattern: "deep/**/*.txt" },
    ];

    for (const { needle, pattern } of testCases) {
      const matchesAnyResult = matchesAnyGlob(needle, [pattern]);
      const needleInPatternResult = needleInPattern(needle, pattern);

      expect(matchesAnyResult).toBe(needleInPatternResult);
    }
  });

  it("should handle multiple patterns correctly", () => {
    const patterns = ["*.js", "*.ts", "src/**/*.tsx"];

    expect(matchesAnyGlob("test.js", patterns)).toBe(true);
    expect(matchesAnyGlob("test.ts", patterns)).toBe(true);
    expect(matchesAnyGlob("src/components/Button.tsx", patterns)).toBe(true);
    expect(matchesAnyGlob("test.py", patterns)).toBe(false);
  });

  it("should break early when a pattern matches", () => {
    // Spy on the deprecated function to ensure it's not called
    const needleInPatternSpy = vi.spyOn({ needleInPattern }, "needleInPattern");

    const patterns = ["*.nonexistent", "*.js", "*.ts"];
    const result = matchesAnyGlob("test.js", patterns);

    expect(result).toBe(true);
    // The deprecated function should not be called since we inline it
    expect(needleInPatternSpy).not.toHaveBeenCalled();

    needleInPatternSpy.mockRestore();
  });

  it("should handle empty haystack", () => {
    expect(matchesAnyGlob("test.js", [])).toBe(false);
  });

  it("should handle complex glob patterns", () => {
    const patterns = [
      "**/*.{js,ts,tsx}",
      "src/**/components/*.tsx",
    ];

    expect(matchesAnyGlob("src/components/Button.tsx", patterns)).toBe(true);
    expect(matchesAnyGlob("lib/utils/helper.js", patterns)).toBe(true);
    expect(matchesAnyGlob("README.md", patterns)).toBe(false);
  });

  it("should maintain caching behavior like needleInPattern", () => {
    const needle = "test.js";
    const patterns = ["*.js", "*.ts"];

    // First call should populate cache
    const result1 = matchesAnyGlob(needle, patterns);

    // Second call should use cache
    const result2 = matchesAnyGlob(needle, patterns);

    expect(result1).toBe(result2);
    expect(result1).toBe(true);
  });
});
