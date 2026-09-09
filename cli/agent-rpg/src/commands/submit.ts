import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export interface SubmitOptions {
  workspaceDir: string
  explanation: string
  testResult?: string
  submittedAt?: string
}

export interface SubmitResult {
  submissionId: string
  submissionPath: string
}

export async function submitWorkspace(
  options: SubmitOptions
): Promise<SubmitResult> {
  const workspaceDir = options.workspaceDir
  const sourceFiles = ['agent.py', 'tools.py', 'config.py']
  const sourceParts: string[] = []

  for (const file of sourceFiles) {
    try {
      const content = await readFile(join(workspaceDir, file), 'utf8')
      sourceParts.push(`# --- ${file} ---\n${content}`)
    } catch {
      // Optional helper files may not exist yet.
    }
  }

  const readme = await readFile(join(workspaceDir, 'README.md'), 'utf8')
  const submittedAt = options.submittedAt ?? new Date().toISOString()
  const submissionId = `submission-${submittedAt.replace(/[:.]/g, '-')}`
  const submissionsDir = join(workspaceDir, '.agent-rpg', 'submissions')

  await mkdir(submissionsDir, { recursive: true })
  const submissionPath = join(submissionsDir, `${submissionId}.json`)
  const payload = {
    submissionId,
    source: sourceParts.join('\n\n'),
    readme,
    testResult: options.testResult ?? '',
    explanation: options.explanation,
    submittedAt
  }

  await writeFile(submissionPath, JSON.stringify(payload, null, 2), 'utf8')
  return { submissionId, submissionPath }
}
