// touch docs for publish
module.exports = {
  title: "monorepolint",
  tagline: "monorepo consistency made easy",
  url: "https://monorepolint.com",
  baseUrl: "/",
  favicon: "img/favicon.svg",
  organizationName: "monorepolint", // Usually your GitHub org/user name.
  projectName: "monorepolint", // Usually your repo name.
  headTags: [
    {
      tagName: "meta",
      attributes: {
        property: "og:image",
        content: "https://monorepolint.com/img/logo.jpg",
      },
    },
    {
      tagName: "meta",
      attributes: {
        property: "og:image:alt",
        content: "monorepolint logo - stacked washing machines representing lint cleaning",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "twitter:image",
        content: "https://monorepolint.com/img/logo.jpg",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "twitter:image:alt",
        content: "monorepolint logo - stacked washing machines representing lint cleaning",
      },
    },
  ],
  themeConfig: {
    prism: {
      theme: require("prism-react-renderer").themes.oneDark,
    },
    colorMode: {
      defaultMode: "light",
    },
    navbar: {
      title: "monorepolint",
      logo: {
        alt: "monorepolint logo",
        src: "img/logo.jpg",
      },
      items: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Getting Started",
          position: "right",
        },
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Docs",
          position: "right",
        },
        {
          to: "docs/rules/alphabetical-dependencies",
          label: "Rules",
          position: "right",
        },
        {
          to: "blog/",
          label: "News",
          position: "right",
        },
        {
          href: "https://github.com/monorepolint/monorepolint",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "CLI",
              to: "docs/cli",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Stack Overflow",
              href: "https://stackoverflow.com/questions/tagged/monorepolint",
            },
            {
              label: "Discord",
              href: "https://discord.gg/s7DQmr5",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/monorepolint",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "blog",
            },
            {
              label: "GitHub",
              href: "https://github.com/monorepolint/monorepolint",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Palantir Technologies.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarCollapsible: true,
          // It is recommended to set document id as docs home page (`docs/` path).
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl: "https://github.com/monorepolint/monorepolint/edit/main/packages/docs/",
        },
        blog: {
          editUrl: "https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/blog",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
