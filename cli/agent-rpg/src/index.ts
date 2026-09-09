import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

import { initWorkspace } from './commands/init'
import { runWorkspace } from './commands/run'
import { testWorkspace } from './commands/test'

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
    const result = await testWorkspace({ workspaceDir: process.cwd() })
    process.stdout.write(result.stdout)
    process.stderr.write(result.stderr)
    process.exitCode = result.exitCode
    return
  }

  console.log(
    'Usage: agent-rpg <command>\n\nCommands:\n  init    Initialize a player workspace\n  run     Run the player agent\n  test    Run player tests'
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
