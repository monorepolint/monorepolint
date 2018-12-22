const path = require("path")

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
            tableOfContents(pathToSlugField: "frontmatter.path")
            frontmatter {
              path
              title
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
    if(frontmatter.path === "/") {
      return;
    }

    createPage({
      path: frontmatter.path,
      component: pageTemplate,
    })
  })
}
