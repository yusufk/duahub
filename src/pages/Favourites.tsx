import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDuas, type DuaMeta } from '../hooks/useDuas'
import { getFavourites } from '../hooks/useFavourites'
import AuthenticityBadge from '../components/AuthenticityBadge'

export default function Favourites() {
  const { duas, loading } = useDuas()
  const navigate = useNavigate()
  const [favs] = useState(() => getFavourites())

  const favouriteDuas = useMemo(() => duas.filter(d => favs.includes(d.path)), [duas, favs])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}><span className="spinner" /></div>
  }

  return (
    <>
      <h1 style={{ fontFamily: 'var(--font-handwritten)', fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
        My Saved Duas
      </h1>
      <p style={{ textAlign: 'center', color: 'var(--ink-light)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Saved locally in your browser
      </p>

      {favouriteDuas.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.3rem', textAlign: 'center', padding: '2rem', color: 'var(--ink-light)' }}>
          No saved duas yet. Click ⭐ on any dua to save it here.
        </p>
      ) : (
        <div className="recipe-grid">
          {favouriteDuas.map(dua => (
            <FavCard key={dua.path} dua={dua} onClick={() => navigate(`/dua/${dua.category}/${dua.slug}`)} />
          ))}
        </div>
      )}
    </>
  )
}

function FavCard({ dua, onClick }: { dua: DuaMeta; onClick: () => void }) {
  return (
    <div className="recipe-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <h3>{dua.title}</h3>
      <div style={{ margin: '0.3rem 0' }}>
        <AuthenticityBadge source_type={dua.source_type} grading={dua.grading} size="sm" />
      </div>
      <div className="meta">
        <span style={{ color: 'var(--accent)' }}>by @{dua.author}</span>
        {dua.occasion && <span> · {dua.occasion}</span>}
      </div>
    </div>
  )
}
