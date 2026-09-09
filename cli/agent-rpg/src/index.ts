import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

import { initWorkspace } from './commands/init'

async function main(): Promise<void> {
  const [, , command] = process.argv

  if (command === 'init') {
    await initWorkspace({ workspaceDir: process.cwd() })
    console.log('Initialized agent-rpg player workspace.')
    return
  }

  console.log(
    'Usage: agent-rpg <command>\n\nCommands:\n  init    Initialize a player workspace'
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
