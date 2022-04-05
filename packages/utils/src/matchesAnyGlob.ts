/*!
 * Copyright 2022 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { makeRe } from "micromatch";
import { nanosecondsToSanity } from "./nanosecondsToSanity";
import { Table } from "./Table";

const cache = new Map<readonly string[], Map<string, boolean>>();
let haystackMiss = 0;
let haystackHit = 0;
let singleMatcherSaves = 0;

let matchTime = BigInt(0);

const singleMatcherCache = new Map<string, Map<string, boolean>>();
let singleMatcherHits = 0;
let singleMatcherMisses = 0;

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
      //   result = needleInPattern(needle, pattern);
      let patternCache = singleMatcherCache.get(pattern);
      if (patternCache === undefined) {
        patternCache = new Map<string, boolean>();
        singleMatcherCache.set(pattern, patternCache);
      }

      // N.B. true/false/undefined
      result = patternCache.get(needle);
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
  //   table.addRow("")
  table.print();
};

const compiledGlobCache = new Map<string, RegExp>();

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
