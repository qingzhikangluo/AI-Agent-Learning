import { runPytestInWorkspace } from '@ai-agent-rpg/runtime'

export interface TestOptions {
  workspaceDir: string
  timeoutMs?: number
}

export async function testWorkspace(options: TestOptions) {
  return runPytestInWorkspace(
    options.workspaceDir,
    options.timeoutMs ?? 30_000
  )
}
