/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import React, { ReactNode } from "react";
import Helmet from "react-helmet";

import { Footer } from "../footer";
import { Header } from "../header";
import Classes from "./PageWrapper.module.scss";

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
          <div className={Classes.content}>
            <div className={Classes.contentWrapper}>{props.children}</div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}
