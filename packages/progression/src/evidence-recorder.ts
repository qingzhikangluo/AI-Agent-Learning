import type {
  Attempt,
  Evidence,
  HintUsage
} from '@ai-agent-rpg/domain'

export class InMemoryEvidenceRecorder {
  private readonly evidenceList: Evidence[] = []
  private readonly attemptList: Attempt[] = []
  private readonly hintUsageList: HintUsage[] = []

  recordEvidence(evidence: Evidence): void {
    this.evidenceList.push(evidence)
  }

  recordAttempt(attempt: Attempt): void {
    this.attemptList.push(attempt)
  }

  recordHintUsage(usage: HintUsage): void {
    this.hintUsageList.push(usage)
  }

  getEvidenceByPlayer(playerId: string): Evidence[] {
    return this.evidenceList.filter(
      (evidence) => evidence.playerId === playerId
    )
  }

  getAttemptsByPlayer(playerId: string): Attempt[] {
    return this.attemptList.filter((attempt) => attempt.playerId === playerId)
  }

  getHintUsagesByPlayer(playerId: string): HintUsage[] {
    return this.hintUsageList.filter((usage) => usage.playerId === playerId)
  }
}
