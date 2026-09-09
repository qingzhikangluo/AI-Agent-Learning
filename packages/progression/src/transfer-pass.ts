import {
  ChallengeType,
  SkillLevel,
  type Evidence
} from '@ai-agent-rpg/domain'

export function hasTransferPassForSkill(
  skillId: string,
  evidenceList: Evidence[]
): boolean {
  return evidenceList.some(
    (evidence) =>
      evidence.skillId === skillId &&
      evidence.taskType === ChallengeType.TRANSFER &&
      evidence.result === 'pass'
  )
}

export function skillLevelAfterTransfer(
  evidenceList: Evidence[]
): SkillLevel {
  return hasTransferPassForSkill('tool.calling', evidenceList)
    ? SkillLevel.TRANSFER
    : SkillLevel.UNKNOWN
}
