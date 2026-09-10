import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { HintUsage } from '@ai-agent-rpg/domain'
import { FilePlayerStateStore } from '@ai-agent-rpg/progression'
import { describe, expect, it } from 'vitest'

import { initWorkspace } from '../../cli/agent-rpg/src/commands/init'
import { createSeededPlayerState } from '../../cli/agent-rpg/src/commands/state'
import { readStatus } from '../../cli/agent-rpg/src/commands/status'
import { submitWorkspace } from '../../cli/agent-rpg/src/commands/submit'

describe('agent-rpg submit', () => {
  it('evaluates the current challenge and unlocks the next one', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-submit-'))

    try {
      await initWorkspace({ workspaceDir })
      const hintUsage: HintUsage = {
        id: 'hint-usage-001',
        playerId: 'player-001',
        attemptId: 'attempt-workflow-vs-agent-1',
        challengeId: 'workflow-vs-agent',
        hintId: 'workflow-vs-agent-hint-1',
        hintLevel: 1,
        requestedAt: '2026-09-10T00:00:00.000Z'
      }
      const result = await submitWorkspace({
        workspaceDir,
        output: '根据用户问题自行决定调用哪个工具',
        hintUsages: [hintUsage],
        submittedAt: '2026-09-10T00:00:00.000Z'
      })

      expect(result.passed).toBe(true)
      expect(result.challengeId).toBe('workflow-vs-agent')
      expect(result.score).toBe(1)
      expect(result.unlockedChallengeId).toBe('agent-components')

      const state = await new FilePlayerStateStore(workspaceDir).read()
      expect(
        state?.challenges.find(
          (challenge) => challenge.id === 'workflow-vs-agent'
        )?.status
      ).toBe('passed')
      expect(
        state?.challenges.find(
          (challenge) => challenge.id === 'agent-components'
        )?.status
      ).toBe('active')
      expect(state?.evidence).toHaveLength(1)
      expect(state?.attempts).toHaveLength(1)
      expect(state?.hintUsages).toHaveLength(1)
      expect(state?.submissions).toHaveLength(1)
      expect(
        state?.challenges.find(
          (challenge) => challenge.id === 'workflow-vs-agent'
        )?.hintsUsed
      ).toBe(1)
      expect(
        state?.skills.find(
          (skill) => skill.skillId === 'agent.mental-model'
        )?.level
      ).toBeGreaterThan(0)

      const artifact = JSON.parse(
        await readFile(result.submissionPath, 'utf8')
      ) as {
        challengeId: string
        evaluation: { passed: boolean; score: number }
      }
      expect(artifact.challengeId).toBe('workflow-vs-agent')
      expect(artifact.evaluation.passed).toBe(true)
      expect(artifact.evaluation.score).toBe(1)
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('rejects submitting a locked challenge', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-submit-'))

    try {
      await initWorkspace({ workspaceDir })

      await expect(
        submitWorkspace({
          workspaceDir,
          challengeId: 'api-request',
          output: '检查状态码'
        })
      ).rejects.toThrow(/locked/)
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('records a failed attempt without unlocking the next challenge', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-submit-'))

    try {
      await initWorkspace({ workspaceDir })
      const result = await submitWorkspace({
        workspaceDir,
        output: '完全错误的答案',
        submittedAt: '2026-09-10T00:00:00.000Z'
      })

      expect(result.passed).toBe(false)
      expect(result.unlockedChallengeId).toBeUndefined()

      const state = await new FilePlayerStateStore(workspaceDir).read()
      expect(
        state?.challenges.find(
          (challenge) => challenge.id === 'workflow-vs-agent'
        )?.status
      ).toBe('failed')
      expect(
        state?.challenges.find(
          (challenge) => challenge.id === 'agent-components'
        )?.status
      ).toBe('locked')
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('unlocks mission-02 after all mission-01 challenges pass', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-submit-'))

    try {
      await initWorkspace({ workspaceDir })
      await submitWorkspace({
        workspaceDir,
        output: '根据用户问题自行决定调用哪个工具',
        submittedAt: '2026-09-10T00:00:00.000Z'
      })
      await submitWorkspace({
        workspaceDir,
        output: '最小 Agent 包含模型、工具、上下文与循环',
        submittedAt: '2026-09-10T00:00:01.000Z'
      })
      const result = await submitWorkspace({
        workspaceDir,
        output: '固定流程用 Workflow，不确定路径用 Agent',
        submittedAt: '2026-09-10T00:00:02.000Z'
      })

      expect(result.passed).toBe(true)
      expect(result.unlockedMissionId).toBe('mission-02')
      expect(result.unlockedChallengeId).toBe('api-request')

      const status = await readStatus(workspaceDir)
      expect(status.currentMission).toBe('mission-02')
      expect(status.skills).toContain('agent.mental-model')
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('runs player code once per test and evaluates tool traces', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-submit-'))

    try {
      await initWorkspace({ workspaceDir })
      const seeded = await createSeededPlayerState()
      const progressed = {
        ...seeded,
        currentMissionId: 'mission-03',
        missions: seeded.missions.map((mission) =>
          mission.id === 'mission-01' || mission.id === 'mission-02'
            ? { ...mission, status: 'passed' as const }
            : mission.id === 'mission-03'
              ? { ...mission, status: 'active' as const }
              : mission
        ),
        challenges: seeded.challenges.map((challenge) =>
          challenge.id === 'choose-tool'
            ? { ...challenge, status: 'active' as const }
            : challenge
        )
      }
      await new FilePlayerStateStore(workspaceDir).write(progressed)
      await writeFile(
        join(workspaceDir, 'agent.py'),
        [
          'def run_agent(input):',
          '    question = str(input.get("question", ""))',
          '    if "天气" in question:',
          '        return {',
          '            "output": "应调用 get_weather",',
          '            "tool_calls": [{"name": "get_weather", "arguments": {"city": "上海"}}],',
          '            "steps": [{"type": "tool", "tool_name": "get_weather"}],',
          '            "error_handling": {"had_error": False, "recovered": False},',
          '        }',
          '    return {',
          '        "output": "直接回答",',
          '        "tool_calls": [],',
          '        "steps": [{"type": "final", "content": "直接回答"}],',
          '        "error_handling": {"had_error": False, "recovered": False},',
          '    }',
          ''
        ].join('\n'),
        'utf8'
      )

      const result = await submitWorkspace({
        workspaceDir,
        challengeId: 'choose-tool',
        submittedAt: '2026-09-10T00:00:00.000Z'
      })

      expect(result.passed).toBe(true)
      expect(result.challengeId).toBe('choose-tool')
      expect(result.unlockedChallengeId).toBe('validate-arguments')

      const artifact = JSON.parse(
        await readFile(result.submissionPath, 'utf8')
      ) as {
        traces: Array<{ toolCalls: Array<{ name: string }> }>
        runtime: { exitCode: number }
      }
      expect(artifact.runtime.exitCode).toBe(0)
      expect(artifact.traces[0]?.toolCalls[0]?.name).toBe('get_weather')
      expect(artifact.traces[1]?.toolCalls).toEqual([])
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('executes code challenges with fixtures and unlocks mission-03', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-submit-'))

    try {
      await initWorkspace({ workspaceDir })
      const seeded = await createSeededPlayerState()
      const progressed = {
        ...seeded,
        currentMissionId: 'mission-02',
        missions: seeded.missions.map((mission) =>
          mission.id === 'mission-01'
            ? { ...mission, status: 'passed' as const }
            : mission.id === 'mission-02'
              ? { ...mission, status: 'active' as const }
              : mission
        ),
        challenges: seeded.challenges.map((challenge) =>
          challenge.id === 'api-request'
            ? { ...challenge, status: 'active' as const }
            : challenge
        )
      }
      await new FilePlayerStateStore(workspaceDir).write(progressed)
      await writeFile(
        join(workspaceDir, 'agent.py'),
        [
          'def run_agent(input):',
          '    if not isinstance(input, dict):',
          '        return {"output": str(input)}',
          '    if "response" in input:',
          '        return {"output": input["response"].get("body", "")}',
          '    if "payload" in input:',
          '        return {"output": input["payload"]}',
          '    if "error" in input:',
          '        return {"output": f"请求失败: {input[\'error\']} 超时"}',
          '    return {"output": ""}',
          ''
        ].join('\n'),
        'utf8'
      )

      const first = await submitWorkspace({
        workspaceDir,
        challengeId: 'api-request',
        submittedAt: '2026-09-10T01:00:00.000Z'
      })
      const second = await submitWorkspace({
        workspaceDir,
        challengeId: 'json-parser',
        submittedAt: '2026-09-10T01:00:01.000Z'
      })
      const third = await submitWorkspace({
        workspaceDir,
        challengeId: 'api-error',
        submittedAt: '2026-09-10T01:00:02.000Z'
      })

      expect(first.passed).toBe(true)
      expect(first.unlockedChallengeId).toBe('json-parser')
      expect(second.passed).toBe(true)
      expect(second.unlockedChallengeId).toBe('api-error')
      expect(third.passed).toBe(true)
      expect(third.unlockedMissionId).toBe('mission-03')
      expect(third.unlockedChallengeId).toBe('choose-tool')
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })
})
