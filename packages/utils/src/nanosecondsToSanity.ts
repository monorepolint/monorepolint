/*!
 * Copyright 2022 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

export function nanosecondsToSanity(n: bigint, precision: number = 9) {
  return n / BigInt(1000000000) + "."
    + ("" + (n % BigInt(1000000000))).padStart(9, "0").substring(0, precision)
    + "s";
}
