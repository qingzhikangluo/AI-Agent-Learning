import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export interface PlayerStatus {
  currentMission: string
  skills: string[]
  boss: 'locked' | 'in-progress' | 'passed'
  transfer: 'locked' | 'in-progress' | 'passed'
}

export function defaultStatus(): PlayerStatus {
  return {
    currentMission: 'mission-01',
    skills: [],
    boss: 'locked',
    transfer: 'locked'
  }
}

export async function readStatus(
  workspaceDir: string
): Promise<PlayerStatus> {
  const filePath = join(workspaceDir, '.agent-rpg-status.json')

  try {
    const raw = await readFile(filePath, 'utf8')
    return JSON.parse(raw) as PlayerStatus
  } catch {
    return defaultStatus()
  }
}

export function formatStatus(status: PlayerStatus): string {
  return [
    `Current Mission: ${status.currentMission}`,
    `Skills: ${status.skills.join(', ') || 'none'}`,
    `Boss: ${status.boss}`,
    `Transfer: ${status.transfer}`
  ].join('\n')
}
