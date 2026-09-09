import { FailureCategory } from '@ai-agent-rpg/domain'

import type { ExecutionResult } from './runtime'

export function mapExecutionFailure(
  result: Pick<ExecutionResult, 'stderr' | 'timedOut'>
): FailureCategory | null {
  if (result.timedOut) {
    return FailureCategory.AGENT_LOOP
  }

  if (/SyntaxError/.test(result.stderr)) {
    return FailureCategory.SYNTAX
  }

  if (/ModuleNotFoundError|ImportError/.test(result.stderr)) {
    return FailureCategory.ARCHITECTURE
  }

  if (/RuntimeError|Traceback \(most recent call last\)/.test(result.stderr)) {
    return FailureCategory.LOGIC
  }

  return null
}
