import { authenticityLabel, isProphetic, type SourceType, type Grading } from '../hooks/useDuas'

interface BadgeProps {
  source_type: SourceType
  grading: Grading
  size?: 'sm' | 'md'
}

/**
 * Monochrome authenticity badge. No colour — just a clear glyph + label.
 * ✓ = confirmed from Qur'an or authentic/sound hadith (Prophetic ﷺ)
 * ! = weak narration (da'if) — recite with caution
 * ◦ = athar (companion/salaf) or general supplication (not directly Prophetic)
 */
export default function AuthenticityBadge({ source_type, grading, size = 'md' }: BadgeProps) {
  const prophetic = isProphetic({ source_type, grading })
  const weak = source_type === 'hadith' && grading === 'daif'

  const glyph = prophetic ? '✓' : weak ? '!' : '◦'
  const label = authenticityLabel({ source_type, grading })

  return (
    <span
      className={`auth-badge ${size === 'sm' ? 'auth-badge-sm' : ''} ${prophetic ? 'auth-prophetic' : weak ? 'auth-weak' : 'auth-general'}`}
      title={prophetic ? 'Confirmed from the Qur\u2019an or authentic Sunnah of the Prophet \uFDFA' : weak ? 'Weak narration \u2014 recite with caution' : 'Not directly from the Prophet \uFDFA'}
    >
      <span className="auth-glyph" aria-hidden="true">{glyph}</span>
      {label}
    </span>
  )
}
