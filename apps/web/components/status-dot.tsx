'use client'

import { useLanguage } from '@/lib/i18n'

type Status = 'passed' | 'active' | 'failed' | 'hint' | 'locked'

export function StatusDot({ status }: { status: Status }) {
  const { t } = useLanguage()
  const statusText: Record<Status, string> = {
    passed: t('statusPassed'),
    active: t('statusActive'),
    failed: t('statusFailed'),
    hint: t('statusGuided'),
    locked: t('statusLocked')
  }

  return (
    <span className="status">
      <span className={`status-dot is-${status}`} aria-hidden="true" />
      {statusText[status]}
    </span>
  )
}
