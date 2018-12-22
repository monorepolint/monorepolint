/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import React, { ReactNode } from "react";
import Helmet from "react-helmet";

import { Header } from "../header";
import Classes from "./PageWrapper.module.css";

export interface Props {
  children?: ReactNode;
}

export function PageWrapper(props: Props) {
  return (
    <>
      <Helmet titleTemplate="%s | monorepolint" />
      <div className={Classes.wrapper}>
        <Header />
        <div className={Classes.scrollable}>
          <div className={Classes.content}>{props.children}</div>
        </div>
      </div>
    </>
  );
}
