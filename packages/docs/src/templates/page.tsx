/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { graphql } from "gatsby";
import React, { memo } from "react";
import Helmet from "react-helmet";
import { PageWrapper } from "../components";

export interface Props {
  data: {
    markdownRemark: {
      tableOfContents: any;
      html: any;
      frontmatter: {
        title: string;
      };
    };
  };
}

export default memo(function(props: Props) {
  const {
    data: {
      markdownRemark: { frontmatter, html },
    },
  } = props;

  return (
    <>
      <Helmet title={frontmatter.title} />
      <PageWrapper>
        <h1>{frontmatter.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </PageWrapper>
    </>
  );
});

export const query = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      tableOfContents(pathToSlugField: "frontmatter.path")
      html
      frontmatter {
        path
        title
      }
    }
  }
`;
