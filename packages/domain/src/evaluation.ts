export enum FailureCategory {
  SYNTAX = 'syntax',
  API = 'api',
  JSON = 'json',
  TOOL_SCHEMA = 'tool_schema',
  PROMPT = 'prompt',
  LOGIC = 'logic',
  AGENT_LOOP = 'agent_loop',
  ERROR_HANDLING = 'error_handling',
  ARCHITECTURE = 'architecture'
}

export type ExpectedBehaviorType =
  | 'exact'
  | 'contains'
  | 'tool_called'
  | 'tool_not_called'
  | 'tool_sequence'
  | 'error_handled'

export interface ExpectedBehavior {
  type: ExpectedBehaviorType
  value?: unknown
}

export type TestVisibility = 'public' | 'hidden'

export interface TestCase {
  id: string
  name: string
  visibility: TestVisibility
  input: unknown
  expectedBehavior: ExpectedBehavior
  failureCategory?: FailureCategory
}

export interface TestResult {
  testId: string
  passed: boolean
  failureCategory?: FailureCategory
  message?: string
}

export interface EvaluationResult {
  passed: boolean
  score: number
  testResults: TestResult[]
  failureCategories: FailureCategory[]
  feedback: string[]
}
