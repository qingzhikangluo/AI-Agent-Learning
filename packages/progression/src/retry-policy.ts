export type RetryDecision =
  | 'retry_allowed'
  | 'remediation_required'
  | 'retry_after_remediation'

export interface RetryPolicyInput {
  consecutiveFailures: number
  remediationCompleted: boolean
}

export interface RetryPolicyResult {
  allowed: boolean
  decision: RetryDecision
}

export function evaluateRetryPolicy(
  input: RetryPolicyInput
): RetryPolicyResult {
  if (input.consecutiveFailures <= 0) {
    throw new Error('consecutiveFailures must be positive')
  }

  if (input.consecutiveFailures === 1) {
    return { allowed: true, decision: 'retry_allowed' }
  }

  if (input.remediationCompleted) {
    return { allowed: true, decision: 'retry_after_remediation' }
  }

  return { allowed: false, decision: 'remediation_required' }
}
