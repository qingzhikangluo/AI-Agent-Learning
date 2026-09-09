export interface BossScoreInput {
  deterministicScore: number
  explanationAnswerScores: number[]
}

export interface BossScoreResult {
  deterministicScore: number
  explanationScore: number
  total: number
}

export function scoreStructuredAnswers(
  correct: string[],
  submitted: string[]
): number {
  if (correct.length === 0) {
    return 0
  }
  const correctCount = correct.filter((answer) =>
    submitted.includes(answer)
  ).length
  return correctCount / correct.length
}

export function scoreBoss(input: BossScoreInput): BossScoreResult {
  const explanationScore =
    input.explanationAnswerScores.length === 0
      ? 0
      : input.explanationAnswerScores.reduce((sum, score) => sum + score, 0) /
        input.explanationAnswerScores.length
  const total =
    input.deterministicScore * 0.7 + explanationScore * 0.3

  return {
    deterministicScore: input.deterministicScore,
    explanationScore,
    total
  }
}
