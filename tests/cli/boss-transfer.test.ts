import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { ChallengeType, SkillLevel } from '@ai-agent-rpg/domain'
import { FilePlayerStateStore } from '@ai-agent-rpg/progression'
import { describe, expect, it } from 'vitest'

import { initWorkspace } from '../../cli/agent-rpg/src/commands/init'
import { createSeededPlayerState } from '../../cli/agent-rpg/src/commands/state'
import { submitWorkspace } from '../../cli/agent-rpg/src/commands/submit'
import { testWorkspace } from '../../cli/agent-rpg/src/commands/test'

async function writeAgent(
  workspaceDir: string,
  lines: string[]
): Promise<void> {
  await writeFile(join(workspaceDir, 'agent.py'), lines.join('\n'), 'utf8')
}

describe('boss submission', () => {
  it(
    'runs hidden tests and scores deterministic plus explanation',
    async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-boss-'))

    try {
      await initWorkspace({ workspaceDir })
      const seeded = await createSeededPlayerState()
      await new FilePlayerStateStore(workspaceDir).write({
        ...seeded,
        missions: seeded.missions.map((mission) => ({
          ...mission,
          status: 'passed' as const
        })),
        challenges: seeded.challenges.map((challenge) => ({
          ...challenge,
          status: 'passed' as const
        })),
        boss: { ...seeded.boss, status: 'in-progress' as const }
      })
      await writeAgent(workspaceDir, [
        'def run_agent(input):',
        '    user = str(input.get("user", ""))',
        '    if "1200" in user:',
        '        return {"output": "报销 1200 元", "tool_calls": [{"name": "calculate_expense"}]}',
        '    if "年假政策" in user:',
        '        return {"output": "年假政策", "tool_calls": [{"name": "search_faq"}]}',
        '    if "2 + 2" in user:',
        '        return {"output": "4", "tool_calls": []}',
        '    if "nameless-city" in user:',
        '        return {',
        '            "output": "已恢复",',
        '            "tool_calls": [{"name": "get_weather", "error": "city not found", "result": "retry"}],',
        '            "error_handling": {"had_error": True, "recovered": True, "message": "已恢复"},',
        '        }',
        '    if "先查北京天气" in user:',
        '        return {"output": "完成", "tool_calls": [{"name": "get_weather"}, {"name": "calculate_expense"}]}',
        '    if "@#$%" in user or "预约" in user:',
        '        return {"output": "无法处理", "tool_calls": []}',
        '    return {"output": "晴天", "tool_calls": [{"name": "get_weather"}]}',
        ''
      ])

      const testResult = await testWorkspace({
        workspaceDir,
        challengeId: 'first-agent-boss'
      })
      expect(testResult.passed).toBe(true)
      expect(testResult.hiddenSummary).toEqual({ total: 6, passed: 6 })

      const submitResult = await submitWorkspace({
        workspaceDir,
        challengeId: 'first-agent-boss',
        explanationAnswers: [
          '读取工具描述并匹配用户意图',
          '校验必填参数和类型',
          '把错误反馈给模型并限制重试'
        ],
        submittedAt: '2026-09-10T02:00:00.000Z'
      })

      expect(submitResult.passed).toBe(true)
      expect(submitResult.bossPassed).toBe(true)
      expect(submitResult.transferUnlocked).toBe(true)
      expect(submitResult.score).toBe(1)

      const state = await new FilePlayerStateStore(workspaceDir).read()
      expect(state?.boss.status).toBe('passed')
      expect(state?.transfer.status).toBe('in-progress')
      expect(
        state?.evidence.some(
          (evidence) => evidence.taskType === ChallengeType.BOSS
        )
      ).toBe(true)
      expect(
        state?.skills.find((skill) => skill.skillId === 'agent.loop')?.level
      ).toBeGreaterThan(0)
      } finally {
        await rm(workspaceDir, { recursive: true, force: true })
      }
    },
    30_000
  )
})

describe('transfer submission', () => {
  it(
    'runs hidden tests and promotes the transfer skill',
    async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-transfer-'))

    try {
      await initWorkspace({ workspaceDir })
      const seeded = await createSeededPlayerState()
      await new FilePlayerStateStore(workspaceDir).write({
        ...seeded,
        missions: seeded.missions.map((mission) => ({
          ...mission,
          status: 'passed' as const
        })),
        challenges: seeded.challenges.map((challenge) => ({
          ...challenge,
          status: 'passed' as const
        })),
        boss: { ...seeded.boss, status: 'passed' as const },
        transfer: { ...seeded.transfer, status: 'in-progress' as const }
      })
      await writeAgent(workspaceDir, [
        'def run_agent(input):',
        '    user = str(input.get("user", ""))',
        '    if "高铁报销标准" in user:',
        '        return {"output": "政策查询", "tool_calls": [{"name": "search_policy"}]}',
        '    if "先算上海到北京的距离" in user:',
        '        return {',
        '            "output": "完成",',
        '            "tool_calls": [{"name": "calculate_distance"}, {"name": "calculate_reimbursement"}],',
        '        }',
        '    if "没有政策记录" in user:',
        '        return {',
        '            "output": "已恢复",',
        '            "tool_calls": [{"name": "search_policy", "error": "not found", "result": "fallback"}],',
        '            "error_handling": {"had_error": True, "recovered": True, "message": "已恢复"},',
        '        }',
        '    if "报销凭证要保留多久" in user:',
        '        return {"output": "请查阅政策", "tool_calls": []}',
        '    return {"output": "距离已计算", "tool_calls": [{"name": "calculate_distance"}]}',
        ''
      ])

      const testResult = await testWorkspace({
        workspaceDir,
        challengeId: 'travel-expense-transfer'
      })
      expect(testResult.passed).toBe(true)
      expect(testResult.hiddenSummary).toEqual({ total: 3, passed: 3 })

      const submitResult = await submitWorkspace({
        workspaceDir,
        challengeId: 'travel-expense-transfer',
        submittedAt: '2026-09-10T03:00:00.000Z'
      })

      expect(submitResult.passed).toBe(true)
      expect(submitResult.transferPassed).toBe(true)

      const state = await new FilePlayerStateStore(workspaceDir).read()
      expect(state?.transfer.status).toBe('passed')
      expect(
        state?.evidence.some(
          (evidence) => evidence.taskType === ChallengeType.TRANSFER
        )
      ).toBe(true)
      expect(
        state?.skills.find((skill) => skill.skillId === 'tool.calling')
          ?.level
      ).toBe(SkillLevel.TRANSFER)
      } finally {
        await rm(workspaceDir, { recursive: true, force: true })
      }
    },
    30_000
  )
})
