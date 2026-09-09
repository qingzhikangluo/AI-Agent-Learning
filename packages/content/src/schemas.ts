import { ChallengeType, FailureCategory } from '@ai-agent-rpg/domain'
import { z } from 'zod'

const failureCategorySchema = z.nativeEnum(FailureCategory)

export const testCaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  visibility: z.enum(['public', 'hidden']),
  input: z.unknown(),
  expectedBehavior: z.object({
    type: z.enum([
      'exact',
      'contains',
      'tool_called',
      'tool_not_called',
      'tool_sequence',
      'error_handled'
    ]),
    value: z.unknown().optional()
  }),
  failureCategory: failureCategorySchema.optional()
})

export const learningBlockSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(['concept', 'example', 'instruction']).optional(),
  body: z.string().min(1)
})

export const hintSchema = z.object({
  id: z.string().min(1),
  level: z.number().int().min(0),
  content: z.string().min(1)
})

export const hintListSchema = z.array(hintSchema)

export const challengeSchema = z.object({
  id: z.string().min(1),
  missionId: z.string().min(1),
  type: z.nativeEnum(ChallengeType),
  title: z.string().min(1),
  description: z.string().min(1),
  objectives: z.array(z.string().min(1)),
  tests: z.array(testCaseSchema)
})

export const missionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  prerequisites: z.array(z.string()),
  skillTargets: z.array(z.string()),
  challenges: z.array(z.string()),
  learningBlocks: z.array(learningBlockSchema).optional(),
  bossId: z.string().optional()
})
