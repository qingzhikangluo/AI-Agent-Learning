import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { initWorkspace } from '../../cli/agent-rpg/src/commands/init'
import { describe, expect, it } from 'vitest'

describe('agent-rpg init', () => {
  it('creates a player workspace template', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-init-'))

    try {
      await initWorkspace({ workspaceDir })

      const agentPy = await readFile(join(workspaceDir, 'agent.py'), 'utf8')
      const mainPy = await readFile(join(workspaceDir, 'main.py'), 'utf8')
      const toolsPy = await readFile(join(workspaceDir, 'tools.py'), 'utf8')
      const readme = await readFile(join(workspaceDir, 'README.md'), 'utf8')

      expect(agentPy).toContain('def handle')
      expect(mainPy).toContain('def main')
      expect(toolsPy).toContain('# Define the tools')
      expect(readme).toContain('agent-rpg test')
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })
})
