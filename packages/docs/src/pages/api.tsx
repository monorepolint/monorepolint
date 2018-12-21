/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { graphql } from "gatsby";
import React from "react";
import Helmet from "react-helmet";

export interface Props {
  data: {
    allDocumentationJs: {
      edges: Array<{ node: Api }>;
    };
  };
}

export interface Api {
  name: string;
  description: {
    childMarkdownRemark: {
      html: any;
    };
  } | null;
}

export default function(props: Props) {
  const apis = props.data.allDocumentationJs.edges.map(e => e.node);

  const apisRendered = apis.map(a => {
    return (
      <div>
        <h3>{a.name}</h3>
        {a.description !== null && <div dangerouslySetInnerHTML={{ __html: a.description.childMarkdownRemark.html }} />}
      </div>
    );
  });

  return (
    <div>
      <Helmet title={`monorepolint | API`} />
      <h1>API</h1>
      {apisRendered}
    </div>
  );
}

export const query = graphql`
  {
    allDocumentationJs(filter: { name: { ne: null } }) {
      edges {
        node {
          name
          description {
            childMarkdownRemark {
              html
            }
          }
        }
      }
    }
  }
`;
