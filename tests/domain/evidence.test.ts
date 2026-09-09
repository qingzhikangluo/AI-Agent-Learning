import {
  type Attempt,
  type Evidence,
  FailureCategory,
  type HintUsage,
  ChallengeType
} from '@ai-agent-rpg/domain'
import { describe, expect, it } from 'vitest'

describe('Evidence', () => {
  it('records player, skill, task, result, attempts, and hints', () => {
    const evidence = {
      id: 'evidence-001',
      playerId: 'player-001',
      skillId: 'tool.calling',
      taskId: 'choose-tool',
      taskType: ChallengeType.CODE,
      result: 'fail',
      score: 0,
      attempts: 2,
      hintsUsed: 1,
      failureCategories: [FailureCategory.TOOL_SCHEMA],
      createdAt: '2026-09-09T00:00:00.000Z'
    } satisfies Evidence

    expect(evidence).toMatchObject({
      skillId: 'tool.calling',
      result: 'fail',
      attempts: 2,
      hintsUsed: 1
    })
  })
})

describe('Attempt', () => {
  it('tracks running, passed, or failed challenge attempts', () => {
    const attempt = {
      id: 'attempt-001',
      playerId: 'player-001',
      challengeId: 'choose-tool',
      status: 'running',
      startedAt: '2026-09-09T00:00:00.000Z'
    } satisfies Attempt

    expect(attempt.status).toBe('running')
  })
})

describe('HintUsage', () => {
  it('records who requested which hint and when', () => {
    const usage = {
      id: 'hint-usage-001',
      playerId: 'player-001',
      attemptId: 'attempt-001',
      challengeId: 'choose-tool',
      hintId: 'choose-tool-hint-2',
      hintLevel: 2,
      requestedAt: '2026-09-09T00:00:00.000Z'
    } satisfies HintUsage

    expect(usage.hintLevel).toBe(2)
    expect(usage.requestedAt).toBe('2026-09-09T00:00:00.000Z')
  })
})
