import {
  ChallengeType,
  SkillLevel,
  type Evidence
} from '@ai-agent-rpg/domain'

export function calculateSkillLevel(evidenceList: Evidence[]): SkillLevel {
  const passes = evidenceList.filter((evidence) => evidence.result === 'pass')

  if (passes.length === 0) {
    return SkillLevel.UNKNOWN
  }

  const hasTransferPass = passes.some(
    (evidence) => evidence.taskType === ChallengeType.TRANSFER
  )
  if (hasTransferPass) {
    return SkillLevel.TRANSFER
  }

  const independentTaskIds = new Set(
    passes
      .filter(
        (evidence) =>
          evidence.taskType !== ChallengeType.BOSS &&
          evidence.hintsUsed === 0 &&
          evidence.attempts === 1
      )
      .map((evidence) => evidence.taskId)
  )
  if (independentTaskIds.size >= 2) {
    return SkillLevel.INDEPENDENT
  }

  const hasGuidedPass = passes.some(
    (evidence) => evidence.hintsUsed > 0 || evidence.attempts > 1
  )
  if (hasGuidedPass) {
    return SkillLevel.GUIDED
  }

  const hasConceptPass = passes.some(
    (evidence) => evidence.taskType === ChallengeType.CONCEPT
  )
  if (hasConceptPass) {
    return SkillLevel.AWARENESS
  }

  return SkillLevel.GUIDED
}
