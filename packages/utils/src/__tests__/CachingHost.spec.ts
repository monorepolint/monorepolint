/*!
 * Copyright 2022 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { describe, expect, it, beforeEach } from "@jest/globals";
import { CachingHost } from "../CachingHost.js";
import * as realfs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

interface TestCase<T> {
  getFs: () => T;
  createTmpDir: () => string;
}

class RealFsTestCase implements TestCase<typeof realfs> {
  getFs = () => {
    return realfs;
  };
  createTmpDir = () => {
    return realfs.mkdtempSync(path.join(os.tmpdir(), "mrl-test"));
  };
}

describe(CachingHost, () => {
  describe.each([["fs", new RealFsTestCase()]])("%s", (_testCaseName, testCase) => {
    let baseDir: string;
    let fs: ReturnType<typeof testCase.getFs>;

    let SYMLINK_JSON_PATH: string;
    let SYMLINK_TXT_PATH: string;
    let FILE_JSON_PATH: string;
    let FILE_TXT_PATH: string;

    beforeEach(() => {
      fs = testCase.getFs();
      baseDir = testCase.createTmpDir();

      SYMLINK_JSON_PATH = path.resolve(baseDir, "symlink.json");
      SYMLINK_TXT_PATH = path.resolve(baseDir, "symlink.txt");
      FILE_TXT_PATH = path.resolve(baseDir, "file.txt");
      FILE_JSON_PATH = path.resolve(baseDir, "file.json");

      fs.writeFileSync(FILE_JSON_PATH, JSON.stringify({ hi: "mom" }), { encoding: "utf-8" });
      fs.symlinkSync(FILE_JSON_PATH, SYMLINK_JSON_PATH);

      fs.writeFileSync(FILE_TXT_PATH, "hi dad", { encoding: "utf-8" });
      fs.symlinkSync(FILE_TXT_PATH, SYMLINK_TXT_PATH);
    });

    function expectFileToExist(file: string) {
      return expect(fs.existsSync(file));
    }

    function expectFileContents(file: string) {
      return expect(fs.readFileSync(file, { encoding: "utf-8" }));
    }

    function expectSymlinkTarget(src: string, target: string) {
      const stat = fs.lstatSync(src);
      expect(stat.isSymbolicLink() && fs.readlinkSync(src)).toEqual(target);
    }

    it("Answers exists() properly", async () => {
      expect.assertions(2);
      await realfs.promises.writeFile(path.join(baseDir, "b.txt"), "hi", { encoding: "utf-8" });
      const host = new CachingHost(fs as any);
      expect(host.exists(path.join(baseDir, "b.txt"))).toBe(true);
      expect(host.exists(path.join(baseDir, "nosuchfile.txt"))).toBe(false);
    });

    it("properly handles deletes", async () => {
      expect.assertions(2);
      const host = new CachingHost(fs as any);

      host.writeFile(path.join(baseDir, "b.txt"), "hi", { encoding: "utf-8" });
      host.deleteFile(path.join(baseDir, "b.txt"));
      host.deleteFile(path.join(baseDir, "a.json"));

      await host.flush();

      expectFileToExist(path.join(baseDir, "b.txt")).toBeFalsy();
      expectFileToExist(path.join(baseDir, "a.txt")).toBeFalsy();
    });

    it("handles simple read/write workflow", async () => {
      expect.assertions(1);

      const host = new CachingHost(fs as any);
      host.writeFile(FILE_JSON_PATH, "cow", { encoding: "utf-8" });

      expect(host.readFile(FILE_JSON_PATH, { encoding: "utf-8" })).toEqual("cow");
    });

    it("handles target symlink changing", async () => {
      expect.assertions(1);

      const host = new CachingHost(fs as any);
      host.writeFile(FILE_JSON_PATH, "cow", { encoding: "utf-8" });

      expect(host.readFile(FILE_JSON_PATH, { encoding: "utf-8" })).toEqual("cow");
    });

    it("handles writing symlinks properly", async () => {
      expect.assertions(8);

      const host = new CachingHost(fs as any);

      // file.json should now hold "hmm"
      host.writeFile(SYMLINK_JSON_PATH, "hmm", { encoding: "utf-8" });

      expect(host.readFile(SYMLINK_JSON_PATH, { encoding: "utf-8" })).toEqual("hmm");
      expect(host.readFile(FILE_JSON_PATH, { encoding: "utf-8" })).toEqual("hmm");

      // Write it out so we can verify disk is right
      await host.flush();

      expectFileToExist(SYMLINK_JSON_PATH).toBeTruthy();
      expectFileToExist(FILE_TXT_PATH).toBeTruthy();

      expectFileContents(FILE_JSON_PATH).toBe("hmm");
      expectFileContents(SYMLINK_JSON_PATH).toBe("hmm");

      expectSymlinkTarget(SYMLINK_JSON_PATH, FILE_JSON_PATH);

      expect(host.readFile(SYMLINK_JSON_PATH, { encoding: "utf-8" })).toEqual("hmm");
    });

    it("handles writing symlinks properly if you read it first", async () => {
      expect.assertions(8);

      const host = new CachingHost(fs as any);
      host.readFile(SYMLINK_JSON_PATH);

      // file.json should now hold "hmm"
      host.writeFile(path.join(baseDir, "symlink.json"), "hmm", { encoding: "utf-8" });

      expect(host.readFile(SYMLINK_JSON_PATH, { encoding: "utf-8" })).toEqual("hmm");
      expect(host.readFile(FILE_JSON_PATH, { encoding: "utf-8" })).toEqual("hmm");

      // Write it out so we can verify disk is right
      await host.flush();

      expectFileToExist(SYMLINK_JSON_PATH).toBeTruthy();
      expectFileToExist(FILE_TXT_PATH).toBeTruthy();

      expectFileContents(FILE_JSON_PATH).toBe("hmm");
      expectFileContents(SYMLINK_JSON_PATH).toBe("hmm");

      expectSymlinkTarget(SYMLINK_JSON_PATH, FILE_JSON_PATH);

      expect(host.readFile(SYMLINK_JSON_PATH, { encoding: "utf-8" })).toEqual("hmm");
    });

    it("handles creating new symlinks", async () => {
      expect.assertions(8);

      const host = new CachingHost(fs as any);

      host.readFile(SYMLINK_JSON_PATH);

      // file.json should now hold "hmm"
      host.writeFile(path.join(baseDir, "symlink.json"), "hmm", { encoding: "utf-8" });

      expect(host.readFile(SYMLINK_JSON_PATH, { encoding: "utf-8" })).toEqual("hmm");
      expect(host.readFile(FILE_JSON_PATH, { encoding: "utf-8" })).toEqual("hmm");

      // Write it out so we can verify disk is right
      await host.flush();

      expectFileToExist(SYMLINK_JSON_PATH).toBeTruthy();
      expectFileToExist(FILE_TXT_PATH).toBeTruthy();

      expectFileContents(FILE_JSON_PATH).toBe("hmm");
      expectFileContents(SYMLINK_JSON_PATH).toBe("hmm");

      expectSymlinkTarget(SYMLINK_JSON_PATH, FILE_JSON_PATH);

      expect(host.readFile(SYMLINK_JSON_PATH, { encoding: "utf-8" })).toEqual("hmm");
    });

    it("makes directories", async () => {
      expect.assertions(3);

      const host = new CachingHost(fs as any);

      host.mkdir(path.join(baseDir, "foo", "bar", "baz"), { recursive: true });

      // Write it out so we can verify disk is right
      await host.flush();

      expectFileToExist(path.join(baseDir, "foo")).toBeTruthy();
      expectFileToExist(path.join(baseDir, "foo", "bar")).toBeTruthy();
      expectFileToExist(path.join(baseDir, "foo", "bar", "baz")).toBeTruthy();
    });

    it("can unlink empty dirs", async () => {
      expect.assertions(1);

      // base setup
      const fooDirPath = path.join(baseDir, "foo");
      fs.mkdirSync(fooDirPath, { recursive: true });

      // prep obj
      const host = new CachingHost(fs as any);
      host.rmdir(fooDirPath);

      // Write it out so we can verify disk is right
      await host.flush();

      expectFileToExist(fooDirPath).toBeFalsy();
    });

    it("doesnt let you delete a directory with files", async () => {
      expect.assertions(2);

      const fooDirPath = path.join(baseDir, "foo");
      const barFilePath = path.join(fooDirPath, "bar.txt");

      const host = new CachingHost(fs as any);
      host.mkdir(fooDirPath, { recursive: true });
      host.writeJson(barFilePath, { hi: 5 });

      expect(() => {
        host.rmdir(fooDirPath);
      }).toThrow();

      // Write it out so we can verify disk is right
      await host.flush();

      expectFileToExist(fooDirPath).toBeTruthy();
    });

    it("doesn't let you rmdir() a file", () => {
      expect.assertions(1);
      const host = new CachingHost(fs as any);
      expect(() => {
        host.rmdir(FILE_JSON_PATH);
      }).toThrow();
    });
  });
});
