/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { FunctionTimingParams, FunctionTimings, getFunctionTimings } from "./getFunctionTimings";

/**
 * For each possible stat about timings, a tuple of expected value and an
 * acceptable error margin (0-1).
 */
export type ExpectedTimings = { [K in keyof FunctionTimings]?: [number, number] };

export interface PerfTestFunctionParams extends FunctionTimingParams {
  expectedTimings: ExpectedTimings;
  testName: string;
}

export interface TestResult {
  type: "success" | "failure";
  message: string;
}

export async function perfTestFunction({
  expectedTimings,
  testName,
  ...restParams
}: PerfTestFunctionParams): Promise<[FunctionTimings, TestResult[]]> {
  const timings = await getFunctionTimings(restParams);

  const results: TestResult[] = [];

  if (expectedTimings.max) {
    const [expectedMax, errorMargin] = expectedTimings.max;
    if (expectedMax > timings.max * (1 + errorMargin)) {
      results.push({
        type: "failure",
        message: `FAIL ${testName}
expected max: ${expectedMax}
error margin: -${errorMargin * 100}%
actual max: ${timings.max}`,
      });
    }
  }

  return [timings, {} as any];
}
