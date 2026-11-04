import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { assertNoPrereleaseOnLatest, computeTag, readPreState } from "./publish-tag.mjs";

describe("readPreState", () => {
  let root;
  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), "publish-tag-"));
    mkdirSync(path.join(root, ".changeset"));
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it("returns undefined when pre.json is absent", () => {
    assert.equal(readPreState(root), undefined);
  });

  it("parses pre.json when present", () => {
    writeFileSync(
      path.join(root, ".changeset", "pre.json"),
      JSON.stringify({ mode: "pre", tag: "alpha" }),
    );
    assert.deepEqual(readPreState(root), { mode: "pre", tag: "alpha" });
  });

  it("throws on malformed pre.json instead of falling back to latest", () => {
    writeFileSync(path.join(root, ".changeset", "pre.json"), "{ not json");
    assert.throws(() => readPreState(root), /not valid JSON/);
  });
});

describe("computeTag", () => {
  it("uses the pre tag in pre mode", () => {
    assert.equal(computeTag({ mode: "pre", tag: "alpha" }), "alpha");
  });

  it("uses the pre tag in exit mode (versions are still pre-releases)", () => {
    assert.equal(computeTag({ mode: "exit", tag: "beta" }), "beta");
  });

  it("uses latest when there is no pre state", () => {
    assert.equal(computeTag(undefined), "latest");
  });

  it("throws when pre.json has no usable tag", () => {
    assert.throws(() => computeTag({ mode: "pre" }), /no usable "tag"/);
    assert.throws(() => computeTag({ mode: "pre", tag: "" }), /no usable "tag"/);
    assert.throws(() => computeTag(null), /no usable "tag"/);
  });
});

describe("assertNoPrereleaseOnLatest", () => {
  const stable = { name: "a", version: "1.0.0" };
  const pre = { name: "b", version: "1.1.0-alpha.3" };
  const privatePre = { name: "c", version: "1.1.0-alpha.3", private: true };

  it("throws when latest would receive a public pre-release", () => {
    assert.throws(() => assertNoPrereleaseOnLatest("latest", [stable, pre]), /b@1\.1\.0-alpha\.3/);
  });

  it("allows stable versions and private pre-releases on latest", () => {
    assert.doesNotThrow(() => assertNoPrereleaseOnLatest("latest", [stable, privatePre]));
  });

  it("allows build metadata on latest", () => {
    assert.doesNotThrow(() =>
      assertNoPrereleaseOnLatest("latest", [{ name: "d", version: "1.0.0+build.5" }])
    );
  });

  it("allows pre-releases on a non-latest tag", () => {
    assert.doesNotThrow(() => assertNoPrereleaseOnLatest("alpha", [pre]));
  });
});
