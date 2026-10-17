import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDuas, type DuaMeta } from '../hooks/useDuas'
import AuthenticityBadge from '../components/AuthenticityBadge'

export default function UserDuas() {
  const { username } = useParams()
  const { duas, loading } = useDuas()
  const navigate = useNavigate()

  const userDuas = duas.filter(d => d.author === username)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="spinner" />
        <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem' }}>Loading duas...</span>
      </div>
    )
  }

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--ink-light)', textDecoration: 'none' }}>
          ← back to all duas
        </Link>
        <h1 style={{ fontFamily: 'var(--font-handwritten)', fontSize: '2.5rem', marginTop: '0.5rem' }}>
          Duas by @{username}
        </h1>
        <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem' }}>
          {userDuas.length} dua{userDuas.length !== 1 ? 's' : ''}
          {' · '}
          <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
            GitHub profile ↗
          </a>
        </p>
      </div>

      {userDuas.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.3rem', textAlign: 'center', padding: '2rem' }}>
          No duas from this user yet.
        </p>
      ) : (
        <div className="recipe-grid">
          {userDuas.map(dua => (
            <DuaCard key={dua.path} dua={dua} onClick={() => navigate(`/dua/${dua.category}/${dua.slug}`)} />
          ))}
        </div>
      )}
    </>
  )
}

function DuaCard({ dua, onClick }: { dua: DuaMeta; onClick: () => void }) {
  return (
    <div className="recipe-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <h3>{dua.title}</h3>
      <div style={{ margin: '0.3rem 0' }}>
        <AuthenticityBadge source_type={dua.source_type} grading={dua.grading} size="sm" />
      </div>
      <div className="meta">
        {dua.occasion && <span>{dua.occasion}</span>}
      </div>
      {dua.tags.length > 0 && (
        <div className="tags">
          {dua.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      )}
    </div>
  )
}
