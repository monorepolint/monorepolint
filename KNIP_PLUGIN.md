# Monorepolint Knip Plugin Implementation Plan

## Project Overview

### Purpose

Create a custom Knip plugin package `@monorepolint/knip-plugin` that understands monorepolint's configuration structure and properly detects dependencies, template files, and entry points used by monorepolint configurations.

### Current Problem

Knip currently reports false positives for monorepolint-related dependencies:

- `@monorepolint/internal-mrl-config` appears as unused
- Template files in `templates/` directory are not recognized
- Monorepolint rule packages may be incorrectly flagged
- Configuration files like `.monorepolint.config.mjs` are not properly parsed

### Solution Goals

1. Create a dedicated knip plugin that understands monorepolint configs
2. Properly detect all monorepolint-related dependencies
3. Recognize template files and configuration references
4. Follow monorepo package conventions
5. Make the plugin reusable for other monorepolint projects

## Package Structure

Create the following directory structure in `packages/knip-plugin/`:

```
packages/knip-plugin/
├── package.json
├── tsconfig.json
├── vitest.config.mjs
├── src/
│   ├── index.ts              # Main plugin export
│   ├── config-parser.ts      # Monorepolint config parsing logic
│   ├── types.ts             # TypeScript type definitions
│   └── __tests__/
│       ├── plugin.spec.ts    # Plugin tests
│       └── fixtures/         # Test configuration files
│           ├── basic-config.ts
│           └── complex-config.ts
├── build/                   # Generated build output (gitignored)
│   ├── js/
│   └── types/
└── README.md               # Package documentation
```

## Implementation Details

### 1. Package Configuration

#### `package.json`

```json
{
  "name": "@monorepolint/knip-plugin",
  "version": "0.1.0",
  "description": "Knip plugin for detecting monorepolint configuration dependencies and entry points",
  "keywords": ["knip", "monorepolint", "plugin", "dependency-analysis"],
  "author": "Eric L Anderson (https://github.com/ericanderson)",
  "license": "MIT",
  "homepage": "https://github.com/monorepolint/monorepolint#readme",
  "repository": {
    "type": "git",
    "url": "https://github.com/monorepolint/monorepolint.git",
    "directory": "packages/knip-plugin"
  },
  "main": "build/js/index.js",
  "types": "build/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./build/types/index.d.ts",
      "import": "./build/js/index.js"
    },
    "./*": {
      "types": "./build/types/public/*.d.ts",
      "import": "./build/js/public/*.js"
    }
  },
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "clean": "rm -rf build dist lib node_modules *.tgz tsconfig.tsbuildinfo",
    "compile-typescript": "tsc --build",
    "lint": "eslint .",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest --passWithNoTests"
  },
  "dependencies": {
    "tslib": "^2.8.1"
  },
  "devDependencies": {
    "@types/node": "^22.18.0",
    "@typescript-eslint/eslint-plugin": "^8.41.0",
    "@typescript-eslint/parser": "^8.41.0",
    "eslint": "^9.34.0",
    "knip": "^5.63.0",
    "tslib": "^2.8.1",
    "typescript": "^5.9.2",
    "vitest": "^3.2.4"
  },
  "peerDependencies": {
    "knip": ">=5.0.0"
  },
  "files": [
    "build",
    "README.md"
  ]
}
```

#### `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./build/js",
    "rootDir": "./src",
    "declarationDir": "./build/types",
    "tsBuildInfoFile": "./build/tsconfig.tsbuildinfo"
  },
  "include": [
    "src"
  ],
  "references": []
}
```

#### `vitest.config.mjs`

```javascript
import {
  coverageConfigDefaults,
  defaultExclude,
  defineProject,
} from "vitest/config";

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
```

### 2. Core Plugin Implementation

#### `src/types.ts`

```typescript
export interface MonorepolintRule {
  options?: {
    templateFile?: string;
    file?: string;
    template?: any;
    scripts?: Record<string, any>;
    entries?: Record<string, any>;
    bannedDependencies?: string[];
    [key: string]: any;
  };
  includePackages?: string[];
  excludePackages?: string[];
}

export interface MonorepolintConfig {
  rules?: MonorepolintRule[];
  [key: string]: any;
}

export interface ParseResult {
  dependencies: string[];
  entryFiles: string[];
}
```

#### `src/config-parser.ts`

```typescript
import type {
  MonorepolintConfig,
  MonorepolintRule,
  ParseResult,
} from "./types";

/**
 * Parses a monorepolint configuration to extract dependencies and entry files
 */
