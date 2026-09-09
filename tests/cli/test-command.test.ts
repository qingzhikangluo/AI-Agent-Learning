import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { initWorkspace } from '../../cli/agent-rpg/src/commands/init'
import { testWorkspace } from '../../cli/agent-rpg/src/commands/test'
import { describe, expect, it } from 'vitest'

describe('agent-rpg test', () => {
  it('discovers and runs pytest in the workspace', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-test-'))

    try {
      await initWorkspace({ workspaceDir })
      await writeFile(
        join(workspaceDir, 'test_agent.py'),
        'from agent import handle\n\n\ndef test_handle():\n    assert handle("hi") == "hi"\n',
        'utf8'
      )

      const result = await testWorkspace({ workspaceDir })
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('1 passed')
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })
})
