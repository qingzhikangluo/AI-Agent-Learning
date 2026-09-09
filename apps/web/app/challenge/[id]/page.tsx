import { AppShell } from '@/components/app-shell'
import { ChallengePage } from '@/components/challenge-page'
import { challengeDetails, getChallengeDetail } from '@/lib/challenge-data'
import { playerState } from '@/lib/player-data'
import { notFound } from 'next/navigation'

type ChallengeRouteProps = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return Object.keys(challengeDetails).map((id) => ({ id }))
}

export default async function ChallengeRoute({
  params
}: ChallengeRouteProps) {
  const { id } = await params
  const challenge = getChallengeDetail(id)
  const mission = playerState.missions.find(
    (item) => item.id === challenge?.missionId
  )

  if (!challenge || !mission) {
    notFound()
  }

  const summary = mission.challenges.find((item) => item.id === challenge.id)
  if (!summary) {
    notFound()
  }

  return (
    <AppShell>
      <ChallengePage
        challenge={challenge}
        missionTitle={mission.title}
        status={summary.status}
        locked={mission.status === 'locked' || summary.status === 'locked'}
      />
    </AppShell>
  )
}
