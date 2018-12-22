/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import React, { ReactNode } from "react";

import Classes from "./ContentWrapper.module.css";

export interface Props {
  children?: ReactNode;
}

export function ContentWrapper(props: Props) {
  return (
    <div className={Classes.wrapper}>
      <div className={Classes.content}>{props.children}</div>
    </div>
  );
}
