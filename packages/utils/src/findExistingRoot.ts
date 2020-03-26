/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import * as nodeFs from "fs"; // tslint:disable-line:import-blacklist
import { dirname } from "path";

/**
 * Given a path, find the longest subpath that exists.
 *
 * IE: `/exists/exists/does-not-exist` returns `/exists/exists`
 *
 * @param path
 */
export function findExistingRoot(path: string) {
  while (!nodeFs.existsSync(path)) {
    path = dirname(path);
  }
  return path;
}
