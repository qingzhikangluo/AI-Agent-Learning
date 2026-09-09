'use client'

import { useState } from 'react'

import {
  getChallengeDetail,
  getChallengeHint
} from '@/lib/challenge-data'
import { useLanguage } from '@/lib/i18n'

export function ChallengeHint({
  challengeId
}: {
  challengeId: string
}) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const challenge = getChallengeDetail(challengeId)
  const hint = getChallengeHint(challengeId)

  if (!challenge || !hint) return null

  const label = open
    ? t('collapseExample')
    : challenge.type === 'code'
      ? t('hintShowCode')
      : t('hintShowAnswer')

  return (
    <div className="challenge-node-hint">
      <button
        className="hint-toggle"
        type="button"
        aria-expanded={open}
        aria-controls={`hint-${challenge.id}`}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      {open && (
        <div
          className="hint-sample"
          id={`hint-${challenge.id}`}
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
