import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

import { initWorkspace } from './commands/init'
import { runWorkspace } from './commands/run'
import { testWorkspace } from './commands/test'
import { formatStatus, readStatus } from './commands/status'
import { submitWorkspace } from './commands/submit'

async function main(): Promise<void> {
  const [, , command] = process.argv

  if (command === 'init') {
    await initWorkspace({ workspaceDir: process.cwd() })
    console.log('Initialized agent-rpg player workspace.')
    return
  }

  if (command === 'run') {
    const result = await runWorkspace({ workspaceDir: process.cwd() })
    process.stdout.write(result.stdout)
    process.stderr.write(result.stderr)
    process.exitCode = result.exitCode
    return
  }

  if (command === 'test') {
    const args = process.argv.slice(3)
    const challengeFlagIndex = args.indexOf('--challenge')
    const challengeId =
      challengeFlagIndex >= 0 ? args[challengeFlagIndex + 1] : undefined
    const result = await testWorkspace({
      workspaceDir: process.cwd(),
      challengeId
    })
    console.log(result.passed ? 'PASS' : 'FAIL')
    console.log(`Challenge: ${result.challengeId} (${result.missionId})`)
    console.log(`Score: ${Math.round(result.score * 100)}%`)
    for (const test of result.publicResults) {
      console.log(`${test.passed ? 'PASS' : 'FAIL'} ${test.name}`)
    }
    if (result.hiddenSummary.total > 0) {
      console.log(
        `Hidden tests: ${result.hiddenSummary.passed}/${result.hiddenSummary.total}`
      )
    }
    if (result.failureCategories.length > 0) {
      console.log(
        `Failure categories: ${result.failureCategories.join(', ')}`
      )
    }
    process.exitCode = result.passed ? 0 : 1
    return
  }

  if (command === 'status') {
    const status = await readStatus(process.cwd())
    console.log(formatStatus(status))
    return
  }

  if (command === 'submit') {
    const args = process.argv.slice(3)
    const challengeFlagIndex = args.indexOf('--challenge')
    const challengeId =
      challengeFlagIndex >= 0 ? args[challengeFlagIndex + 1] : undefined
    const answerParts = args.filter(
      (_, index) =>
        index !== challengeFlagIndex &&
        (challengeFlagIndex < 0 || index !== challengeFlagIndex + 1)
    )
    const output = answerParts.join(' ').trim() || undefined
    const result = await submitWorkspace({
      workspaceDir: process.cwd(),
      challengeId,
      output,
      explanation: output
    })
    console.log(result.passed ? 'PASS' : 'FAIL')
    console.log(`Challenge: ${result.challengeId} (${result.missionId})`)
    console.log(`Score: ${Math.round(result.score * 100)}%`)
    for (const line of result.feedback) {
      console.log(`- ${line}`)
    }
    if (result.unlockedChallengeId) {
      console.log(`Unlocked challenge: ${result.unlockedChallengeId}`)
    }
    if (result.unlockedMissionId) {
      console.log(`Unlocked mission: ${result.unlockedMissionId}`)
    }
    if (result.bossUnlocked) {
      console.log('Boss unlocked.')
    }
    console.log(`State: ${result.statePath}`)
    console.log(`Submission saved: ${result.submissionPath}`)
    return
  }

  console.log(
    'Usage: agent-rpg <command>\n\nCommands:\n  init    Initialize a player workspace\n  run     Run the player agent\n  test    Test the current (or --challenge <id>) challenge\n  status  Show player status\n  submit  Submit the current (or --challenge <id>) challenge'
  )
}

const entryPath = fileURLToPath(import.meta.url)
const isMain =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === entryPath

if (isMain) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
