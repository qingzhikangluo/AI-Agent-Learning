import {
  createEmptyPlayerState,
  FilePlayerStateStore,
  type PlayerState
} from '@ai-agent-rpg/progression'

export interface PlayerStatus {
  currentMission: string
  skills: string[]
  boss: 'locked' | 'in-progress' | 'passed'
  transfer: 'locked' | 'in-progress' | 'passed'
}

export function defaultStatus(): PlayerStatus {
  return statusFromState(createEmptyPlayerState())
}

export function statusFromState(state: PlayerState): PlayerStatus {
  return {
    currentMission: state.currentMissionId,
    skills: state.skills
      .filter((skill) => skill.level > 0)
      .map((skill) => skill.skillId)
      .sort(),
    boss: state.boss.status,
    transfer: state.transfer.status
  }
}

export async function readStatus(
  workspaceDir: string
): Promise<PlayerStatus> {
  const store = new FilePlayerStateStore(workspaceDir)
  const state = (await store.read()) ?? createEmptyPlayerState()
  return statusFromState(state)
}

export function formatStatus(status: PlayerStatus): string {
  return [
    `Current Mission: ${status.currentMission}`,
    `Skills: ${status.skills.join(', ') || 'none'}`,
    `Boss: ${status.boss}`,
    `Transfer: ${status.transfer}`
  ].join('\n')
}
