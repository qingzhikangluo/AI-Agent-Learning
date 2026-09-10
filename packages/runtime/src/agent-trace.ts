import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type {
  AgentErrorHandling,
  AgentToolCall,
  AgentTrace,
  AgentTraceStep
} from '@ai-agent-rpg/domain'

import type { ExecutionResult } from './runtime'
import { runWorkspaceEntry } from './test-runner'

const TRACE_PREFIX = 'AGENT_RPG_TRACE_JSON:'

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function normalizeToolCall(value: unknown): AgentToolCall | undefined {
  const record = asRecord(value)
  const name = optionalString(record.name)
  if (!name) return undefined

  return {
    name,
    arguments: asRecord(record.arguments) as Record<string, unknown>,
    result: record.result,
    error: optionalString(record.error)
  }
}

function normalizeStep(value: unknown): AgentTraceStep | undefined {
  const record = asRecord(value)
  const type = record.type
  if (type !== 'model' && type !== 'tool' && type !== 'final') {
    return undefined
  }

  return {
    type,
    content: optionalString(record.content),
    toolName: optionalString(record.tool_name ?? record.toolName)
  }
}

function normalizeErrorHandling(
  value: unknown,
  toolCalls: AgentToolCall[]
): AgentErrorHandling {
  const record = asRecord(value)
  const hadError =
    Boolean(record.had_error ?? record.hadError) ||
    toolCalls.some((call) => Boolean(call.error))
  const recovered =
    Boolean(record.recovered) ||
    (hadError &&
      toolCalls.some(
        (call) => Boolean(call.error) && call.result !== undefined
      ))

  return {
    hadError,
    recovered,
    message: optionalString(record.message)
  }
}

export function normalizeAgentTrace(value: unknown): AgentTrace {
  const record = asRecord(value)
  const rawCalls = Array.isArray(record.tool_calls)
    ? record.tool_calls
    : Array.isArray(record.toolCalls)
      ? record.toolCalls
      : []
  const toolCalls = rawCalls
    .map(normalizeToolCall)
    .filter((call): call is AgentToolCall => Boolean(call))
  const rawSteps = Array.isArray(record.steps) ? record.steps : []
  const steps = rawSteps
    .map(normalizeStep)
    .filter((step): step is AgentTraceStep => Boolean(step))
  const outputValue = record.output

  return {
    output:
      typeof outputValue === 'string'
        ? outputValue
        : outputValue === undefined
          ? ''
          : JSON.stringify(outputValue),
    steps,
    toolCalls,
    errorHandling: normalizeErrorHandling(
      record.error_handling ?? record.errorHandling,
      toolCalls
    )
  }
}

function failureTrace(message: string): AgentTrace {
  return {
    output: '',
    steps: [],
    toolCalls: [],
    errorHandling: {
      hadError: true,
      recovered: false,
      message
    }
  }
}

function buildHarnessSource(inputs: unknown[]): string {
  return `
import importlib
import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

sys.path.insert(0, os.getcwd())

INPUTS = json.loads(${JSON.stringify(JSON.stringify(inputs))})

outputs = []

try:
    agent = importlib.import_module("agent")
except Exception as exc:  # pragma: no cover - reported through traces
    message = f"{type(exc).__name__}: {exc}"
    for _ in INPUTS:
        outputs.append({
            "output": "",
            "tool_calls": [],
            "steps": [],
            "error_handling": {
                "had_error": True,
                "recovered": False,
                "message": message,
            },
        })
else:
    runner = getattr(agent, "run_agent", None) or getattr(agent, "handle", None)
    is_run_agent = getattr(agent, "run_agent", None) is not None

    for item in INPUTS:
        try:
            if runner is None:
                raise RuntimeError(
                    "agent.py must define run_agent(input) or handle(user_message)"
                )
            if is_run_agent:
                value = runner(item)
            else:
                message = item.get("message", item) if isinstance(item, dict) else item
                value = runner(message)
            if isinstance(value, str):
                value = {"output": value}
            if not isinstance(value, dict):
                value = {"output": str(value)}
            outputs.append(value)
        except Exception as exc:
            outputs.append({
                "output": "",
                "tool_calls": [],
                "steps": [],
                "error_handling": {
                    "had_error": True,
                    "recovered": False,
                    "message": f"{type(exc).__name__}: {exc}",
                },
            })

print("${TRACE_PREFIX}" + json.dumps(outputs, ensure_ascii=False))
`
}

function parseTraces(
  stdout: string,
  inputCount: number
): AgentTrace[] | undefined {
  const line = stdout
    .split(/\r?\n/)
    .reverse()
    .find((entry) => entry.startsWith(TRACE_PREFIX))

  if (!line) return undefined

  try {
    const parsed = JSON.parse(line.slice(TRACE_PREFIX.length)) as unknown
    if (!Array.isArray(parsed)) return undefined

    return Array.from({ length: inputCount }, (_, index) =>
      normalizeAgentTrace(parsed[index])
    )
  } catch {
    return undefined
  }
}

export interface AgentTraceExecution {
  execution: ExecutionResult
  traces: AgentTrace[]
}

export async function runAgentTracesInWorkspace(
  workspaceDir: string,
  inputs: unknown[],
  timeoutMs = 15_000
): Promise<AgentTraceExecution> {
  const harnessDir = await mkdtemp(join(tmpdir(), 'agent-rpg-trace-'))
  const harnessPath = join(harnessDir, 'harness.py')
  await writeFile(harnessPath, buildHarnessSource(inputs), 'utf8')

  try {
    const execution = await runWorkspaceEntry(
      workspaceDir,
      harnessPath,
      timeoutMs
    )
    const parsed = parseTraces(execution.stdout, inputs.length)

    return {
      execution,
      traces:
        parsed ??
        inputs.map(() =>
          failureTrace(
            execution.stderr.trim() ||
              'Agent trace output was missing or invalid.'
          )
        )
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      execution: {
        exitCode: 1,
        stdout: '',
        stderr: message,
        timedOut: false,
        durationMs: 0
      },
      traces: inputs.map(() => failureTrace(message))
    }
  } finally {
    await rm(harnessDir, { recursive: true, force: true })
  }
}
