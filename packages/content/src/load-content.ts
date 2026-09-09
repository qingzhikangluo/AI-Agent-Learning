import { readFile, readdir } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load as parseYaml } from 'js-yaml'
import { z } from 'zod'

import { challengeSchema, missionSchema } from './schemas'

export class ContentValidationError extends Error {}

const moduleDir = dirname(fileURLToPath(import.meta.url))
export const contentRoot = resolve(moduleDir, '..')
export const missionsContentDir = join(contentRoot, 'missions')

async function collectContentFiles(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true }).catch(
    () => []
  )
  const files: string[] = []

  for (const entry of entries) {
    const entryPath = join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectContentFiles(entryPath)))
    } else if (['.json', '.yaml', '.yml'].includes(extname(entry.name))) {
      files.push(entryPath)
    }
  }

  return files
}

async function collectMissionFiles(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true }).catch(
    () => []
  )
  const files: string[] = []

  for (const entry of entries) {
    const entryPath = join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectMissionFiles(entryPath)))
    } else if (['mission.json', 'mission.yaml', 'mission.yml'].includes(entry.name)) {
      files.push(entryPath)
    }
  }

  return files
}

export async function loadValidatedFile<T>(
  filePath: string,
  schema: z.ZodType<T>
): Promise<T> {
  const raw = await readFile(filePath, 'utf8')
  const extension = extname(filePath)
  const parsed =
    extension === '.yaml' || extension === '.yml'
      ? parseYaml(raw)
      : JSON.parse(raw)

  const result = schema.safeParse(parsed)
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const path = issue.path.join('.') || '(root)'
        return `${path}: ${issue.message}`
      })
      .join('; ')
    throw new ContentValidationError(
      `Invalid content file ${filePath}: ${issues}`
    )
  }

  return result.data
}

export async function loadContentFiles<T>(
  dirPath: string,
  schema: z.ZodType<T>
): Promise<T[]> {
  const files = await collectContentFiles(dirPath)
  const items: T[] = []

  for (const file of files) {
    items.push(await loadValidatedFile(file, schema))
  }

  return items
}

export async function loadMissions(
  dirPath: string = missionsContentDir
): Promise<Array<z.infer<typeof missionSchema>>> {
  const files = await collectMissionFiles(dirPath)
  const missions: Array<z.infer<typeof missionSchema>> = []

  for (const file of files) {
    missions.push(await loadValidatedFile(file, missionSchema))
  }

  return missions
}

export async function loadChallenges(
  dirPath: string
): Promise<Array<z.infer<typeof challengeSchema>>> {
  return loadContentFiles(dirPath, challengeSchema)
}
