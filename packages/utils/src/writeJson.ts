/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { writeFileSync } from "fs";

export function writeJson(path: string, o: object) {
  return writeFileSync(path, JSON.stringify(o, undefined, 2) + "\n");
}
