import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { initWorkspace } from '../../cli/agent-rpg/src/commands/init'
import { testWorkspace } from '../../cli/agent-rpg/src/commands/test'

describe('agent-rpg test', () => {
  it('runs the current challenge tests without changing state', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-test-'))

    try {
      await initWorkspace({ workspaceDir })
      await writeFile(
        join(workspaceDir, 'agent.py'),
        [
          'def run_agent(input):',
          '    question = str(input.get("question", ""))',
          '    if "最能体现 Agent" in question:',
          '        return {"output": "根据用户问题自行决定调用哪个工具"}',
          '    return {"output": "unknown"}',
          ''
        ].join('\n'),
        'utf8'
      )

      const result = await testWorkspace({ workspaceDir })

      expect(result.challengeId).toBe('workflow-vs-agent')
      expect(result.passed).toBe(true)
      expect(result.publicResults[0]?.passed).toBe(true)
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('reports failures for the current challenge', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-test-'))

    try {
      await initWorkspace({ workspaceDir })

      const result = await testWorkspace({ workspaceDir })

      expect(result.passed).toBe(false)
      expect(result.publicResults[0]?.passed).toBe(false)
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })
})
