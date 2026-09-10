import { AppShell } from '@/components/app-shell'
import { AssessmentPage } from '@/components/assessment-page'
import { loadAssessmentView } from '@/lib/server-data'

export const dynamic = 'force-dynamic'

export default async function AssessmentRoute() {
  const skills = await loadAssessmentView()

  return (
    <AppShell>
      <AssessmentPage skills={skills} />
    </AppShell>
  )
}
