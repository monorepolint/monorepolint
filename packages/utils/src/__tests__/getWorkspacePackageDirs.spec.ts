/*!
 * Copyright 2026 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import * as realfs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { getWorkspacePackageDirs } from "../getWorkspacePackageDirs.js";
import { Host } from "../Host.js";

function makeHost(): Pick<Host, "readJson" | "exists"> {
  return {
    readJson: (filename: string) => JSON.parse(realfs.readFileSync(filename, "utf-8")),
    exists: (p: string) => realfs.existsSync(p),
  };
}

function writePackage(baseDir: string, relativeDir: string, name: string) {
  const dir = path.join(baseDir, relativeDir);
  realfs.mkdirSync(dir, { recursive: true });
  realfs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ name, version: "0.0.0" }),
    { encoding: "utf-8" },
  );
}

function writeRootPackageJson(baseDir: string, workspaces: unknown) {
  realfs.writeFileSync(
    path.join(baseDir, "package.json"),
    JSON.stringify({ name: "root", version: "0.0.0", private: true, workspaces }),
    { encoding: "utf-8" },
  );
}

describe(getWorkspacePackageDirs, () => {
  let baseDir: string;
  let host: Pick<Host, "readJson" | "exists">;

  beforeEach(() => {
    // Resolve symlinks (e.g. macOS's /tmp -> /private/tmp) up front so paths compared
    // internally by getWorkspacePackageDirs (which realpath's the pnpm workspace root)
    // agree with the workspaceDir we pass in below.
    baseDir = realfs.realpathSync(
      realfs.mkdtempSync(path.join(os.tmpdir(), "mrl-gwpd-test")),
    );
    host = makeHost();
  });

  describe("non-pnpm (yarn/npm workspaces) workspaces", () => {
    it("expands a plain glob pattern like packages/*", async () => {
      writeRootPackageJson(baseDir, ["packages/*"]);
      writePackage(baseDir, "packages/foo", "foo");
      writePackage(baseDir, "packages/bar", "bar");

      const result = await getWorkspacePackageDirs(host, baseDir);

      expect(result.sort()).toEqual(["packages/bar", "packages/foo"]);
    });

    it("resolves a literal directory name pattern", async () => {
      writeRootPackageJson(baseDir, ["apps/main"]);
      writePackage(baseDir, "apps/main", "main");

      const result = await getWorkspacePackageDirs(host, baseDir);

      expect(result).toEqual(["apps/main"]);
    });

    it("skips a directory that matches the glob but has no package.json", async () => {
      writeRootPackageJson(baseDir, ["packages/*"]);
      writePackage(baseDir, "packages/foo", "foo");
      realfs.mkdirSync(path.join(baseDir, "packages", "no-package-json"), {
        recursive: true,
      });

      const result = await getWorkspacePackageDirs(host, baseDir);

      expect(result).toEqual(["packages/foo"]);
    });

    it("returns paths relative to workspaceDir by default", async () => {
      writeRootPackageJson(baseDir, ["packages/*"]);
      writePackage(baseDir, "packages/foo", "foo");

      const result = await getWorkspacePackageDirs(host, baseDir);

      expect(result).toEqual(["packages/foo"]);
    });

    it("resolves absolute paths when resolvePaths is true", async () => {
      writeRootPackageJson(baseDir, ["packages/*"]);
      writePackage(baseDir, "packages/foo", "foo");

      const result = await getWorkspacePackageDirs(host, baseDir, true);

      expect(result).toEqual([path.resolve(baseDir, "packages/foo")]);
    });

    it("supports the { packages: [...] } workspaces object form", async () => {
      writeRootPackageJson(baseDir, { packages: ["packages/*"] });
      writePackage(baseDir, "packages/foo", "foo");

      const result = await getWorkspacePackageDirs(host, baseDir);

      expect(result).toEqual(["packages/foo"]);
    });

    it("excludes directories matched by a negated pattern (regression for #489)", async () => {
      writeRootPackageJson(baseDir, ["packages/*", "!packages/excluded"]);
      writePackage(baseDir, "packages/foo", "foo");
      writePackage(baseDir, "packages/excluded", "excluded");

      const result = await getWorkspacePackageDirs(host, baseDir);

      expect(result.sort()).toEqual(["packages/foo"]);
    });
  });

  describe("pnpm workspaces", () => {
    it("expands packages listed in pnpm-workspace.yaml", async () => {
      writeRootPackageJson(baseDir, undefined);
      realfs.writeFileSync(
        path.join(baseDir, "pnpm-workspace.yaml"),
        "packages:\n  - packages/*\n",
        { encoding: "utf-8" },
      );
      writePackage(baseDir, "packages/foo", "foo");
      writePackage(baseDir, "packages/bar", "bar");

      const result = await getWorkspacePackageDirs(host, baseDir);

      expect(result.map((p) => path.basename(p)).sort()).toEqual(["bar", "foo"]);
    });
  });
});
