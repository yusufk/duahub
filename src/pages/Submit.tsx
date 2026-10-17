import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { submitDua, fetchDuaContent } from '../hooks/useDuas'
import DuaForm, { EMPTY_FORM, type DuaFormData } from '../components/DuaForm'

export default function Submit() {
  const { user, token } = useAuth()
  const [searchParams] = useSearchParams()
  const varyFrom = searchParams.get('vary')

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<DuaFormData>(EMPTY_FORM)
  const [loadingVariation, setLoadingVariation] = useState(!!varyFrom)
  const [originalTitle, setOriginalTitle] = useState('')

  useEffect(() => {
    if (!varyFrom) return
    setLoadingVariation(true)
    fetchDuaContent(varyFrom)
      .then(({ meta, body }) => {
        const s = parseBodySections(body)
        const title = String(meta.title || '')
        setOriginalTitle(title)
        setForm({
          title: `${title} (variation)`,
          category: String(meta.category || 'sunnah'),
          source_type: String(meta.source_type || 'hadith'),
          reference: String(meta.reference || ''),
          grading: String(meta.grading || 'sahih'),
          sunnah_ref: String(meta.sunnah_ref || ''),
          occasion: String(meta.occasion || ''),
          tags: Array.isArray(meta.tags) ? meta.tags.join(', ') : String(meta.tags || ''),
          arabic: s.arabic,
          transliteration: s.transliteration,
          translation: s.translation,
          reference_notes: s.reference,
          notes: s.notes,
        })
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingVariation(false))
  }, [varyFrom])

  if (!user || !token) {
    return (
      <div className="form-page" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>{varyFrom ? 'Make a Variation' : 'Add a Dua'}</h1>
        <p style={{ marginBottom: '1rem' }}>You need to sign in with GitHub to submit duas.</p>
        <Link to="/login" className="btn">Sign in with GitHub</Link>
      </div>
    )
  }

  if (loadingVariation) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="spinner" />
        <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem' }}>Loading dua to vary...</span>
      </div>
    )
  }

  if (success) {
    return (
      <div className="form-page" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>🎉 {varyFrom ? 'Variation' : 'Dua'} submitted!</h1>
        <p style={{ margin: '1rem 0' }}>Your pull request has been created. A maintainer will review it shortly.</p>
        <a href={success.url} target="_blank" rel="noreferrer" className="btn" style={{ textDecoration: 'none', display: 'inline-block', marginRight: '1rem' }}>
          View PR on GitHub
        </a>
        <button className="btn btn-outline" onClick={() => { setSuccess(null); setForm(EMPTY_FORM) }}>Submit another</button>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !user) return
    setSubmitting(true)
    setError(null)
    try {
      const pr = await submitDua(token, user.login, form, varyFrom || undefined)
      if (pr.html_url) setSuccess({ url: pr.html_url })
      else setError(pr.message || 'Failed to create PR')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <h1>{varyFrom ? '🔀 Make a Variation' : 'Add a Dua'}</h1>
      {varyFrom && originalTitle && (
        <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.2rem', color: 'var(--herb)', marginBottom: '0.5rem' }}>
          Based on: {originalTitle}
        </p>
      )}
      <p style={{ color: 'var(--ink-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        {varyFrom
          ? 'Modify the dua below to create your variation (e.g. a different narration). Give it a unique title!'
          : <>This will create a pull request on the <a href="https://github.com/yusufk/duahub" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>duahub repo</a> with your dua. Please provide an accurate source.</>
        }
      </p>
      <DuaForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel={varyFrom ? '🔀 Submit Variation' : '🤲 Submit Dua'}
      />
    </div>
  )
}

function parseBodySections(body: string): { arabic: string; transliteration: string; translation: string; reference: string; notes: string } {
  const out = { arabic: '', transliteration: '', translation: '', reference: '', notes: '' }
  const re = /##\s+(.+?)\n([\s\S]*?)(?=\n##\s|\n*$)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body)) !== null) {
    const key = m[1].trim().toLowerCase()
    const val = m[2].trim()
    if (key === 'arabic') out.arabic = val
    else if (key === 'transliteration') out.transliteration = val
    else if (key === 'translation') out.translation = val
    else if (key === 'reference') out.reference = val
    else if (key === 'notes') out.notes = val
  }
  return out
}