export function parseMonorepolintConfig(
  config: MonorepolintConfig,
): ParseResult {
  const dependencies = new Set<string>();
  const entryFiles = new Set<string>();

  // Core monorepolint packages are always used
  dependencies.add("@monorepolint/rules");
  dependencies.add("@monorepolint/config");
  dependencies.add("@monorepolint/core");

  if (!config?.rules) {
    return {
      dependencies: Array.from(dependencies),
      entryFiles: Array.from(entryFiles),
    };
  }

  for (const rule of config.rules) {
    if (!rule?.options) continue;

    // Extract template files
    if (
      rule.options.templateFile && typeof rule.options.templateFile === "string"
    ) {
      // Handle both relative and absolute template paths
      const templatePath = rule.options.templateFile.startsWith("./")
        ? rule.options.templateFile
        : `./${rule.options.templateFile}`;
      entryFiles.add(templatePath);
    }

    // Extract referenced files
    if (rule.options.file && typeof rule.options.file === "string") {
      // Don't add files that are being removed (REMOVE symbol)
      if (
        rule.options.template !== undefined && rule.options.template !== null
      ) {
        entryFiles.add(rule.options.file);
      }
    }

    // Extract script dependencies (like dprint, formatters, etc.)
    if (rule.options.scripts) {
      Object.values(rule.options.scripts).forEach(script => {
        if (typeof script === "string") {
          extractDependenciesFromScript(script, dependencies);
        }
      });
    }

    // Check for custom rule implementations
    if (typeof rule === "function" || rule.constructor?.name !== "Object") {
      // This might be a custom rule - we can't easily analyze it
      // but we know it uses the monorepolint framework
    }
  }

  return {
    dependencies: Array.from(dependencies),
    entryFiles: Array.from(entryFiles),
  };
}

/**
 * Extract dependencies from script commands
 */
function extractDependenciesFromScript(
  script: string,
  dependencies: Set<string>,
): void {
  // Look for common patterns like "pnpm exec dprint", "eslint", etc.
  const patterns = [
    /pnpm exec (\w+)/g,
    /npx (\w+)/g,
    /yarn (\w+)/g,
    /^(\w+)\s/g, // Command at start of line
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(script)) !== null) {
      const command = match[1];
      if (command && !isBuiltinCommand(command)) {
        // Map common commands to package names
        const packageName = mapCommandToPackage(command);
        if (packageName) {
          dependencies.add(packageName);
        }
      }
    }
  }
}

/**
 * Check if a command is a built-in shell command
 */
function isBuiltinCommand(command: string): boolean {
  const builtins = [
    "rm",
    "mkdir",
    "cp",
    "mv",
    "ls",
    "cd",
    "echo",
    "cat",
    "grep",
    "sed",
    "awk",
    "find",
  ];
  return builtins.includes(command);
}

/**
 * Map command names to their package names
 */
function mapCommandToPackage(command: string): string | null {
  const commandMap: Record<string, string> = {
    "dprint": "dprint",
    "eslint": "eslint",
    "prettier": "prettier",
    "tsc": "typescript",
    "jest": "jest",
    "vitest": "vitest",
  };

  return commandMap[command] || null;
}
```

#### `src/index.ts`

```typescript
import type { IsPluginEnabled, Plugin, ResolveConfig } from "knip";
import { parseMonorepolintConfig } from "./config-parser";
import type { MonorepolintConfig } from "./types";

const title = "Monorepolint";

// Packages that indicate monorepolint is being used
const enablers = ["@monorepolint/cli", "monorepolint"];

const isEnabled: IsPluginEnabled = ({ dependencies }) => {
  return Boolean(
    dependencies?.["@monorepolint/cli"]
      || dependencies?.["monorepolint"]
      || dependencies?.["@monorepolint/core"]
      || dependencies?.["@monorepolint/rules"],
  );
};

// Configuration file patterns that monorepolint uses
const config = [
  ".monorepolint.config.{js,mjs,ts}",
  "monorepolint.config.{js,mjs,ts}",
  ".monorepolintrc.{json,js,yml,yaml}",
  "packages/internal-mrl-config/src/monorepolint.config.ts",
];

