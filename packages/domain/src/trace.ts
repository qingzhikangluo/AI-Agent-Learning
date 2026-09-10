export interface AgentToolCall {
  name: string
  arguments?: Record<string, unknown>
  result?: unknown
  error?: string
}

export interface AgentTraceStep {
  type: 'model' | 'tool' | 'final'
  content?: string
  toolName?: string
}

export interface AgentErrorHandling {
  hadError: boolean
  recovered: boolean
  message?: string
}

export interface AgentTrace {
  output: string
  steps: AgentTraceStep[]
  toolCalls: AgentToolCall[]
  errorHandling: AgentErrorHandling
}
