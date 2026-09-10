import { AppShell } from '@/components/app-shell'
import { ChallengePage } from '@/components/challenge-page'
import { loadChallengeView } from '@/lib/server-data'
import { notFound } from 'next/navigation'

type ChallengeRouteProps = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function ChallengeRoute({
  params
}: ChallengeRouteProps) {
  const { id } = await params
  const challenge = await loadChallengeView(id)

  if (!challenge) {
    notFound()
  }

  return (
    <AppShell>
      <ChallengePage
        challenge={challenge}
        missionTitle={challenge.missionTitle}
        status={challenge.status}
        locked={challenge.locked}
      />
    </AppShell>
  )
}