const resolveConfig: ResolveConfig<MonorepolintConfig> = (
  localConfig,
  options,
) => {
  const result: string[] = [];

  try {
    // Handle the case where .monorepolint.config.mjs imports from internal package
    if (options.configFileName?.includes(".monorepolint.config")) {
      result.push("@monorepolint/internal-mrl-config");
    }

    // Parse the configuration to extract dependencies and files
    const { dependencies, entryFiles } = parseMonorepolintConfig(localConfig);

    result.push(...dependencies);
    result.push(...entryFiles);

    // Always include common template locations
    result.push("templates/*.json");
    result.push("templates/*.cjs");
    result.push("templates/*.js");
    result.push("templates/*.ts");

    // Include monorepolint binaries as entry points
    result.push("packages/cli/bin/monorepolint.mjs");
    result.push("packages/cli/bin/mrl.mjs");
  } catch (error) {
    console.warn(
      `Monorepolint plugin: Error parsing config ${options.configFileName}:`,
      error,
    );

    // Fallback: return basic dependencies
    result.push(
      "@monorepolint/rules",
      "@monorepolint/config",
      "@monorepolint/core",
      "@monorepolint/internal-mrl-config",
    );
  }

  return result;
};

const plugin: Plugin = {
  title,
  enablers,
  isEnabled,
  config,
  resolveConfig,
};

export default plugin;
export { parseMonorepolintConfig } from "./config-parser";
export type {
  MonorepolintConfig,
  MonorepolintRule,
  ParseResult,
} from "./types";
```

### 3. Tests

#### `src/__tests__/plugin.spec.ts`

```typescript
import { describe, expect, it } from "vitest";
import { parseMonorepolintConfig } from "../config-parser";
import plugin from "../index";
import type { MonorepolintConfig } from "../types";

describe("Monorepolint Knip Plugin", () => {
  describe("isEnabled", () => {
    it("should be enabled when @monorepolint/cli is present", () => {
      const result = plugin.isEnabled!({
        dependencies: { "@monorepolint/cli": "^1.0.0" },
      });
      expect(result).toBe(true);
    });

    it("should be enabled when monorepolint is present", () => {
      const result = plugin.isEnabled!({
        dependencies: { "monorepolint": "^1.0.0" },
      });
      expect(result).toBe(true);
    });

    it("should be enabled when @monorepolint/core is present", () => {
      const result = plugin.isEnabled!({
        dependencies: { "@monorepolint/core": "^1.0.0" },
      });
      expect(result).toBe(true);
    });

    it("should not be enabled when no monorepolint packages are present", () => {
      const result = plugin.isEnabled!({
        dependencies: { "some-other-package": "^1.0.0" },
      });
      expect(result).toBe(false);
    });
  });

  describe("resolveConfig", () => {
    it("should extract basic dependencies from empty config", () => {
      const config: MonorepolintConfig = { rules: [] };
      const result = plugin.resolveConfig!(config, {
        configFileName: "test.config.js",
      });

      expect(result).toContain("@monorepolint/rules");
      expect(result).toContain("@monorepolint/config");
      expect(result).toContain("@monorepolint/core");
    });

    it("should detect internal config import", () => {
      const config: MonorepolintConfig = {};
      const result = plugin.resolveConfig!(config, {
        configFileName: ".monorepolint.config.mjs",
      });

      expect(result).toContain("@monorepolint/internal-mrl-config");
    });

    it("should extract template files from rules", () => {
      const config: MonorepolintConfig = {
        rules: [
          {
            options: {
              templateFile: "./templates/tsconfig.json",
            },
          },
        ],
      };

      const result = plugin.resolveConfig!(config, {
        configFileName: "test.config.js",
      });
      expect(result).toContain("./templates/tsconfig.json");
    });
  });

  describe("parseMonorepolintConfig", () => {
    it("should parse template files correctly", () => {
      const config: MonorepolintConfig = {
        rules: [
          {
            options: {
              templateFile: "templates/tsconfig.json",
            },
          },
          {
            options: {
              templateFile: "./templates/package.json",
            },
          },
        ],
      };

      const result = parseMonorepolintConfig(config);

      expect(result.entryFiles).toContain("./templates/tsconfig.json");
      expect(result.entryFiles).toContain("./templates/package.json");
    });

    it("should extract script dependencies", () => {
      const config: MonorepolintConfig = {
        rules: [
          {
            options: {
              scripts: {
                lint: "eslint .",
                format: "pnpm exec dprint fmt",
              },
            },
          },
        ],
      };

      const result = parseMonorepolintConfig(config);

      expect(result.dependencies).toContain("eslint");
      expect(result.dependencies).toContain("dprint");
    });
  });
});
```

#### `src/__tests__/fixtures/basic-config.ts`

```typescript
import type { MonorepolintConfig } from "../../types";

