module.exports = {
  docs: [
    {
      type: "category",
      label: "Introduction",
      collapsed: false,
      items: ["getting-started", "config", "cli", "writing-custom-rules"],
    },
    {
      type: "category",
      label: "Guides",
      collapsed: false,
      items: ["guides/archetypes", "guides/config-in-a-package", "tips-and-tricks"],
    },
    {
      type: "category",
      label: "Built-in Rules",
      items: [
        {
          type: "autogenerated",
          dirName: "rules",
        },
      ],
    },
  ],
};
