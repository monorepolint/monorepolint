/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Host } from "./Host";

export function mutateJson<T extends object>(path: string, host: Host, mutator: (f: T) => T) {
  let file: T = host.readJson(path);
  file = mutator(file);
  host.writeJson(path, file);
}
