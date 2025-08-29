import type { KnipConfig } from 'knip';
import { readFileSync } from 'fs';
import { join } from 'path';

// Helper function to check if importHelpers is enabled in a tsconfig
function hasTslibImportHelpers(configPath: string): boolean {
  try {
    const content = readFileSync(configPath, 'utf-8');
    // Simple JSONC parsing - remove comments and trailing commas
    const cleanContent = content
      .replace(/\/\/.*$/gm, '') // Remove single line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    const config = JSON.parse(cleanContent);
    
    // Check direct importHelpers setting
    if (config.compilerOptions?.importHelpers === true) {
      return true;
    }
    
    // Check extended config if present
    if (config.extends) {
      try {
        const extendedPath = config.extends.startsWith('.') 
          ? join(process.cwd(), config.extends)
          : config.extends;
        return hasTslibImportHelpers(extendedPath);
      } catch {
        // If we can't read the extended config, assume no importHelpers
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.warn(`Could not parse ${configPath}:`, error.message);
    return false;
  }
}

// Check if any tsconfig has importHelpers enabled
const shouldIgnoreTslib = hasTslibImportHelpers('tsconfig.base.json');

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
    "@monorepolint/internal-mrl-config",
    // Conditionally ignore tslib if importHelpers is enabled
    ...(shouldIgnoreTslib ? ["tslib"] : [])
  ],
  ignoreBinaries: [
    "github_changelog_generator"
  ],
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