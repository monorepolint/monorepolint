export interface PackageJson {
  name?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  workspaces?:
    | {
        packages?: string[];
        nohoist?: string[];
      }
    | string[];
  [otherKey: string]: any;
}
