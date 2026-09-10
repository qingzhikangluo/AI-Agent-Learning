import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { initWorkspace } from '../../cli/agent-rpg/src/commands/init'
import { readStatus } from '../../cli/agent-rpg/src/commands/status'
import { submitWorkspace } from '../../cli/agent-rpg/src/commands/submit'
import { testWorkspace } from '../../cli/agent-rpg/src/commands/test'

describe('vertical slice smoke test', () => {
  it(
    'runs init -> code -> test -> submit -> status through mission-01',
    async () => {
      const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-slice-'))

      try {
        await initWorkspace({ workspaceDir })
        await writeFile(
          join(workspaceDir, 'agent.py'),
          [
            'def run_agent(input):',
            '    text = str(input)',
            '    if "最能体现 Agent" in text:',
            '        return {"output": "根据用户问题自行决定调用哪个工具"}',
            '    if "最小 Agent" in text:',
            '        return {"output": "模型、工具、上下文与循环"}',
            '    return {"output": "固定流程用 Workflow；不确定路径用 Agent"}',
            ''
          ].join('\n'),
          'utf8'
        )

        const submittedAt = Date.parse('2026-09-10T00:00:00.000Z')
        for (let index = 0; index < 3; index += 1) {
          const testResult = await testWorkspace({ workspaceDir })
          expect(testResult.passed).toBe(true)

          const submitResult = await submitWorkspace({
            workspaceDir,
            submittedAt: new Date(
              submittedAt + index * 1000
            ).toISOString()
          })
          expect(submitResult.passed).toBe(true)
        }

        const status = await readStatus(workspaceDir)
        expect(status.currentMission).toBe('mission-02')
        expect(status.skills).toContain('agent.mental-model')
      } finally {
        await rm(workspaceDir, { recursive: true, force: true })
      }
    },
    30_000
  )
})
