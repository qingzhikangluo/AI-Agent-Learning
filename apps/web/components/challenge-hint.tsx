'use client'

import { useState } from 'react'

import { getChallengeHint } from '@/lib/challenge-examples'
import { useLanguage } from '@/lib/i18n'

export function ChallengeHint({
  challengeId,
  challengeType
}: {
  challengeId: string
  challengeType: 'concept' | 'code'
}) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const hint = getChallengeHint(challengeId)

  if (!hint) return null

  const label = open
    ? t('collapseExample')
    : challengeType === 'code'
      ? t('hintShowCode')
      : t('hintShowAnswer')

  return (
    <div className="challenge-node-hint">
      <button
        className="hint-toggle"
        type="button"
        aria-expanded={open}
        aria-controls={`hint-${challengeId}`}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      {open && (
        <div
          className="hint-sample"
          id={`hint-${challengeId}`}
        >
          <p>{hint.hintText}</p>
          <pre>
            <code>{hint.exampleCode}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
