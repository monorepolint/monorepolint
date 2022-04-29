/*!
 * Copyright 2022 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
// tslint:disable:no-console

import { Table } from "./Table";

export class AggregateTiming {
  #data = new Map<string, { count: number; total: bigint }>();
  #last: { count: number; total: bigint } | undefined;

  constructor(private title: string) {}

  public start(name: string) {
    const time = process.hrtime.bigint();
    if (this.#last) {
      this.#last.total += time;
    }

    let data = this.#data.get(name);
    if (data === undefined) {
      data = { count: 1, total: -time };
      this.#data.set(name, data);
    } else {
      data.total -= time;
      data.count++;
    }
    this.#last = data;
  }

  public stop() {
    const time = process.hrtime.bigint();
    if (this.#last) {
      this.#last.total += time;
      this.#last = undefined;
    }
  }

  public printResults() {
    const table = new Table<[bigint, string, bigint, bigint]>({
      sortColumn: -1,
      showFooter: true,
      showHeader: true,
      title: this.title,
      columns: [
        {
          header: "Duration",
          type: "bigint",
          renderAs: "nanoseconds",
          footer: { aggregate: "sum" },
        },
        { header: "Task", type: "string", alignment: "left", footer: "TOTAL" },
        { header: "Count", type: "bigint", footer: { aggregate: "sum" } },
        { header: "Avg", type: "bigint", footer: { aggregate: "average" } },
      ],
    });

    for (const [name, value] of this.#data) {
      table.addRow(
        value.total,
        name,
        BigInt(value.count), // fixme this can be a number later
        value.total / BigInt(value.count)
      );
    }
    table.print();
  }
}
