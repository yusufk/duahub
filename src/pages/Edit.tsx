import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchDuaContent, editDua } from '../hooks/useDuas'
import DuaForm, { EMPTY_FORM, type DuaFormData } from '../components/DuaForm'

export default function Edit() {
  const { category, slug } = useParams()
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<DuaFormData>({ ...EMPTY_FORM, category: category || 'sunnah' })

  useEffect(() => {
    if (!category || !slug) return
    fetchDuaContent(`duas/${category}/${slug}.md`)
      .then(({ meta, body }) => {
        const s = parseBodySections(body)
        setForm({
          title: String(meta.title || slug),
          category: String(meta.category || category),
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
      .finally(() => setLoading(false))
  }, [category, slug])

  if (!user || !token) {
    return (
      <div className="form-page" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>Edit Dua</h1>
        <p style={{ marginBottom: '1rem' }}>You need to sign in with GitHub to edit duas.</p>
        <Link to="/login" className="btn">Sign in with GitHub</Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="spinner" />
        <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem' }}>Loading dua...</span>
      </div>
    )
  }

  if (success) {
    return (
      <div className="form-page" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>✏️ Edit submitted!</h1>
        <p style={{ margin: '1rem 0' }}>Your changes have been submitted as a pull request.</p>
        <a href={success.url} target="_blank" rel="noreferrer" className="btn" style={{ textDecoration: 'none', display: 'inline-block', marginRight: '1rem' }}>
          View PR on GitHub
        </a>
        <Link to={`/dua/${category}/${slug}`} className="btn btn-outline" style={{ textDecoration: 'none' }}>Back to dua</Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !user || !category || !slug) return
    setSubmitting(true)
    setError(null)
    try {
      const pr = await editDua(token, user.login, `duas/${category}/${slug}.md`, form)
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
      <Link to={`/dua/${category}/${slug}`} style={{ fontSize: '0.9rem', color: 'var(--ink-light)', textDecoration: 'none' }}>
        ← back to dua
      </Link>
      <h1 style={{ marginTop: '0.5rem' }}>Edit: {form.title}</h1>
      <p style={{ color: 'var(--ink-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Your changes will be submitted as a pull request for review.
      </p>
      <DuaForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel="✏️ Submit Edit"
        titleEditable={false}
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
