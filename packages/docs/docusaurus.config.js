module.exports = {
  title: 'monorepolint',
  tagline: 'monorepo consistency made easy',
  url: 'https://monorepolint.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'monorepolint', // Usually your GitHub org/user name.
  projectName: 'monorepolint', // Usually your repo name.
  themeConfig: {
    sidebarCollapsible: false,
    navbar: {
      title: 'monorepolint',
      links: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://github.com/monorepolint/monorepolint',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'CLI',
              to: 'docs/cli',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/monorepolint',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/s7DQmr5',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/monorepolint',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/monorepolint/monorepolint',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Palantir Technologies. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'getting-started',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/monorepolint/monorepolint/edit/master/packages/docs/',
        },
        blog: {
          editUrl:
            'https://github.com/monorepolint/monorepolint/edit/master/packages/docs/docs/blog',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
