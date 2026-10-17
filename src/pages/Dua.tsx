import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { fetchDuaContent, useDuas, quranComUrl, type SourceType, type Grading } from '../hooks/useDuas'
import { useAuth } from '../hooks/useAuth'
import { isFavourite, toggleFavourite } from '../hooks/useFavourites'
import AuthenticityBadge from '../components/AuthenticityBadge'
import Comments from '../components/Comments'

/** Split the markdown body into named sections so Arabic can render RTL. */
function splitSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const re = /##\s+(.+?)\n([\s\S]*?)(?=\n##\s|\n*$)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body)) !== null) {
    sections[m[1].trim().toLowerCase()] = m[2].trim()
  }
  return sections
}

export default function Dua() {
  const { category, slug } = useParams()
  const { user } = useAuth()
  const { duas } = useDuas()
  const [meta, setMeta] = useState<Record<string, unknown>>({})
  const [sections, setSections] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentPath = `duas/${category}/${slug}.md`
  const [saved, setSaved] = useState(() => isFavourite(currentPath))

  const variations = duas.filter(d => d.based_on === currentPath)
  const basedOnPath = meta.based_on as string | undefined
  const original = basedOnPath ? duas.find(d => d.path === basedOnPath) : null
  const isAuthor = user?.login === meta.author

  useEffect(() => {
    if (!category || !slug) return
    setLoading(true)
    fetchDuaContent(currentPath)
      .then(({ meta, body }) => {
        setMeta(meta)
        const stripped = body.replace(/^\s*#\s+.+\n*/, '')
        setSections(splitSections(stripped))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [category, slug])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}><span className="spinner" /></div>
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--accent)' }}>Dua not found</p>
        <Link to="/" style={{ color: 'var(--accent)' }}>← Back to duas</Link>
      </div>
    )
  }

  const sourceType = (meta.source_type as SourceType) || 'general'
  const grading = (meta.grading as Grading) || ''

  return (
    <article className="recipe-page">
      <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--ink-light)', textDecoration: 'none' }}>
        ← back to duas
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
        <h1 style={{ flex: 1 }}>{(meta.title as string) || slug}</h1>
        <button
          onClick={() => setSaved(toggleFavourite(currentPath))}
          title={saved ? 'Remove from saved' : 'Save dua'}
          style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', opacity: saved ? 1 : 0.4, transition: 'opacity 0.2s' }}
        >
          {saved ? '⭐' : '☆'}
        </button>
      </div>

      {/* Authenticity badge — prominent, right under the title */}
      <div style={{ margin: '0.5rem 0 1rem' }}>
        <AuthenticityBadge source_type={sourceType} grading={grading} />
        {meta.reference ? <span style={{ marginLeft: '0.75rem', color: 'var(--ink-light)', fontSize: '0.9rem' }}>{String(meta.reference)}</span> : null}
        {sourceType === 'quran' && quranComUrl(String(meta.reference || '')) && (
          <a
            href={quranComUrl(String(meta.reference))!}
            target="_blank"
            rel="noreferrer"
            style={{ marginLeft: '0.75rem', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}
          >
            Read on Quran.com ↗
          </a>
        )}
      </div>

      {original && (
        <div style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.1rem', color: 'var(--blue-ink)', marginBottom: '0.5rem' }}>
          🔀 Variation of <Link to={`/dua/${original.category}/${original.slug}`} style={{ color: 'var(--accent)' }}>{original.title}</Link> by <Link to={`/user/${original.author}`} style={{ color: 'var(--accent)' }}>@{original.author}</Link>
        </div>
      )}

      {meta.occasion ? (
        <p className="recipe-meta">{String(meta.occasion)}</p>
      ) : null}

      {/* Arabic — RTL, large */}
      {sections['arabic'] && (
        <div className="dua-arabic" dir="rtl" lang="ar">
          {sections['arabic']}
        </div>
      )}

      {/* Transliteration */}
      {sections['transliteration'] && (
        <div className="dua-section">
          <h3>Transliteration</h3>
          <p className="dua-translit">{sections['transliteration']}</p>
        </div>
      )}

      {/* Translation */}
      {sections['translation'] && (
        <div className="dua-section">
          <h3>Translation</h3>
          <p className="dua-translation">{sections['translation']}</p>
        </div>
      )}

      {/* Reference */}
      {sections['reference'] && (
        <div className="dua-section">
          <h3>Reference</h3>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{sections['reference']}</ReactMarkdown>
        </div>
      )}

      {/* Notes */}
      {sections['notes'] && (
        <div className="dua-section">
          <h3>Notes</h3>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{sections['notes']}</ReactMarkdown>
        </div>
      )}

      {variations.length > 0 && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(91, 122, 94, 0.05)', borderRadius: '4px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem', color: 'var(--herb)', marginBottom: '0.5rem' }}>
            🔀 {variations.length} variation{variations.length > 1 ? 's' : ''} of this dua
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {variations.map(v => (
              <li key={v.path} style={{ padding: '0.3rem 0' }}>
                <Link to={`/dua/${v.category}/${v.slug}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{v.title}</Link>
                <span style={{ color: 'var(--ink-light)', fontSize: '0.85rem' }}> by @{v.author}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)', fontSize: '0.85rem', color: 'var(--ink-light)' }}>
        <a href={`https://github.com/yusufk/duahub/blob/main/${currentPath}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
          View source on GitHub
        </a>
        {isAuthor && (
          <>
            {' · '}
            <Link to={`/edit/${category}/${slug}`} style={{ color: 'var(--accent)' }}>✏️ Edit this dua</Link>
          </>
        )}
        {' · '}
        <Link to={user ? `/submit?vary=${currentPath}` : '/login'} style={{ color: 'var(--herb)' }}>🔀 Make a variation (fork)</Link>
      </div>

      <Comments term={`duas/${category}/${slug}`} />
    </article>
  )
}
