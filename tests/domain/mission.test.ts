import {
  ChallengeType,
  type Challenge,
  type Mission
} from '@ai-agent-rpg/domain'
import { describe, expect, it } from 'vitest'

describe('Mission', () => {
  it('carries prerequisites, skill targets, challenges, and optional boss', () => {
    const mission = {
      id: 'mission-01',
      title: 'AI Agent Mental Model',
      description: 'Understand what an agent is and is not.',
      prerequisites: [],
      skillTargets: ['agent.mental-model'],
      challenges: ['workflow-vs-agent'],
      bossId: 'first-agent-boss'
    } satisfies Mission

    expect(mission).toEqual({
      id: 'mission-01',
      title: 'AI Agent Mental Model',
      description: 'Understand what an agent is and is not.',
      prerequisites: [],
      skillTargets: ['agent.mental-model'],
      challenges: ['workflow-vs-agent'],
      bossId: 'first-agent-boss'
    })
  })
})

describe('Challenge', () => {
  it('carries mission, type, title, description, and objectives', () => {
    const challenge = {
      id: 'workflow-vs-agent',
      missionId: 'mission-01',
      type: ChallengeType.CONCEPT,
      title: 'Workflow vs Agent',
      description: 'Identify when an agent is the right tool.',
      objectives: ['Explain the difference between workflow and agent']
    } satisfies Challenge

    expect(challenge).toEqual({
      id: 'workflow-vs-agent',
      missionId: 'mission-01',
      type: 'concept',
      title: 'Workflow vs Agent',
      description: 'Identify when an agent is the right tool.',
      objectives: ['Explain the difference between workflow and agent']
    })
  })
})
