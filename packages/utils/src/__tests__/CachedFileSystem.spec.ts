/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as nodeFs from "fs"; // tslint:disable-line:import-blacklist
import * as nodePath from "path";
import * as tmp from "tmp";
import { CachedFileSystem } from "../CachedFileSystem";

describe(CachedFileSystem, () => {
  let tmpDir: tmp.DirResult;
  let cachedFs: CachedFileSystem;
  let oldWorkingDir: string;

  beforeEach(() => {
    tmpDir = tmp.dirSync();
    oldWorkingDir = process.cwd();
    process.chdir(tmpDir.name);
    cachedFs = new CachedFileSystem();
  });

  afterEach(() => {
    process.chdir(oldWorkingDir);
    tmpDir.removeCallback();
  });

  it("properly writes", () => {
    const filePath = nodePath.join(tmpDir.name, "hello.json");
    cachedFs.writeJson(filePath, { hello: "world" });
    cachedFs.flush();

    expect(nodeFs.existsSync(filePath)).toBe(true);
    expect(JSON.parse(nodeFs.readFileSync(filePath, "utf-8"))).toEqual({ hello: "world" });
  });

  it("properly overwrites", () => {
    const filePath = nodePath.join(tmpDir.name, "hello.json");
    cachedFs.writeJson(filePath, { hello: "world" });
    cachedFs.writeFile(filePath, "{}");
    cachedFs.flush();

    expect(nodeFs.existsSync(filePath)).toBe(true);
    expect(JSON.parse(nodeFs.readFileSync(filePath, "utf-8"))).toEqual({});
  });

  it("properly fails if directory doesnt exist", () => {
    const filePath = nodePath.join(tmpDir.name, "fakeDir", "hello.json");
    cachedFs.writeFile(filePath, "nothing");
    expect(() => cachedFs.flush()).toThrow();
  });

  it("properly creates directories", () => {
    const dirPath = nodePath.join(tmpDir.name, "fakeDir", "with", "children");

    cachedFs.mkdir(dirPath, { recursive: true });
    cachedFs.flush();

    expect(nodeFs.existsSync(dirPath)).toBeTruthy();
  });

  it("handles relative writes", () => {
    cachedFs.writeFile("./a.json", "{}");
    const contentsRelative = cachedFs.readFile("./a.json", "utf8");
    const contentsFull = cachedFs.readFile(nodePath.join(tmpDir.name, "a.json"), "utf8");

    expect(contentsRelative).toBe("{}");
    expect(contentsFull).toBe("{}");
  });

  it("deletes unlinked files", () => {
    cachedFs.writeFile("./a.json", "{}");
    cachedFs.unlink("./a.json");
    cachedFs.flush();

    expect(() => nodeFs.readFileSync("./a.json")).toThrow();
  });

  it("writes a file if it was unlinked first", () => {
    cachedFs.unlink("./a.json");
    cachedFs.writeFile("./a.json", "{}");
    cachedFs.flush();

    expect(nodeFs.readFileSync("./a.json", "utf8")).toBe("{}");
  });

  it("handles read after an unlink of a real file", () => {
    nodeFs.writeFileSync("a.json", "{}", "utf8");

    expect(cachedFs.exists("a.json")).toBe(true);
    expect(cachedFs.readFile("a.json", "utf8")).toBe("{}");

    cachedFs.unlink("a.json"); // deleted in memory not on disk
    expect(nodeFs.readFileSync("a.json", "utf8")).toBe("{}");

    expect(cachedFs.exists("a.json")).toBe(false);
    expect(() => cachedFs.readFile("a.json")).toThrow();

    cachedFs.flush();
    expect(() => nodeFs.readFileSync("a.json")).toThrow();
  });
});
