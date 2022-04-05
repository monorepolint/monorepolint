/*!
 * Copyright 2022 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
// tslint:disable:no-console
import { nanosecondsToSanity } from "./nanosecondsToSanity";

type QQ<HB, FB, H, F> = (HB extends true ? { header: H } : { header?: H }) &
  (FB extends true ? { footer: F } : { footer?: F });

type WithAlignemnt = { alignment?: "right" | "left" };
type BaseCellConfig = WithAlignemnt & { type: "bigint" | "string" };

type BaseBigIntCellConfig = {
  type: "bigint";
  renderAs?: "nanoseconds";
  precision?: number;
} & WithAlignemnt;
type BaseStringCellConfig = { type: "string" } & WithAlignemnt;

type BigIntColumnConfig<H, F> = WithAlignemnt &
  BaseBigIntCellConfig &
  QQ<H, F, string, AggregateFooterConfig | StaticFooterConfig>;

type StringColumnConfig<H, F> = WithAlignemnt & BaseStringCellConfig & QQ<H, F, string, StaticFooterConfig>;

type AggregateFooterConfig = {
  aggregate: "sum" | "average";
  renderAs?: "nanoseconds";
  precision?: number;
} & WithAlignemnt;

type StaticFooterConfig = StrictStaticFooterConfig | string;
type StrictStaticFooterConfig = {
  aggregate: "static";
  value: string;
} & WithAlignemnt;

type AnyStrictFooterConfig = AggregateFooterConfig | StrictStaticFooterConfig;

type TableConfig<T extends any[], H extends boolean, F extends boolean> = {
  sortColumn?: number;
  padding?: number;
  showHeader: H;
  showFooter: F;
  columns: {
    [K in keyof T]: T[K] extends bigint ? BigIntColumnConfig<H, F> : StringColumnConfig<H, F>;
  };
  title: string;
};

type InternalTableConfig = {
  padding: number;
  showHeader: boolean;
  showFooter: boolean;
  sortColumn?: number;
  columns: Array<BigIntColumnConfig<any, any> | StringColumnConfig<any, any>>;
  title: string;
};

export class Table<T extends any[]> {
  #rows: T[] = [];
  #config: InternalTableConfig;
  #columnWidths: number[] = [];
  #footer: Array<bigint | string> = [];
  #footerRowConfig?: Array<Required<BaseCellConfig> & AnyStrictFooterConfig>;
  #totalWidth = 0;

  constructor(
    config:
      | TableConfig<T, true, true>
      | TableConfig<T, true, false>
      | TableConfig<T, false, true>
      | TableConfig<T, false, false>
  ) {
    this.#config = {
      padding: 2,
      ...config,
    };
    this.#columnWidths.fill(0, 0, config.columns.length);

    if (config.showFooter) {
      this.#footerRowConfig = [];
      for (const columnConfig of config.columns) {
        if (columnConfig.footer === undefined) {
          throw new Error("Must specify footer fields when showFooter is true");
        } else if (typeof columnConfig.footer === "string") {
          this.#footerRowConfig.push({
            type: "string",
            alignment: "left",
            aggregate: "static",
            value: columnConfig.footer,
          });
        } else if ("value" in columnConfig.footer) {
          this.#footerRowConfig.push({
            type: "string",
            alignment: "left",
            ...columnConfig.footer,
          });
        } else if ("aggregate" in columnConfig.footer) {
          if (columnConfig.type !== "bigint") throw new Error("expecting bigint for aggregate");
          this.#footerRowConfig.push({
            type: columnConfig.type,
            renderAs: columnConfig.renderAs,
            precision: columnConfig.precision,
            alignment: "right",
            ...columnConfig.footer,
          });
        }
      }
    }
  }

  addRow(...data: T) {
    // TODO: maybe clone the data
    this.#rows.push(data);
  }

  #sumColumn(c: number) {
    let total = BigInt(0);
    for (const row of this.#rows) {
      total += row[c];
    }
    return total;
  }

  #updateFooterRow() {
    const footerRowConfig = this.#footerRowConfig;
    if (footerRowConfig) {
      for (let c = 0; c < footerRowConfig.length; c++) {
        const footerColConfig = footerRowConfig[c];

        switch (footerColConfig.aggregate) {
          case "sum":
            this.#footer[c] = this.#sumColumn(c);
            break;
          case "average":
            this.#footer[c] = this.#sumColumn(c) / BigInt(this.#rows.length);
            break;
          case "static":
            this.#footer[c] = footerColConfig.value;
            break;
        }
      }
    }
  }

  #calculateColumnWidths() {
    this.#columnWidths.fill(0, 0, this.#config.columns.length);

    for (let c = 0; c < this.#config.columns.length; c++) {
      const colConfig = this.#config.columns[c];
      this.#columnWidths[c] = Math.max(
        (this.#config.columns[c].header ?? "").length,
        ...this.#rows.map((a) => this.#getCellValueAsString(a[c], colConfig).length),
        this.#footer && this.#footerRowConfig
          ? this.#getCellValueAsString(this.#footer?.[c] ?? "", this.#footerRowConfig[c]).length
          : 0
      );
    }

    this.#totalWidth = 0;
    for (const colWidth of this.#columnWidths) {
      this.#totalWidth += colWidth;
    }
    this.#totalWidth += (this.#columnWidths.length - 1) * this.#config.padding;
  }

  #printSeparator(fillString: string) {
    const paddingString = "".padStart(this.#config.padding, " ");

    let hr2 = "";

    // tslint:disable-next-line: prefer-for-of
    for (let c = 0; c < this.#columnWidths.length; c++) {
      hr2 += "".padStart(this.#columnWidths[c], fillString) + paddingString;
    }
    hr2 = hr2.trimRight();
    console.log(hr2);
  }

  #printHeaderRow() {
    if (this.#config.showHeader) {
      const colConfigs = this.#config.columns;
      const paddingString = "".padStart(this.#config.padding, " ");

      let hr = "";
      for (let c = 0; c < colConfigs.length; c++) {
        const heading = colConfigs[c].header ?? "";
        hr += heading.padEnd(this.#columnWidths[c], " ") + paddingString;
      }
      hr = hr.trimRight();
      console.log(hr);

      this.#printSeparator("-");
    }
  }

  #printFooterRow() {
    const footerRow = this.#footer;
    if (footerRow) {
      this.#printSeparator("=");

      const paddingString = "".padStart(this.#config.padding, " ");

      let hr = "";
      for (let c = 0; c < footerRow.length; c++) {
        hr += this.#getCellValueAligned(footerRow[c], this.#footerRowConfig![c], c) + paddingString; // .padEnd(this.#columnWidths[c], " ") + paddingString;
      }
      hr = hr.trimRight();
      console.log(hr);
    }
  }

  print() {
    // let data = [...this.#rows];
    if (this.#config.sortColumn !== undefined) {
      // todo
    }

    this.#updateFooterRow();
    this.#calculateColumnWidths();

    console.log();
    console.log(`${this.#config.title}`);
    console.log("".padStart(this.#totalWidth, "="));

    const paddingString = "".padStart(this.#config.padding, " ");
    if (this.#config.showHeader) {
      this.#printHeaderRow();
    }

    for (let r = 0; r < this.#rows.length; r++) {
      let rowText = "";
      for (let c = 0; c < this.#config.columns.length; c++) {
        rowText += this.getEntryAsStringAligned(c, r) + paddingString;
      }
      rowText.trim();
      console.log(rowText);
    }

    if (this.#config.showFooter) this.#printFooterRow();
    console.log();
  }

  #getCellValueAsString(value: bigint | string, config: BaseBigIntCellConfig | BaseStringCellConfig) {
    if (config.type === "bigint" && config.renderAs === "nanoseconds") {
      return nanosecondsToSanity(value as bigint, config.precision ?? 9);
    } else {
      return "" + value;
    }
  }

  #getCellValueAligned(value: bigint | string, config: BaseBigIntCellConfig | BaseStringCellConfig, column: number) {
    let result: string;
    if (config.type === "bigint" && config.renderAs === "nanoseconds") {
      result = nanosecondsToSanity(value as bigint, config.precision ?? 9);
    } else {
      result = "" + value;
    }

    if (config.alignment === "left") {
      return result.padEnd(this.#columnWidths[column]);
    } else {
      return result.padStart(this.#columnWidths[column]);
    }
  }

  getEntryAsString(colNum: number, rowNum: number) {
    const config = this.#config.columns[colNum];

    if (config.type === "bigint" && config.renderAs === "nanoseconds") {
      return nanosecondsToSanity(this.#rows[rowNum][colNum], config.precision ?? 9);
    } else {
      return "" + this.#rows[rowNum][colNum];
    }
  }

  getEntryAsStringAligned(colNum: number, rowNum: number) {
    const config = this.#config.columns[colNum];

    let result: string;
    if (config.type === "bigint" && config.renderAs === "nanoseconds") {
      result = nanosecondsToSanity(this.#rows[rowNum][colNum], config.precision ?? 9);
    } else {
      result = "" + this.#rows[rowNum][colNum];
    }

    if (config.alignment === "left") {
      return result.padEnd(this.#columnWidths[colNum]);
    } else {
      return result.padStart(this.#columnWidths[colNum]);
    }
  }

  getColumnWidth(colNum: number, config: BigIntColumnConfig<boolean, boolean> | StringColumnConfig<boolean, boolean>) {
    let maxWidth = Math.max(
      (config.header ?? "").length,
      this.#footer && this.#footerRowConfig
        ? this.#getCellValueAsString(this.#footer[colNum], this.#footerRowConfig[colNum]).length
        : 0
    );

    for (let r = 0; r < this.#rows.length; r++) {
      maxWidth = Math.max(maxWidth, this.getEntryAsString(colNum, r).length);
      //   if (config.type == "bigint" && config.renderAs === "nanoseconds") {
      // maxWidth = Math.max(maxWidth, Number(row[colNum] / BigInt(1000000000)) + 10); // 1 for period, 9 for digits
      //   } else if (config.type == "bigint" || config.type == "string") {
      // maxWidth = Math.max(maxWidth, ("" + row[colNum]).length);
      //   }
    }

    return maxWidth;
  }
}
