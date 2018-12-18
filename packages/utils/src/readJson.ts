import { readFileSync } from "fs";

export function readJson(path: string) {
  const contents = readFileSync(path, "utf-8");
  return JSON.parse(contents);
}
