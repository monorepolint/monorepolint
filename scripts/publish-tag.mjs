// Publishes every public workspace package with `pnpm publish -r`, under the
// npm dist-tag that matches the changesets pre-release state:
//
// - `.changeset/pre.json` present: its `tag` (e.g. "alpha"). This holds in
//   mode "exit" too, because the versions on disk stay pre-releases until
//   `changeset version` deletes pre.json.
// - `.changeset/pre.json` absent: "latest".
//
// Without `--tag`, `pnpm publish -r` uses "latest", which moved npm's `latest`
// to every alpha published from pre mode.
//
// Extra arguments are passed through to `pnpm publish -r`
// (e.g. `--dry-run`).

import { getPackages } from "@manypkg/get-packages";
import { spawnSync } from "node:child_process";
import console from "node:console";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

/**
 * Reads `.changeset/pre.json` under `rootDir`.
 * @param {string} rootDir
 * @returns {unknown} the parsed file, or undefined when it does not exist
 */
export function readPreState(rootDir) {
  const preJsonPath = path.join(rootDir, ".changeset", "pre.json");
  let text;
  try {
    text = readFileSync(preJsonPath, "utf8");
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "ENOENT") return undefined;
    throw e;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`${preJsonPath} is not valid JSON: ${e instanceof Error ? e.message : e}`, {
      cause: e,
    });
  }
}

/**
 * Picks the npm dist-tag for a publish.
 * @param {unknown} preState the parsed pre.json, or undefined when it does not exist
 * @returns {string}
 */
export function computeTag(preState) {
  if (preState === undefined) return "latest";
  const tag = preState && typeof preState === "object" && "tag" in preState
    ? preState.tag
    : undefined;
  if (typeof tag !== "string" || tag.trim() === "") {
    throw new Error(
      `.changeset/pre.json exists but has no usable "tag" (got ${JSON.stringify(tag)})`,
    );
  }
  return tag;
}

/**
 * Throws if `tag` is "latest" but a public package is about to publish a pre-release
 * version, so a pre-release can never become npm's `latest`.
 * @param {string} tag
 * @param {{ name: string; version: string; private?: boolean }[]} packageJsons
 */
export function assertNoPrereleaseOnLatest(tag, packageJsons) {
  if (tag !== "latest") return;
  const offenders = packageJsons.filter(
    (pkg) => !pkg.private && /^\d+\.\d+\.\d+-/.test(pkg.version),
  );
  if (offenders.length > 0) {
    throw new Error(
      `Refusing to publish pre-release versions under the "latest" dist-tag: ${
        offenders.map((pkg) => `${pkg.name}@${pkg.version}`).join(", ")
      }. Enter pre mode (changeset pre enter <tag>) or version them as stable first.`,
    );
  }
}

async function main() {
  const { rootDir, packages } = await getPackages(process.cwd());
  const tag = computeTag(readPreState(rootDir));
  assertNoPrereleaseOnLatest(tag, packages.map((pkg) => pkg.packageJson));

  const args = ["publish", "-r", "--tag", tag, ...process.argv.slice(2)];
  console.error(`publish-tag: npm dist-tag "${tag}"; running pnpm ${args.join(" ")}`);
  const result = spawnSync("pnpm", args, { stdio: "inherit", cwd: rootDir });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((e) => {
    console.error(`publish-tag: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  });
}
