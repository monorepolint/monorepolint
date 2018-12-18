
export interface MonorepoLintConfig {
    verbose: boolean;
    fix: boolean;
    checks: ReadonlyArray<{
      type: string;
      args: any;
    }>;
  }
  