/*!
 * Copyright (c) 2018 monorepo-lint (http://monorepo-lint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */
import { graphql } from "gatsby";
import React from "react";
import Helmet from "react-helmet";

export interface Props {
  data: {
    markdownRemark: {
      html: any;
      frontmatter: {
        title: string;
      };
    };
  };
}

export default function(props: Props) {
  const {
    data: {
      markdownRemark: { frontmatter, html }
    }
  } = props;

  return (
    <div className="blog-post-container">
      <Helmet title={`monorepo-lint - ${frontmatter.title}`} />
      <div className="blog-post">
        <h1>{frontmatter.title}</h1>
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

export const query = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        path
        title
      }
    }
  }
`;
