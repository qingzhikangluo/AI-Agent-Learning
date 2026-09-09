import { fileURLToPath } from 'node:url'

import {
  discoverPythonFiles,
  runWorkspaceEntry
} from '@ai-agent-rpg/runtime'
import { describe, expect, it } from 'vitest'

const fixtureDir = fileURLToPath(
  new URL('./fixtures/workspace', import.meta.url)
)

describe('Python test runner', () => {
  it('discovers python files in a workspace', async () => {
    const files = await discoverPythonFiles(fixtureDir)

    expect(files).toContain('main.py')
    expect(files).toContain('helper.py')
    expect(files).toContain('failing.py')
  })

  it('runs a workspace entry and captures stdout', async () => {
    const result = await runWorkspaceEntry(fixtureDir, 'main.py')

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('main output')
  })

  it('captures stderr and returns a non-zero exit code', async () => {
    const result = await runWorkspaceEntry(fixtureDir, 'failing.py')

    expect(result.exitCode).toBe(7)
    expect(result.stderr).toContain('failure detail')
  })
})
