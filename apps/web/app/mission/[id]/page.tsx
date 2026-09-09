import { AppShell } from '@/components/app-shell'
import { MissionPage } from '@/components/mission-page'
import { playerState } from '@/lib/player-data'
import { notFound } from 'next/navigation'

type MissionPageProps = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return playerState.missions.map((mission) => ({
    id: mission.id
  }))
}

export default async function MissionRoute({ params }: MissionPageProps) {
  const { id } = await params
  const mission = playerState.missions.find((item) => item.id === id)

  if (!mission) {
    notFound()
  }

  return (
    <AppShell>
      <MissionPage mission={mission} />
    </AppShell>
  )
}
