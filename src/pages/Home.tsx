import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDuas, isProphetic, type DuaMeta } from '../hooks/useDuas'
import { isFavourite, toggleFavourite } from '../hooks/useFavourites'
import AuthenticityBadge from '../components/AuthenticityBadge'

export default function Home() {
  const { duas, loading, error } = useDuas()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [propheticOnly, setPropheticOnly] = useState(false)
  const [showCount, setShowCount] = useState(12)
  const navigate = useNavigate()

  const categories = useMemo(() => {
    const cats = new Set(duas.map(d => d.category))
    return Array.from(cats).sort()
  }, [duas])

  const filtered = useMemo(() => {
    let result = duas
    if (category) result = result.filter(d => d.category === category)
    if (propheticOnly) result = result.filter(d => isProphetic(d))
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.occasion.toLowerCase().includes(q) ||
        d.translation.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    result = [...result].sort((a, b) => (b.created || '').localeCompare(a.created || ''))
    return result
  }, [duas, search, category, propheticOnly])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="spinner" />
        <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem' }}>
          Fetching duas from the repo...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--accent)' }}>Couldn't load duas: {error}</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginTop: '0.5rem' }}>
          The repo might not exist yet, or GitHub API rate limit hit.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search duas, occasions, meanings..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search duas"
        />
      </div>

      <div className="nav" style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setPropheticOnly(p => !p)}
          className={propheticOnly ? 'active' : ''}
          title="Show only duas confirmed from the Qur'an or authentic Sunnah"
        >
          {propheticOnly ? '✓ Qur\u2019an & authentic Sunnah only' : 'Show all sources'}
        </button>
      </div>

      {categories.length > 0 && (
        <div className="nav" style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => setCategory(null)} className={!category ? 'active' : ''}>All</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={category === cat ? 'active' : ''}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem' }}>
            No duas yet! Be the first to contribute.
          </p>
        </div>
      ) : (
        <>
          <div className="recipe-grid">
            {filtered.slice(0, showCount).map(dua => (
              <DuaCard key={dua.path} dua={dua} onClick={() => navigate(`/dua/${dua.category}/${dua.slug}`)} />
            ))}
          </div>
          {filtered.length > showCount && (
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <button className="btn btn-outline" onClick={() => setShowCount(s => s + 12)}>
                Show more ({filtered.length - showCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}

function DuaCard({ dua, onClick }: { dua: DuaMeta; onClick: () => void }) {
  const [saved, setSaved] = useState(() => isFavourite(dua.path))

  return (
    <div className="recipe-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        <h3 style={{ flex: 1 }}>{dua.title}</h3>
        <button
          onClick={e => { e.stopPropagation(); setSaved(toggleFavourite(dua.path)) }}
          title={saved ? 'Remove from saved' : 'Save dua'}
          style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', opacity: saved ? 1 : 0.3, transition: 'opacity 0.2s', padding: 0, lineHeight: 1 }}
        >
          {saved ? '⭐' : '☆'}
        </button>
      </div>

      <div style={{ margin: '0.4rem 0' }}>
        <AuthenticityBadge source_type={dua.source_type} grading={dua.grading} size="sm" />
      </div>

      {dua.occasion && (
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)', margin: '0.3rem 0' }}>
          {dua.occasion}
        </p>
      )}

      <div className="meta">
        <Link to={`/user/${dua.author}`} className="author" onClick={e => e.stopPropagation()}>
          by @{dua.author}
        </Link>
        {dua.reference && <span> · {dua.reference}</span>}
      </div>

      {dua.tags.length > 0 && (
        <div className="tags">
          {dua.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      )}
    </div>
  )
}
