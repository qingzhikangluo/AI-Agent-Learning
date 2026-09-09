import { runWorkspaceEntry } from '@ai-agent-rpg/runtime'

export interface RunOptions {
  workspaceDir: string
  timeoutMs?: number
}

export async function runWorkspace(options: RunOptions) {
  return runWorkspaceEntry(
    options.workspaceDir,
    'main.py',
    options.timeoutMs ?? 10_000
  )
}
