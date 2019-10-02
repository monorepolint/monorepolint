/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { existsSync, mkdirSync } from "fs";
import * as path from "path";

export function makeDirectoryRecursively(directoryPath: string) {
  // node < 10 doesn't support mkdirSync w/ recursive: true
  // so we manually do it instead
  const dirSegments = directoryPath.split(path.sep);
  for (let i = 0; i < dirSegments.length; i++) {
    if (dirSegments[i].length > 0) {
      // we skip the empty segment
      const curDirPath = dirSegments.slice(0, i + 1).join(path.sep);
      if (!existsSync(curDirPath)) {
        mkdirSync(curDirPath);
      }
    }
  }
}
