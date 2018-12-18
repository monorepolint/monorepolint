export interface PackageJson {
  name?: string;
  scripts?: {
    [key: string]: string;
  };
  dependencies?: {
    [dependency: string]: string;
  };
  devDependencies?: {
    [dependency: string]: string;
  };
  workspaces?:
    | {
        packages?: string[];
        nohoist?: string[];
      }
    | string[];
  [otherKey: string]: any;
}
