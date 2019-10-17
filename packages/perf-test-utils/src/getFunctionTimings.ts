/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { performance } from "perf_hooks";

export interface FunctionTimings {
  max: number;
  min: number;
  mean: number;
  std: number;
  median: number;
  sampleSize: number;
}

export interface FunctionTimingParams {
  func: () => Promise<void>;
  before?: () => Promise<void>;
  after?: () => Promise<void>;
  sampleSize?: number;
}

const DEFAULT_SAMPLE_SIZE = 100;

export async function getFunctionTimings(params: FunctionTimingParams): Promise<FunctionTimings> {
  const durations = await timeFunction(params);

  const max = Math.max(...durations);
  const min = Math.min(...durations);

  // mean
  const sum = durations.reduce((total, duration) => total + duration, 0);
  const mean = sum / durations.length;

  // std
  const squareDiffs = durations.map(duration => Math.pow(duration - mean, 2));
  const squareDiffSum = squareDiffs.reduce((total, duration) => total + duration, 0);
  const squareDiffMean = squareDiffSum / squareDiffs.length;
  const std = Math.sqrt(squareDiffMean);

  const median = calcMedian(...durations);

  return {
    max,
    min,
    mean,
    std,
    median,
    sampleSize: durations.length,
  };
}

/**
 * Calls a function 'sampleSize' of times and returns the duration per run
 */
export async function timeFunction({
  func,
  before,
  after,
  sampleSize,
}: {
  func: () => Promise<void>;
  before?: () => Promise<void>;
  after?: () => Promise<void>;
  sampleSize?: number;
}): Promise<number[]> {
  const resolvedSampleSize = sampleSize === undefined ? DEFAULT_SAMPLE_SIZE : sampleSize;

  const durations: number[] = [];

  for (let i = 0; i < resolvedSampleSize; i++) {
    // we manually do performance.now instead of using a
    // PerformanceObserver since it does a better job measuring
    // wall time when using async/await
    if (before !== undefined) {
      await before();
    }
    const start = performance.now();
    await func();
    durations.push(performance.now() - start);
    if (after !== undefined) {
      await after();
    }
  }

  return durations;
}

function calcMedian(...values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  values.sort((a, b) => a - b);

  const half = Math.floor(values.length / 2);

  if (values.length % 2) {
    return values[half];
  }

  return (values[half - 1] + values[half]) / 2.0;
}