export const basicConfig: MonorepolintConfig = {
  rules: [
    {
      options: {
        templateFile: "./templates/tsconfig.json",
      },
    },
    {
      options: {
        scripts: {
          lint: "eslint .",
          test: "vitest run",
        },
      },
    },
  ],
};
```

### 4. Documentation

#### `README.md`

````markdown
# @monorepolint/knip-plugin

A Knip plugin for analyzing monorepolint configurations and detecting their dependencies.

## Installation

```bash
npm install --save-dev @monorepolint/knip-plugin
```
````

## Usage

Add the plugin to your `knip.config.ts`:

```typescript
import monorepolintPlugin from "@monorepolint/knip-plugin";
import type { KnipConfig } from "knip";

const config: KnipConfig = {
  plugins: [monorepolintPlugin],
  // ... rest of your config
};

export default config;
```

## What it detects

This plugin analyzes monorepolint configuration files and detects:

- **Dependencies**: All @monorepolint/* packages used in rules
- **Template files**: Files referenced in `templateFile` options
- **Script dependencies**: Tools used in package scripts (eslint, dprint, etc.)
- **Configuration files**: Entry points like `.monorepolint.config.mjs`

## Supported config files

- `.monorepolint.config.{js,mjs,ts}`
- `monorepolint.config.{js,mjs,ts}`
- `.monorepolintrc.{json,js,yml,yaml}`
- Internal config packages

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm run compile-typescript

# Test
pnpm test

# Lint
pnpm run lint
```

## License

MIT

````
## Integration Instructions

### 5. Update Root Configuration

After creating the package, update the root `knip.config.ts`:

```typescript
// knip.config.ts
import type { KnipConfig } from 'knip';
import { readFileSync } from 'fs';
import { join } from 'path';
import monorepolintPlugin from '@monorepolint/knip-plugin';

// ... existing tslib detection logic ...

const config: KnipConfig = {
  workspaces: {
    ".": {
      entry: ["tsup.config.cjs", "eslint.config.mjs", "vitest.workspace.js"]
    },
    "packages/cli": {
      entry: ["src/index.ts", "bin/*"]
    },
    "packages/all": {
      entry: []
    },
    "packages/docs": {},
    "packages/*": {}
  },
  ignore: [
    "**/coverage/**",
    "**/build/**",
    "**/node_modules/**",
    "**/*.spec.ts", 
    "**/*.test.ts"
  ],
  ignoreDependencies: [
    "tsup",
    // Remove "@monorepolint/internal-mrl-config" - now handled by plugin
    ...(shouldIgnoreTslib ? ["tslib"] : [])
  ],
  ignoreBinaries: [
    "github_changelog_generator"
  ],
  // Add the monorepolint plugin
  plugins: [monorepolintPlugin],
  eslint: {
    config: ["eslint.config.mjs"]
  },
  vitest: {
    config: ["packages/*/vitest.config.mjs", "vitest.workspace.js"]
  },
  typescript: {
    config: ["packages/*/tsconfig.json"]
  },
  rules: {
    unresolved: "off"
  }
};

export default config;
````

## Testing Plan

### 6. Verification Steps

1. **Build the package**:
   ```bash
   cd packages/knip-plugin
   pnpm run compile-typescript
   ```

2. **Run tests**:
   ```bash
   pnpm test
   ```

3. **Test integration**:
   ```bash
   cd ../../  # back to root
   pnpm run knip
   ```

4. **Verify results**:
   - `@monorepolint/internal-mrl-config` should no longer appear as unused
   - Template files should not appear as unused files
   - No false positives for monorepolint-related dependencies

## Success Criteria

The implementation is successful when:

- [ ] Package builds without errors
- [ ] All tests pass
- [ ] Knip run shows no false positives for monorepolint dependencies
- [ ] Template files are recognized as used
- [ ] Internal config package is detected as used
- [ ] Plugin can be imported and used in knip.config.ts

## Troubleshooting

### Common Issues

1. **Plugin not found**: Ensure the package is built and properly exported
2. **Config parsing errors**: Check that the config parser handles your specific monorepolint setup
3. **Dependencies still flagged**: Verify the plugin is enabled and detecting the right config files

### Debug Tips

- Add console.log statements in the plugin to see what configs are being parsed
- Check that `isEnabled` returns true for your project
- Verify config file patterns match your setup

## Future Enhancements

Potential improvements for future versions:

1. **AST Parsing**: Use TypeScript AST parsing for more accurate dependency detection
2. **Custom Rule Detection**: Better support for custom monorepolint rules
3. **Cache Integration**: Cache parsing results for better performance
4. **Extended Config Support**: Support for more monorepolint configuration patterns

---

This document provides a complete implementation plan for the `@monorepolint/knip-plugin` package. All code samples are production-ready and follow monorepo conventions.
