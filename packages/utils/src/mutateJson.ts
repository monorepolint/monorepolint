/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { readJson } from "./readJson";
import { writeJson } from "./writeJson";

export function mutateJson<T extends object>(path: string, mutator: (f: T) => T) {
  let file: T = readJson(path);
  file = mutator(file);
  writeJson(path, file);
}
