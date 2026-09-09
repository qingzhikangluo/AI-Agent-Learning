export type RuntimeLanguage = 'python'

export interface ExecutionRequest {
  language: RuntimeLanguage
  source: string
  cwd?: string
  timeoutMs?: number
  args?: string[]
}

export interface ExecutionResult {
  exitCode: number
  stdout: string
  stderr: string
  timedOut: boolean
  durationMs: number
}

export interface Runtime {
  execute(input: ExecutionRequest): Promise<ExecutionResult>
}
