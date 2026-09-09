import { FailureCategory } from '@ai-agent-rpg/domain'

const REMEDIATION_QUESTS: Partial<Record<FailureCategory, string>> = {
  [FailureCategory.TOOL_SCHEMA]: 'tool-schema-repair'
}

export function remediationQuestForFailure(
  failure: FailureCategory
): string | null {
  return REMEDIATION_QUESTS[failure] ?? null
}
