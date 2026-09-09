import { describe, expect, it } from 'vitest'

import { hello } from './greeting'

describe('hello', () => {
  it('greets the caller by name', () => {
    expect(hello('AI Agent RPG')).toBe('Hello, AI Agent RPG!')
  })
})
