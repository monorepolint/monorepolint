/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import React, { memo } from "react";

import Classes from "./MarkdownBlock.module.scss";

export interface Props {
  title?: string;
  markdown: any;
  tableOfContents?: any;
}

export const MarkdownBlock = memo(function(props: Props) {
  const { title, markdown, tableOfContents } = props;
  return (
    <div className={Classes.wrapper}>
      <div className={Classes.left}>
        {title && <h1 className={Classes.title}>{title}</h1>}
        <div className={Classes.markdown} dangerouslySetInnerHTML={{ __html: markdown }} />
      </div>
      {tableOfContents && (
        <div className={Classes.right}>
          <div className={Classes.tableOfContents} dangerouslySetInnerHTML={{ __html: tableOfContents }} />
        </div>
      )}
    </div>
  );
});
