import { useEffect, useRef } from 'react'

interface CommentsProps {
  term: string  // The dua path used to map to a Discussion
}

// NOTE: repo-id and category-id are placeholders — fill these in after
// enabling GitHub Discussions on yusufk/duahub and configuring Giscus
// at https://giscus.app. Until then, comments will not load.
const GISCUS_REPO = 'yusufk/duahub'
const GISCUS_REPO_ID = 'REPLACE_WITH_DUAHUB_REPO_ID'
const GISCUS_CATEGORY = 'General'
const GISCUS_CATEGORY_ID = 'REPLACE_WITH_DUAHUB_CATEGORY_ID'

export default function Comments({ term }: CommentsProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    if (GISCUS_REPO_ID.startsWith('REPLACE_')) return  // not configured yet

    ref.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', GISCUS_REPO)
    script.setAttribute('data-repo-id', GISCUS_REPO_ID)
    script.setAttribute('data-category', GISCUS_CATEGORY)
    script.setAttribute('data-category-id', GISCUS_CATEGORY_ID)
    script.setAttribute('data-mapping', 'specific')
    script.setAttribute('data-term', term)
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'light')
    script.setAttribute('data-lang', 'en')
    script.setAttribute('data-loading', 'lazy')
    script.crossOrigin = 'anonymous'
    script.async = true

    ref.current.appendChild(script)
  }, [term])

  if (GISCUS_REPO_ID.startsWith('REPLACE_')) return null

  return (
    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border)' }}>
      <h2 style={{ fontFamily: 'var(--font-handwritten)', fontSize: '2rem', color: 'var(--ink)', marginBottom: '1rem' }}>
        Comments &amp; Reflections
      </h2>
      <div ref={ref} />
    </div>
  )
}
