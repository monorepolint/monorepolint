// Smoke-tests the published shape of @monorepolint/cli.
//
// Packs @monorepolint/cli and every workspace package it depends on
// (transitively), installs all of those tarballs together into a temp project
// with npm, checks that npm used the local tarballs rather than registry
// copies, and then runs each bin through its installed node_modules/.bin link
// so the shebang line is exercised exactly as an end user would hit it.
//
// Run it after building (e.g. after `pnpm run ci`). Exits non-zero, printing
// the failing step's output, if any step fails.

import { spawnSync } from "node:child_process";
import console from "node:console";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENTRY = "@monorepolint/cli";

class StepError extends Error {}

function run(step, cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, encoding: "utf-8" });
  if (result.error || result.status !== 0) {
    throw new StepError(
      [
        `${step} failed: ${cmd} ${args.join(" ")} (in ${cwd})`,
        result.error ? `error: ${result.error.message}` : `exit status: ${result.status}`,
        `--- stdout ---\n${result.stdout ?? ""}`,
        `--- stderr ---\n${result.stderr ?? ""}`,
      ].join("\n"),
    );
  }
  return result.stdout;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function readWorkspacePackages() {
  const packagesDir = path.join(ROOT, "packages");
  const byName = new Map();
  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    const pkgJsonPath = path.join(packagesDir, entry.name, "package.json");
    if (!entry.isDirectory() || !fs.existsSync(pkgJsonPath)) continue;
    const pkg = readJson(pkgJsonPath);
    byName.set(pkg.name, { dir: path.dirname(pkgJsonPath), pkg });
  }
  return byName;
}

function collectWorkspaceClosure(byName, entry) {
  const seen = new Set();
  const queue = [entry];
  while (queue.length > 0) {
    const name = queue.shift();
    if (seen.has(name)) continue;
    const ws = byName.get(name);
    if (!ws) throw new StepError(`resolve deps failed: ${name} is not a workspace package`);
    seen.add(name);
    for (const [dep, range] of Object.entries(ws.pkg.dependencies ?? {})) {
      if (range.startsWith("workspace:")) queue.push(dep);
    }
  }
  return [...seen];
}

function packAll(byName, names, packDir) {
  const tarballs = [];
  for (const name of names) {
    const before = new Set(fs.readdirSync(packDir));
    run(`pack ${name}`, "pnpm", ["pack", "--pack-destination", packDir], byName.get(name).dir);
    const created = fs.readdirSync(packDir).filter((f) => !before.has(f) && f.endsWith(".tgz"));
    if (created.length !== 1) {
      throw new StepError(`pack ${name} failed: expected 1 new tarball, found ${created.length}`);
    }
    tarballs.push(path.join(packDir, created[0]));
  }
  return tarballs;
}

function verifyLocalInstall(byName, names, installDir) {
  const lock = readJson(path.join(installDir, "package-lock.json"));
  const problems = [];
  for (const name of names) {
    const expected = byName.get(name).pkg.version;
    const entries = Object.entries(lock.packages ?? {}).filter(([p]) =>
      p === `node_modules/${name}` || p.endsWith(`/node_modules/${name}`)
    );
    if (entries.length === 0) problems.push(`${name}: not installed`);
    for (const [p, info] of entries) {
      if (info.version !== expected) {
        problems.push(`${p}: version ${info.version}, expected workspace version ${expected}`);
      }
      if (typeof info.resolved !== "string" || !info.resolved.startsWith("file:")) {
        problems.push(`${p}: resolved from ${info.resolved}, expected a local tarball (file:)`);
      }
    }
  }
  if (problems.length > 0) {
    throw new StepError(`verify local install failed:\n  ${problems.join("\n  ")}`);
  }
}

function main() {
  const byName = readWorkspacePackages();
  const names = collectWorkspaceClosure(byName, ENTRY);
  console.log(`Packing: ${names.join(", ")}`);

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mrl-smoke-"));
  try {
    const packDir = path.join(tmpRoot, "pack");
    const installDir = path.join(tmpRoot, "install");
    fs.mkdirSync(packDir);
    fs.mkdirSync(installDir);

    const tarballs = packAll(byName, names, packDir);

    fs.writeFileSync(
      path.join(installDir, "package.json"),
      JSON.stringify({ name: "mrl-smoke", private: true }, null, 2),
    );
    run("npm install", "npm", ["install", "--no-audit", "--no-fund", ...tarballs], installDir);
    verifyLocalInstall(byName, names, installDir);
    console.log("Installed local tarballs for all packages.");

    const bins = Object.keys(byName.get(ENTRY).pkg.bin ?? {});
    if (bins.length === 0) {
      throw new StepError(`run bins failed: ${ENTRY} declares no bin entries`);
    }
    for (const bin of bins) {
      const binPath = path.join(installDir, "node_modules", ".bin", bin);
      // Execute the link directly (not via `node`) so the OS honours the shebang.
      const out = run(`run ${bin}`, binPath, ["--help"], installDir);
      if (!/\bcheck\b/.test(out)) {
        throw new StepError(`run ${bin} failed: --help output lacks the check command:\n${out}`);
      }
      console.log(`${bin} --help: ok`);
    }
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

try {
  main();
  console.log("Packed CLI smoke test passed.");
} catch (e) {
  console.error(e instanceof StepError ? e.message : e);
  process.exitCode = 1;
}
