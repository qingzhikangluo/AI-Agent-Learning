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
      'def run_agent(input):\n' +
      '    """Return an AgentTrace-compatible dict for one challenge input."""\n' +
      '    message = input.get("message") if isinstance(input, dict) else input\n' +
      '    return {\n' +
      '        "output": str(message or ""),\n' +
      '        "tool_calls": [],\n' +
      '        "steps": [{"type": "final", "content": str(message or "")}],\n' +
      '        "error_handling": {"had_error": False, "recovered": False},\n' +
      '    }\n' +
      '\n' +
      '\n' +
      'def handle(user_message: str) -> str:\n' +
      '    """Handle one user message with a minimal agent loop."""\n' +
      '    return str(run_agent(user_message)["output"])\n',
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
      'Test the current challenge with:\n\n```bash\nagent-rpg test\n```\n'
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
