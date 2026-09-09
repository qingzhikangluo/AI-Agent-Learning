import test from 'node:test'
import assert from 'node:assert/strict'
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

test('MVP monorepo directories exist', () => {
  for (const dir of requiredDirs) {
    assert.equal(
      existsSync(join(root, dir)),
      true,
      `missing directory: ${dir}`
    )
  }
})

test('root package.json declares build and test scripts', () => {
  const packageJson = JSON.parse(
    readFileSync(join(root, 'package.json'), 'utf8')
  )
  assert.equal(typeof packageJson.scripts?.build, 'string')
  assert.equal(typeof packageJson.scripts?.test, 'string')
})

test('CI workflow runs lint, typecheck, test, and build', () => {
  const ciPath = join(root, '.github', 'workflows', 'ci.yml')
  assert.equal(existsSync(ciPath), true, `missing file: ${ciPath}`)

  const ci = readFileSync(ciPath, 'utf8')
  for (const command of [
    'npm run lint',
    'npm run typecheck',
    'npm test',
    'npm run build'
  ]) {
    assert.equal(ci.includes(command), true, `CI missing step: ${command}`)
  }
})
