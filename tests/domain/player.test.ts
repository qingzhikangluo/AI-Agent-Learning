import { describe, expect, it } from 'vitest'

import type { Player } from '@ai-agent-rpg/domain'

describe('Player', () => {
  it('carries id, name, and createdAt', () => {
    const player = {
      id: 'player-001',
      name: 'Ada Lovelace',
      createdAt: '2026-09-09T00:00:00.000Z'
    } satisfies Player

    expect(player).toEqual({
      id: 'player-001',
      name: 'Ada Lovelace',
      createdAt: '2026-09-09T00:00:00.000Z'
    })
  })
})
