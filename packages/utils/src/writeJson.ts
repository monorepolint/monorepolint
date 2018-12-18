import { writeFileSync } from "fs";

export function writeJson(path: string, o: object) {
  return writeFileSync(path, JSON.stringify(o, undefined, 2) + "\n");
}
