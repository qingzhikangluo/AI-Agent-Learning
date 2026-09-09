import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const requiredDirs = [
  'apps/web',
  'packages/domain',
  'packages/content',
  'packages/evaluator',
  'packages/progression',
  'packages/runtime',
  'packages/shared',
  'cli/agent-rpg',
  'player-workspace',
  'tests',
  'docs'
]

const failures = []

for (const dir of requiredDirs) {
  if (!existsSync(join(root, dir))) {
    failures.push(`missing directory: ${dir}`)
  }
}

const packageJson = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf8')
)

for (const script of ['build', 'test']) {
  if (typeof packageJson.scripts?.[script] !== 'string') {
    failures.push(`missing root script: ${script}`)
  }
}

if (failures.length > 0) {
  console.error('Monorepo structure verification FAILED')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('Monorepo structure verification PASSED')
for (const dir of requiredDirs) {
  console.log(`  - ${dir}`)
}
