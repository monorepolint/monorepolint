/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Link } from "gatsby";
import React, { memo } from "react";
import Helmet from "react-helmet";

import { PageWrapper } from "../components";
import { SOURCE_URL } from "../utils/constants";

export default memo(function() {
  return (
    <>
      <Helmet title={"Home"} />
      <PageWrapper>
        <h1>monorepolint</h1>
        <p>Managing large monorepos is hard. This makes it easier to standardize them.</p>
        <ul>
          <li>
            <Link to={"./quick-start"}>Quick Start</Link>
          </li>
          <li>
            <Link to={"./cli"}>cli</Link>
          </li>
          <li>
            <Link to={"./api"}>API</Link>
          </li>
          <li>
            <Link to={"./rules"}>Rules</Link>
          </li>
          <li>
            <a href={SOURCE_URL}>Github</a>
          </li>
        </ul>
      </PageWrapper>
    </>
  );
});
