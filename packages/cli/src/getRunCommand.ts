export function getRunCommand() {
  const execPath = process.env.npm_execpath;

  const npmAgent = typeof execPath === "string"
    ? execPath.includes("yarn")
      ? "yarn"
      : execPath.includes("pnpm")
      ? "pnpm"
      : execPath.includes("npm")
      ? "npm"
      : undefined
    : undefined;

  return npmAgent === "yarn"
    ? "yarn mrl"
    : npmAgent === "npm"
    ? "npm run mrl"
    : npmAgent === "pnpm"
    ? "pnpm exec mrl"
    : "mrl";
}
