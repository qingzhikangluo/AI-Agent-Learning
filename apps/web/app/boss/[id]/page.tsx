import { AppShell } from '@/components/app-shell'
import { BossPage } from '@/components/boss-page'
import { loadBossView } from '@/lib/server-data'
import { notFound } from 'next/navigation'

type BossRouteProps = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function BossRoute({ params }: BossRouteProps) {
  const { id } = await params
  const boss = await loadBossView(id)

  if (!boss) {
    notFound()
  }

  return (
    <AppShell>
      <BossPage boss={boss} />
    </AppShell>
  )
}
