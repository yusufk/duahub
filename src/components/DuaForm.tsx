import React from 'react'

export const CATEGORIES = [
  'morning-evening',
  'salah',
  'quranic',
  'sunnah',
  'daily-life',
  'emotions',
  'forgiveness',
  'protection',
  'occasions',
]

export const SOURCE_TYPES = [
  { value: 'quran', label: "Qur'an" },
  { value: 'hadith', label: 'Hadith' },
  { value: 'athar', label: 'Companion / Salaf (Athar)' },
  { value: 'general', label: 'General Supplication' },
]

export const GRADINGS = [
  { value: 'sahih', label: 'Sahih (Authentic)' },
  { value: 'hasan', label: 'Hasan (Sound)' },
  { value: 'daif', label: "Da'if (Weak)" },
]

export interface DuaFormData {
  title: string
  category: string
  source_type: string
  reference: string
  grading: string
  sunnah_ref: string
  occasion: string
  tags: string
  arabic: string
  transliteration: string
  translation: string
  reference_notes: string
  notes: string
}

export const EMPTY_FORM: DuaFormData = {
  title: '',
  category: 'sunnah',
  source_type: 'hadith',
  reference: '',
  grading: 'sahih',
  sunnah_ref: '',
  occasion: '',
  tags: '',
  arabic: '',
  transliteration: '',
  translation: '',
  reference_notes: '',
  notes: '',
}

interface DuaFormProps {
  form: DuaFormData
  setForm: React.Dispatch<React.SetStateAction<DuaFormData>>
  onSubmit: (e: React.FormEvent) => void
  submitting: boolean
  error: string | null
  submitLabel: string
  titleEditable?: boolean
}

export default function DuaForm({ form, setForm, onSubmit, submitting, error, submitLabel, titleEditable = true }: DuaFormProps) {
  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const isHadith = form.source_type === 'hadith'

  return (
    <>
      {error && <p style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</p>}

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="title">Dua Title</label>
          <input id="title" required value={form.title} onChange={update('title')} placeholder="Dua upon leaving the home" disabled={!titleEditable} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={update('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="occasion">Occasion / When to recite</label>
            <input id="occasion" value={form.occasion} onChange={update('occasion')} placeholder="when leaving the house" />
          </div>
        </div>

        {/* Authenticity block — required and prominent */}
        <fieldset style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '1rem', marginBottom: '1rem' }}>
          <legend style={{ fontWeight: 600, padding: '0 0.5rem' }}>Source &amp; Authenticity (required)</legend>
          <div style={{ display: 'grid', gridTemplateColumns: isHadith ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            <div className="field">
              <label htmlFor="source_type">Source Type</label>
              <select id="source_type" value={form.source_type} onChange={update('source_type')}>
                {SOURCE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {isHadith && (
              <div className="field">
                <label htmlFor="grading">Hadith Grading</label>
                <select id="grading" value={form.grading} onChange={update('grading')}>
                  {GRADINGS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="reference">Reference</label>
            <input id="reference" required value={form.reference} onChange={update('reference')} placeholder={isHadith ? 'e.g. Abu Dawud 5095' : form.source_type === 'quran' ? 'e.g. Al-Baqarah 2:201' : 'e.g. reported by Ibn Umar'} />
          </div>
          {isHadith && (
            <div className="field" style={{ marginBottom: 0, marginTop: '1rem' }}>
              <label htmlFor="sunnah_ref">Sunnah.com link (optional)</label>
              <input id="sunnah_ref" value={form.sunnah_ref} onChange={update('sunnah_ref')} placeholder="e.g. abudawud:5095 — collection-slug:number" />
            </div>
          )}
        </fieldset>

        <div className="field">
          <label htmlFor="tags">Tags</label>
          <input id="tags" value={form.tags} onChange={update('tags')} placeholder="home, protection, travel" />
        </div>

        <div className="field">
          <label htmlFor="arabic">Arabic</label>
          <textarea id="arabic" required value={form.arabic} onChange={update('arabic')} dir="rtl" lang="ar" placeholder="&#1575;&#1604;&#1593;&#1585;&#1576;&#1610;&#1577;" style={{ minHeight: '100px', fontSize: '1.5rem', lineHeight: 2, textAlign: 'right', fontFamily: 'var(--font-arabic)' }} />
        </div>

        <div className="field">
          <label htmlFor="transliteration">Transliteration</label>
          <textarea id="transliteration" value={form.transliteration} onChange={update('transliteration')} placeholder="Allahumma inni as'aluka..." style={{ minHeight: '80px', fontStyle: 'italic' }} />
        </div>

        <div className="field">
          <label htmlFor="translation">Translation</label>
          <textarea id="translation" required value={form.translation} onChange={update('translation')} placeholder="O Allah, I ask You for..." style={{ minHeight: '80px' }} />
        </div>

        <div className="field">
          <label htmlFor="reference_notes">Reference Details (grading, narrator, context)</label>
          <textarea id="reference_notes" value={form.reference_notes} onChange={update('reference_notes')} placeholder="Narrated by Abu Hurayrah; graded sahih by al-Albani in Sahih Abi Dawud." style={{ minHeight: '70px' }} />
        </div>

        <div className="field">
          <label htmlFor="notes">Notes / Virtues (optional)</label>
          <textarea id="notes" value={form.notes} onChange={update('notes')} placeholder="Whoever says this upon leaving home will be sufficed and protected..." style={{ minHeight: '70px' }} />
        </div>

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? <><span className="spinner" /> Saving...</> : submitLabel}
        </button>
      </form>
    </>
  )
}
