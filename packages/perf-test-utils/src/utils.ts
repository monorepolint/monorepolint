/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { setTimeout } from "timers";

/**
 * Promisify 'setTimeout'
 *
 * @param ms milliseconds to delay by
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}
