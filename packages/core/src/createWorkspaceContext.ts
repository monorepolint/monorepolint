import { ResolvedConfig } from "@monorepolint/config";
import { findWorkspaceDir, Host } from "@monorepolint/utils";
import { WorkspaceContextImpl } from "./WorkspaceContext.js";

export async function createWorkspaceContext(
  host: Host,
  cwd: string,
  resolvedConfig: ResolvedConfig,
) {
  const workspaceDir = await findWorkspaceDir(host, cwd);
  if (workspaceDir === undefined) {
    throw new Error(`Unable to find a workspace from ${cwd}`);
  }

  const workspaceContext = new WorkspaceContextImpl(
    workspaceDir,
    resolvedConfig,
    host,
  );
  return workspaceContext;
}
