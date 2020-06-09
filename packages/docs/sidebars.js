const fs = require("fs");
const path = require("path");

const builtInRules = fs.readdirSync(path.join(__dirname, "docs", "rules")).map(
  a =>
    `rules/${a
      .split(".")
      .slice(0, -1)
      .join(".")}`
).sort();
console.log(builtInRules);

module.exports = {
  docs: {
    Docs: ["getting-started", "config", "cli", "writing-custom-rules"],
    "Built-in Rules": builtInRules
  },
};
