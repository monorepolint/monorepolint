/*!
 * Copyright (c) 2018 monorepolint (http://monorepolint.com). All Right Reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

const path = require("path");

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;

  const pageTemplate = path.resolve(`src/templates/page.tsx`)

  const allPages = await graphql(`
    {
      allMarkdownRemark(
        filter: { frontmatter: { path: { ne: null } } }
      ) {
        edges {
          node {
            frontmatter {
              path
            }
          }
        }
      }
    }
  `);

  if (allPages.errors) {
    console.error(allPages.errors);

    throw Error(allPages.errors);
  }

  allPages.data.allMarkdownRemark.edges.forEach(edge => {
    const { node: { frontmatter } } = edge;

    // special case the home page
    if (frontmatter.path === "/") {
      return;
    }

    createPage({
      path: frontmatter.path,
      component: pageTemplate,
    })
  })
}
