/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Host } from "./Host.js";
export function mutateJson<T extends object>(path: string, host: Host, mutator: (f: T) => T) {
  let file = host.readJson(path) as T;
  file = mutator(file);
  host.writeJson(path, file);
}
