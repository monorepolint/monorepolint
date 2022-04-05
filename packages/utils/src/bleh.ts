/*!
 * Copyright 2022 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { CachingHost } from "./CachingHost";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

(async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mrl-test"));

  const paths = {
    tmpDir,
    footxt: path.join(tmpDir, "foo.txt"),
    symlink_footxt: path.join(tmpDir, "symlink_foo.txt"),
    fooDir: path.join(tmpDir, "foo"),
    fooBarDir: path.join(tmpDir, "foo", "bar"),
    fooBazFile: path.join(tmpDir, "foo", "baz.txt"),
  };
  fs.writeFileSync(paths.footxt, "normal write", { encoding: "utf-8" });
  fs.symlinkSync(paths.footxt, paths.symlink_footxt);

  const host = new CachingHost(fs);
  host.mkdir(paths.fooDir, { recursive: true });
  host.writeFile(paths.fooBazFile, "Hi", { encoding: "utf-8" });
  host.rmdir(paths.fooDir);
  // const contents = host.readFile(paths.footxt, { encoding: "utf-8" });
  // console.log("contents", contents);

  // if (contents != "Hi") throw new Error("fck");
  if (true === true) throw new Error("FCUK THIS HSOULDNT BE");
  await host.flush();

  fs.readdirSync(paths.fooBarDir);
})();
