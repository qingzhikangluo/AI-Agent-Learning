import { type BossSubmission } from '@ai-agent-rpg/domain'
import { describe, expect, it } from 'vitest'

describe('BossSubmission', () => {
  it('carries source, readme, test result, and explanation', () => {
    const submission = {
      id: 'submission-001',
      playerId: 'player-001',
      challengeId: 'first-agent-boss',
      source: 'def handle(user): ...',
      readme: '# How to run\nRun python main.py.',
      testResult: '4/4 public tests passed',
      explanation: 'I chose get_weather based on the user intent and handled errors.',
      submittedAt: '2026-09-09T00:00:00.000Z'
    } satisfies BossSubmission

    expect(submission.challengeId).toBe('first-agent-boss')
    expect(submission.source.length).toBeGreaterThan(0)
    expect(submission.explanation).toContain('get_weather')
  })
})
