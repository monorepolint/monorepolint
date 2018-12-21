/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import decamelize from "decamelize";
import { graphql, Link } from "gatsby";
import React from "react";
import Helmet from "react-helmet";

import { RULES_SOURCE_URL } from "../utils/constants";

export interface Props {
  data: {
    allMarkdownRemark: {
      edges: Array<{ node: Rule }>;
    };
  };
}

export interface Rule {
  html: any;
  frontmatter: {
    rule: string;
  };
}

export default function(props: Props) {
  const rules = props.data.allMarkdownRemark.edges.map(e => e.node);

  const apisRendered = rules.map(a => {
    const path = a.frontmatter.rule;

    const name = decamelize(
      path
        .split("/")
        .pop()!
        .split(".")[0],
      " "
    );
    const url = `${RULES_SOURCE_URL}/${path}`;

    return (
      <div>
        <h2 style={{ textTransform: "capitalize" }}>{name}</h2>
        <h6>
          <a href={url}>source</a>
        </h6>
        <div dangerouslySetInnerHTML={{ __html: a.html }} />
      </div>
    );
  });

  return (
    <div>
      <Helmet title={`monorepolint | Rules`} />
      <h1>Rules</h1>
      {apisRendered}
    </div>
  );
}

export const query = graphql`
  {
    allMarkdownRemark(filter: { frontmatter: { rule: { ne: null } } }) {
      edges {
        node {
          html
          frontmatter {
            rule
          }
        }
      }
    }
  }
`;
