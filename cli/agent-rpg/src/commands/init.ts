import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { FilePlayerStateStore } from '@ai-agent-rpg/progression'

import { createSeededPlayerState } from './state'

export interface InitOptions {
  workspaceDir: string
}

export async function initWorkspace(options: InitOptions): Promise<string> {
  const workspaceDir = resolve(options.workspaceDir)
  await mkdir(workspaceDir, { recursive: true })

  const files: Record<string, string> = {
    'agent.py':
      'def handle(user_message: str) -> str:\n' +
      '    """Handle one user message with an agent loop."""\n' +
      '    return user_message\n',
    'main.py':
      'from agent import handle\n\n\n' +
      'def main() -> None:\n' +
      '    print(handle("test"))\n\n\n' +
      'if __name__ == "__main__":\n' +
      '    main()\n',
    'tools.py':
      '# Define the tools available to the agent here.\n',
    'config.py':
      'SYSTEM_PROMPT = "You are an internal employee assistant."\n',
    'README.md':
      '# Agent RPG Workspace\n\n' +
      'Run tests with:\n\n```bash\nagent-rpg test\n```\n'
  }

  for (const [name, content] of Object.entries(files)) {
    await writeFile(join(workspaceDir, name), content, 'utf8')
  }

  const stateStore = new FilePlayerStateStore(workspaceDir)
  const existingState = await stateStore.read()
  if (!existingState) {
    await stateStore.write(await createSeededPlayerState())
  }

  return workspaceDir
}
