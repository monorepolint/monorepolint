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
        rule: string;
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
      <Helmet title={`monorepo-lint - rule - ${frontmatter.rule}`} />
      <div className="blog-post">
        <h1>{frontmatter.rule}</h1>
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

export const query = graphql`
  query($rule: String!) {
    markdownRemark(frontmatter: { rule: { eq: $rule } }) {
      html
      frontmatter {
        rule
      }
    }
  }
`;
