import { AppShell } from '@/components/app-shell'
import { MissionPage } from '@/components/mission-page'
import { loadMissionView } from '@/lib/server-data'
import { notFound } from 'next/navigation'

type MissionPageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function MissionRoute({ params }: MissionPageProps) {
  const { id } = await params
  const mission = await loadMissionView(id)

  if (!mission) {
    notFound()
  }

  return (
    <AppShell>
      <MissionPage mission={mission} />
    </AppShell>
  )
}
