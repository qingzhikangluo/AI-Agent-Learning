import {
  type Attempt,
  type Evidence,
  FailureCategory,
  type HintUsage,
  ChallengeType
} from '@ai-agent-rpg/domain'
import { InMemoryEvidenceRecorder } from '@ai-agent-rpg/progression'
import { describe, expect, it } from 'vitest'

describe('InMemoryEvidenceRecorder', () => {
  const recorder = new InMemoryEvidenceRecorder()

  it('records pass and fail evidence', () => {
    const evidence: Evidence = {
      id: 'evidence-001',
      playerId: 'player-001',
      skillId: 'tool.calling',
      taskId: 'choose-tool',
      taskType: ChallengeType.CODE,
      result: 'fail',
      score: 0,
      attempts: 1,
      hintsUsed: 0,
      failureCategories: [FailureCategory.TOOL_SCHEMA],
      createdAt: '2026-09-09T00:00:00.000Z'
    }

    recorder.recordEvidence(evidence)
    expect(recorder.getEvidenceByPlayer('player-001')).toHaveLength(1)
  })

  it('records attempts', () => {
    const attempt: Attempt = {
      id: 'attempt-001',
      playerId: 'player-001',
      challengeId: 'choose-tool',
      status: 'failed',
      startedAt: '2026-09-09T00:00:00.000Z',
      finishedAt: '2026-09-09T00:00:01.000Z'
    }

    recorder.recordAttempt(attempt)
    expect(recorder.getAttemptsByPlayer('player-001')).toHaveLength(1)
  })

  it('records hint usage', () => {
    const usage: HintUsage = {
      id: 'hint-usage-001',
      playerId: 'player-001',
      attemptId: 'attempt-001',
      challengeId: 'choose-tool',
      hintId: 'choose-tool-hint-2',
      hintLevel: 2,
      requestedAt: '2026-09-09T00:00:00.000Z'
    }

    recorder.recordHintUsage(usage)
    expect(recorder.getHintUsagesByPlayer('player-001')).toHaveLength(1)
  })
})
