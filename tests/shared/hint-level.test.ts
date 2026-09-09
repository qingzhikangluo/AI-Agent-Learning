import { hintLevelName, isValidHintLevel } from '@ai-agent-rpg/shared'
import { describe, expect, it } from 'vitest'

describe('hint level system', () => {
  it('maps levels 1 through 5 to hint types', () => {
    expect(hintLevelName(1)).toBe('concept')
    expect(hintLevelName(2)).toBe('direction')
    expect(hintLevelName(3)).toBe('specific')
    expect(hintLevelName(4)).toBe('partial')
    expect(hintLevelName(5)).toBe('solution')
  })

  it('rejects out-of-range levels', () => {
    expect(isValidHintLevel(0)).toBe(false)
    expect(isValidHintLevel(6)).toBe(false)
    expect(hintLevelName(0)).toBeNull()
  })
})
