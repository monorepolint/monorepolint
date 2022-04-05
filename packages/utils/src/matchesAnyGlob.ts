/*!
 * Copyright 2022 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { makeRe } from "micromatch";
import { nanosecondsToSanity } from "./nanosecondsToSanity";
import { Table } from "./Table";

// This file requires a LOT of caching to be performant. We have three layers to avoid work.

/**
 * Multimap cache of whether a needle was found in the glob haystack. Short circuits many
 * individual checks against the globs.
 */
const cache = new Map</* haystack */ readonly string[], Map</* needle */ string, /* result */ boolean>>();

/**
 * Multimap cache of whether a needle matches a glob. Allows us to avoid regexp's.
 */
const singleMatcherCache = new Map</* glob */ string, Map</* needle */ string, /* result*/ boolean>>();

/**
 * Cache of glob to regular expression. Compiling the regular expression is expensive.
 */
const compiledGlobCache = new Map</* glob */ string, RegExp>();

let haystackMiss = 0;
let haystackHit = 0;

let matchTime = BigInt(0);

let singleMatcherHits = 0;
let singleMatcherMisses = 0;
let singleMatcherSaves = 0; // hits + hits you would have had if the haystack didn't save you

interface MatchesAnyGlob {
  (needle: string, haystack: readonly string[]): boolean | undefined;
  printStats?: () => void;
}
export const matchesAnyGlob: MatchesAnyGlob = function matchesAnyGlobFunc(needle: string, haystack: readonly string[]) {
  matchTime -= process.hrtime.bigint();

  let cacheForHaystack = cache.get(haystack);
  if (cacheForHaystack === undefined) {
    cacheForHaystack = new Map<string, boolean>();
    cache.set(haystack, cacheForHaystack);
  }

  let result = cacheForHaystack!.get(needle);
  if (result === undefined) {
    haystackMiss++;
    result = false;
    for (const pattern of haystack) {
      //   result = needleInPattern(needle, pattern); // commented out as a reminder to update both
      // BEGIN INLINE of needleInPattern
      let patternCache = singleMatcherCache.get(pattern);
      if (patternCache === undefined) {
        patternCache = new Map<string, boolean>();
        singleMatcherCache.set(pattern, patternCache);
      }

      // N.B. true/false/undefined
      result = patternCache.get(needle); // only thing different from the inline is we need to reuse `result`
      if (result === undefined) {
        let regexp = compiledGlobCache.get(pattern);
        if (regexp === undefined) {
          regexp = makeRe(pattern);
          compiledGlobCache.set(pattern, regexp);
        }

        singleMatcherMisses++;
        result = regexp.test(needle);
        patternCache.set(needle, result);
      } else {
        singleMatcherHits++;
        singleMatcherSaves++;
      }
      // END INLINE of needleInPattern
      if (result) break;
    }
    cacheForHaystack!.set(needle, result);
  } else {
    singleMatcherSaves += haystack.length;
    haystackHit++;
  }
  matchTime += process.hrtime.bigint();
  return result;
};

matchesAnyGlob.printStats = () => {
  const table = new Table<[string, string]>({
    title: "matchesAnyGlob stats",
    showHeader: true,
    showFooter: false,
    columns: [
      { header: "Stat", type: "string" },
      { header: "Value", type: "string" },
    ],
  });
  table.addRow("Haystack Miss", "" + haystackMiss);
  table.addRow("Haystack Hit", "" + haystackHit);
  table.addRow("Single Glob Hits", "" + singleMatcherHits);
  table.addRow("Single Glob Misses", "" + singleMatcherMisses);
  table.addRow("Single Glob Saves", "" + singleMatcherSaves);
  table.addRow("Total Time", nanosecondsToSanity(matchTime, 6));

  table.print();
};

/**
 * @deprecated Don't use this directly. We manually inline it above
 */
export function needleInPattern(needle: string, pattern: string) {
  // benchmark says the uncommented version is best
  // https://jsben.ch/Y8TWs

  // option 2
  let patternCache = singleMatcherCache.get(pattern);
  if (patternCache === undefined) {
    patternCache = new Map<string, boolean>();
    singleMatcherCache.set(pattern, patternCache);
  }

  // N.B. true/false/undefined
  let result = patternCache.get(needle);
  if (result === undefined) {
    let regexp = compiledGlobCache.get(pattern);
    if (regexp === undefined) {
      regexp = makeRe(pattern);
      compiledGlobCache.set(pattern, regexp);
    }

    singleMatcherMisses++;
    result = regexp.test(needle);
    patternCache.set(needle, result);
  } else {
    singleMatcherHits++;
    singleMatcherSaves++;
  }

  return result;
}
