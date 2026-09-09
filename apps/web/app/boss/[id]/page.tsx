import { AppShell } from '@/components/app-shell'
import { BossPage } from '@/components/boss-page'
import { playerState } from '@/lib/player-data'
import { notFound } from 'next/navigation'

type BossRouteProps = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return [{ id: playerState.boss.id }]
}

export default async function BossRoute({ params }: BossRouteProps) {
  const { id } = await params

  if (id !== playerState.boss.id) {
    notFound()
  }

  return (
    <AppShell>
      <BossPage boss={playerState.boss} />
    </AppShell>
  )
}
