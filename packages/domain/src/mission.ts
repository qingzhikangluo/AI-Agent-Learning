export interface Mission {
  id: string
  title: string
  description: string
  prerequisites: string[]
  skillTargets: string[]
  challenges: string[]
  bossId?: string
}
