import { FailureCategory } from '@ai-agent-rpg/domain'

const FAILURE_HINT_TOPICS: Record<FailureCategory, string> = {
  [FailureCategory.SYNTAX]: 'Syntax Hint',
  [FailureCategory.API]: 'API Hint',
  [FailureCategory.JSON]: 'JSON Hint',
  [FailureCategory.TOOL_SCHEMA]: 'Tool Schema Hint',
  [FailureCategory.PROMPT]: 'Prompt Hint',
  [FailureCategory.LOGIC]: 'Logic Hint',
  [FailureCategory.AGENT_LOOP]: 'Agent Loop Hint',
  [FailureCategory.ERROR_HANDLING]: 'Error Handling Hint',
  [FailureCategory.ARCHITECTURE]: 'Architecture Hint'
}

export function failureHintTopic(failure: FailureCategory): string {
  return FAILURE_HINT_TOPICS[failure]
}
