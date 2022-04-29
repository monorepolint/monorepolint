/*!
 * Copyright 2022 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
// tslint:disable:no-console
import { Table } from "./Table";

export class Timing {
  #starts: Array<{ name?: string; start: bigint }> = [];
  constructor(private title: string) {
    this.stop(); // make sure we have starting point
  }

  public start(name: string) {
    this.#starts.push({ name, start: process.hrtime.bigint() });
  }

  public stop() {
    this.#starts.push({ start: process.hrtime.bigint() });
  }

  public printResults() {
    const table = new Table<[bigint, string]>({
      sortColumn: -1,
      showFooter: true,
      showHeader: true,
      title: this.title,
      columns: [
        {
          header: "Duration",
          type: "bigint",
          renderAs: "nanoseconds",
          precision: 4,
          footer: { aggregate: "sum" },
        },
        { header: "Task", type: "string", footer: "TOTAL" },
      ],
    });

    this.stop(); // be sure we stopped the last one

    let cur: { name?: string; start: bigint } = this.#starts[0];
    for (const entry of this.#starts) {
      if (cur.name) {
        const span = entry.start - cur.start;
        table.addRow(span, cur.name);
      }
      cur = entry;
    }

    table.print();
  }
}
