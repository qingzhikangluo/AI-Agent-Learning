import type { FailureCategory } from './evaluation'

export type EvidenceResult = 'pass' | 'fail'

export interface Evidence {
  id: string
  playerId: string
  skillId: string
  taskId: string
  result: EvidenceResult
  score?: number
  attempts: number
  hintsUsed: number
  failureCategories: FailureCategory[]
  createdAt: string
}

export type AttemptStatus = 'running' | 'passed' | 'failed'

export interface Attempt {
  id: string
  playerId: string
  challengeId: string
  status: AttemptStatus
  startedAt: string
  finishedAt?: string
}

export interface HintUsage {
  id: string
  playerId: string
  attemptId: string
  challengeId: string
  hintId: string
  hintLevel: number
  requestedAt: string
}
