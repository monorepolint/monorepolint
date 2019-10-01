/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

export function createMockFiles() {
  const mockFiles: Map<string, string> = new Map();

  jest.mock("fs", () => ({
    writeFileSync: function writeFileSync(filePath: string, contents: string) {
      mockFiles.set(filePath, contents);
    },

    // tslint:disable-next-line: variable-name
    readFileSync: function readFileSync(filePath: string, _contentType: string) {
      return mockFiles.get(filePath);
    },
  }));

  return mockFiles;
}

export function jsonToString(obj: {}) {
  return JSON.stringify(obj, undefined, 2) + "\n";
}
