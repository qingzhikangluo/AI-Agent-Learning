import { PythonRuntime } from '@ai-agent-rpg/runtime'
import { NextResponse } from 'next/server'

import { loadChallengeRuntime } from '@/lib/server-data'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    )
  }

  const { challengeId, source } = (body ?? {}) as {
    challengeId?: unknown
    source?: unknown
  }

  if (typeof challengeId !== 'string' || typeof source !== 'string') {
    return NextResponse.json(
      { error: 'challengeId and source are required.' },
      { status: 400 }
    )
  }

  const challenge = await loadChallengeRuntime(challengeId)
  if (!challenge) {
    return NextResponse.json(
      { error: `Unknown challenge: ${challengeId}` },
      { status: 404 }
    )
  }
  if (challenge.locked) {
    return NextResponse.json(
      { error: 'Challenge is locked.' },
      { status: 403 }
    )
  }

  const execution = await new PythonRuntime().execute({
    language: 'python',
    source,
    timeoutMs: 10_000
  })

  return NextResponse.json({
    execution: {
      exitCode: execution.exitCode,
      stdout: execution.stdout,
      stderr: execution.stderr,
      timedOut: execution.timedOut,
      durationMs: execution.durationMs
    }
  })
}
