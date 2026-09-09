export type HintLevelName =
  | 'concept'
  | 'direction'
  | 'specific'
  | 'partial'
  | 'solution'

const HINT_LEVEL_NAMES: Record<number, HintLevelName> = {
  1: 'concept',
  2: 'direction',
  3: 'specific',
  4: 'partial',
  5: 'solution'
}

export function hintLevelName(level: number): HintLevelName | null {
  return HINT_LEVEL_NAMES[level] ?? null
}

export function isValidHintLevel(level: number): boolean {
  return hintLevelName(level) !== null
}
