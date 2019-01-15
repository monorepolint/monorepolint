/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { graphql, Link } from "gatsby";
import React, { memo } from "react";
import Helmet from "react-helmet";

import { MarkdownBlock, PageWrapper } from "../components";
import { API_URL, CLI_URL, RULES_URL, SOURCE_URL } from "../utils/constants";
import Classes from "./index.module.scss";

export interface Props {
  data: {
    markdownRemark: {
      html: any;
    };
  };
}

export default memo(function(props: Props) {
  return (
    <>
      <Helmet title={"Home"} />
      <PageWrapper>
        <h1 className={Classes.title}>monorepolint</h1>
        <p>Managing large monorepos is hard. This makes it easier to standardize them.</p>
        <div className={Classes.links}>
          <Link className={Classes.link} to={CLI_URL}>
            CLI
          </Link>
          <Link className={Classes.link} to={RULES_URL}>
            Rules
          </Link>
          <Link className={Classes.link} to={API_URL}>
            API
          </Link>
          <a className={Classes.link} href={SOURCE_URL}>
            Github
          </a>
        </div>
        <hr className={Classes.divider} />
        <MarkdownBlock markdown={props.data.markdownRemark.html} />
      </PageWrapper>
    </>
  );
});

export const query = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
    }
  }
`;
