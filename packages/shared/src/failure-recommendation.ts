import { FailureCategory } from '@ai-agent-rpg/domain'

const FAILURE_RECOMMENDATIONS: Record<FailureCategory, string> = {
  [FailureCategory.SYNTAX]: 'Fix the syntax error in your Python file and rerun.',
  [FailureCategory.API]: 'Check the endpoint, headers, and authentication before calling the API.',
  [FailureCategory.JSON]: 'Validate the response shape before reading fields.',
  [FailureCategory.TOOL_SCHEMA]: 'Review the tool schema and regenerate valid arguments.',
  [FailureCategory.PROMPT]: 'Rewrite the prompt so the model can choose the correct behavior.',
  [FailureCategory.LOGIC]: 'Trace the decision branch that produced the wrong result.',
  [FailureCategory.AGENT_LOOP]: 'Add a max-step limit and return tool results to the model.',
  [FailureCategory.ERROR_HANDLING]: 'Feed the tool error back to the model and retry safely.',
  [FailureCategory.ARCHITECTURE]: 'Check project structure and imports before running.'
}

export function failureRecommendation(failure: FailureCategory): string {
  return FAILURE_RECOMMENDATIONS[failure]
}

export function failureRecommendations(
  failures: FailureCategory[]
): string[] {
  return [...new Set(failures)].map(failureRecommendation)
}
