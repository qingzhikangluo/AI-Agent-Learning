import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  runAgentTracesFromSource,
  runAgentTracesInWorkspace
} from '@ai-agent-rpg/runtime'
import { describe, expect, it } from 'vitest'

describe('agent trace runtime', () => {
  it('executes player code and normalizes tool and error traces', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-trace-'))

    try {
      await writeFile(
        join(workspaceDir, 'agent.py'),
        [
          'def run_agent(input):',
          '    mode = input.get("mode")',
          '    if mode == "tool":',
          '        return {',
          '            "output": "done",',
          '            "tool_calls": [',
          '                {"name": "get_weather", "arguments": {"city": "上海"}}',
          '            ],',
          '            "steps": [{"type": "tool", "tool_name": "get_weather"}],',
          '            "error_handling": {"had_error": False, "recovered": False},',
          '        }',
          '    if mode == "error":',
          '        return {',
          '            "output": "recovered",',
          '            "tool_calls": [',
          '                {"name": "get_weather", "error": "city not found", "result": "retry"}',
          '            ],',
          '            "error_handling": {',
          '                "had_error": True,',
          '                "recovered": True,',
          '                "message": "补充参数后重试",',
          '            },',
          '        }',
          '    return "plain text"',
          ''
        ].join('\n'),
        'utf8'
      )

      const result = await runAgentTracesInWorkspace(workspaceDir, [
        { mode: 'tool' },
        { mode: 'error' },
        { mode: 'plain' }
      ])

      expect(result.execution.exitCode).toBe(0)
      expect(result.traces).toHaveLength(3)
      expect(result.traces[0]?.output).toBe('done')
      expect(result.traces[0]?.toolCalls[0]?.name).toBe('get_weather')
      expect(result.traces[0]?.toolCalls[0]?.arguments).toEqual({
        city: '上海'
      })
      expect(result.traces[0]?.steps[0]?.toolName).toBe('get_weather')
      expect(result.traces[1]?.errorHandling).toEqual({
        hadError: true,
        recovered: true,
        message: '补充参数后重试'
      })
      expect(result.traces[2]?.output).toBe('plain text')
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('returns failure traces when agent.py has no entry point', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-trace-'))

    try {
      await writeFile(
        join(workspaceDir, 'agent.py'),
        'VALUE = 1\n',
        'utf8'
      )

      const result = await runAgentTracesInWorkspace(workspaceDir, [
        { message: 'hello' }
      ])

      expect(result.traces).toHaveLength(1)
      expect(result.traces[0]?.errorHandling.hadError).toBe(true)
      expect(result.traces[0]?.errorHandling.recovered).toBe(false)
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('runs trace inputs from a source string', async () => {
    const result = await runAgentTracesFromSource(
      [
        'def run_agent(input):',
        '    return {"output": "hello " + str(input.get("name", ""))}',
        ''
      ].join('\n'),
      [{ name: 'Ada' }]
    )

    expect(result.execution.exitCode).toBe(0)
    expect(result.traces[0]?.output).toBe('hello Ada')
  })
})
