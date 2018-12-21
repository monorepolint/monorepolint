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
              name: `pages`,
              path: `${__dirname}/../rules/docs`,
              ignore: [`!(*.md)`],
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
              name: `api`,
              path: `${__dirname}/../core/lib`,
            },
        },
        `gatsby-transformer-documentationjs`,
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    `gatsby-remark-autolink-headers`,
                    `gatsby-remark-copy-linked-files`,
                    `gatsby-remark-prismjs`,
                ]
            },
        },
        `gatsby-plugin-react-helmet`,
        `gatsby-plugin-catch-links`,
    ],
}
