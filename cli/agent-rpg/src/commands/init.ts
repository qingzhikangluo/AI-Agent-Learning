import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

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

  return workspaceDir
}
