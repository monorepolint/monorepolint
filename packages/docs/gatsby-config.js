module.exports = {
    siteMetadata: {
        title: `monorepo-lint`,
        siteUrl: `https://monorepo-lint.com`,
        description: `Managing large monorepos is hard. This makes it easier to standardize them.`,
    },
    plugins: [
        {
            resolve: `gatsby-plugin-typescript`,
            options: {
                isTSX: true,
                allExtensions:true,
            },
        },
        `gatsby-plugin-react-helmet`,
        { 
            resolve: `gatsby-plugin-nprogress`,
            options: {
                color: `#F5498B`,
            }
        },
        {
            resolve: `gatsby-plugin-typography`,
            options: {
              pathToConfigModule: `src/utils/typography.js`,
            },
        },
        `gatsby-plugin-catch-links`,
        {
            resolve: `gatsby-source-filesystem`,
            options: {
              name: `pages`,
              path: `${__dirname}/src/pages`,
              ignore: [`!(*.md)`],
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
              name: `rules`,
            //   path: `${__dirname}/../`,
              path: `${__dirname}/../`,
              ignore: [`**/!(rule.md)`],
            },
        },
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    `gatsby-remark-copy-linked-files`,
                    `gatsby-remark-autolink-headers`,
                    `gatsby-remark-prismjs`,
                ]
            },
        },
    ],
}
