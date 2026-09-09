import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const webDir = resolve(dirname(fileURLToPath(import.meta.url)), '../apps/web')
const isWindows = process.platform === 'win32'
const command = isWindows ? 'cmd.exe' : 'npm'
const args = isWindows ? ['/d', '/s', '/c', 'npm run build'] : ['run', 'build']

const result = spawnSync(command, args, {
  cwd: webDir,
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1'
  },
  stdio: 'inherit'
})

if (result.error) {
  console.error(`Unable to run web build: ${result.error.message}`)
  process.exit(1)
}

if (result.status !== 0) {
  console.error(`Web build failed with exit code ${result.status}`)
  process.exit(result.status ?? 1)
}
