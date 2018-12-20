const path = require("path")

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;

  const pageTemplate = path.resolve(`src/templates/page.tsx`)
  const ruleTemplate = path.resolve(`src/templates/rule.tsx`)

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
    const { node: { frontmatter, fields } } = edge;

    createPage({
      path: frontmatter.path,
      component: pageTemplate,
    })
  })

  const allRules = await graphql(`
    {
      allDocumentationJs {
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
  `);

  if (allRules.errors) {
    console.error(allRules.errors);

    throw Error(allRules.errors);
  }

  allRules.data.allMarkdownRemark.edges.forEach(edge => {
    console.log(edge);
    // const { node: { frontmatter } } = edge;
    // console.log(frontmatter);

    // createPage({
    //   path: `/rules/${frontmatter.rule}`,
    //   component: ruleTemplate,
    //   context: {
    //     rule: frontmatter.rule,
    //   }
    // })
  })
}
