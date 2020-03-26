/*!
 * Copyright 2020 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { dirname } from "path";

/**
 * Given a path and a root path, return a list of all subpaths up to
 * the root.
 *
 * Given "/a/b/c", "/a", returns "/a/b" and "/a/b/c" but not "/a"
 * @param path
 * @param root
 */
export function getPathsAfterRoot(path: string, root: string) {
  if (path === root) {
    return [];
  }
  const dirs = [path];

  path = dirname(path);

  while (path !== root) {
    dirs.unshift(path);
    path = dirname(path);
  }

  return dirs;
}
