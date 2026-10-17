import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDuas } from '../hooks/useDuas'

interface Contributor {
  username: string
  duaCount: number
  categories: string[]
}

export default function Contributors() {
  const { duas, loading } = useDuas()

  const contributors = useMemo(() => {
    const map = new Map<string, Contributor>()
    for (const dua of duas) {
      const existing = map.get(dua.author)
      if (existing) {
        existing.duaCount++
        if (!existing.categories.includes(dua.category)) existing.categories.push(dua.category)
      } else {
        map.set(dua.author, { username: dua.author, duaCount: 1, categories: [dua.category] })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.duaCount - a.duaCount)
  }, [duas])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="spinner" />
        <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem' }}>Loading contributors...</span>
      </div>
    )
  }

  return (
    <>
      <h1 style={{ fontFamily: 'var(--font-handwritten)', fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
        Contributors
      </h1>
      <p style={{ textAlign: 'center', color: 'var(--ink-light)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        {contributors.length} contributor{contributors.length !== 1 ? 's' : ''} · {duas.length} dua{duas.length !== 1 ? 's' : ''}
      </p>

      <div className="contributors-grid">
        {contributors.map(c => (
          <Link key={c.username} to={`/user/${c.username}`} className="contributor-card">
            <img src={`https://github.com/${c.username}.png?size=80`} alt={c.username} className="contributor-avatar" />
            <div className="contributor-info">
              <h3>@{c.username}</h3>
              <p>{c.duaCount} dua{c.duaCount !== 1 ? 's' : ''}</p>
              <div className="tags">
                {c.categories.map(cat => <span key={cat} className="tag">{cat}</span>)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
