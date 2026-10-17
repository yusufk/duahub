import { useState, useEffect } from 'react'

const REPO_OWNER = 'yusufk'
const REPO_NAME = 'duahub'
const DUAS_PATH = 'duas'

/** Authenticity classification — the heart of DuaHub. */
export type SourceType = 'quran' | 'hadith' | 'athar' | 'general'
export type Grading = 'sahih' | 'hasan' | 'daif' | ''

export interface DuaMeta {
  title: string
  author: string
  category: string
  source_type: SourceType
  reference: string      // e.g. "Al-Baqarah 2:201" or "Abu Dawud 5074"
  grading: Grading       // required when source_type === 'hadith'
  sunnah_ref?: string    // optional explicit sunnah.com ref, e.g. "abudawud:5095"
  occasion: string       // when to recite
  tags: string[]
  based_on?: string
  created: string
  slug: string
  path: string
  translation: string    // extracted translation snippet for search/preview
}

interface DuaFile {
  name: string
  path: string
  type: string
  download_url: string
}

/** True when the dua is confirmed from Qur'an or an authentic (sahih/hasan) hadith. */
export function isProphetic(meta: Pick<DuaMeta, 'source_type' | 'grading'>): boolean {
  if (meta.source_type === 'quran') return true
  if (meta.source_type === 'hadith') return meta.grading === 'sahih' || meta.grading === 'hasan'
  return false
}

/**
 * Build a quran.com URL from a reference string.
 * Accepts forms like "Al-Baqarah 2:201", "2:201", "2:201-202".
 * Returns null if no surah:ayah pattern can be found.
 */
export function quranComUrl(reference: string): string | null {
  if (!reference) return null
  const m = reference.match(/(\d{1,3})\s*:\s*(\d{1,3})/)
  if (!m) return null
  const surah = m[1]
  const ayah = m[2]
  return `https://quran.com/${surah}/${ayah}`
}

/**
 * Resolve the best external reference URL for a dua, based on its source type.
 * Qur'an → quran.com; hadith → sunnah.com (explicit sunnah_ref or parsed reference).
 * Returns null when no confident link can be built.
 */
export function referenceUrl(
  meta: Pick<DuaMeta, 'source_type' | 'reference' | 'sunnah_ref'>
): string | null {
  if (meta.source_type === 'quran') return quranComUrl(meta.reference)
  if (meta.source_type === 'hadith') return sunnahComUrl(meta.sunnah_ref, meta.reference)
  return null
}
const SUNNAH_COLLECTION_SLUGS: Record<string, string> = {
  'bukhari': 'bukhari',
  'sahih al-bukhari': 'bukhari',
  'muslim': 'muslim',
  'sahih muslim': 'muslim',
  'abu dawud': 'abudawud',
  'abudawud': 'abudawud',
  'abi dawud': 'abudawud',
  'tirmidhi': 'tirmidhi',
  'at-tirmidhi': 'tirmidhi',
  'jami at-tirmidhi': 'tirmidhi',
  'nasai': 'nasai',
  'an-nasai': 'nasai',
  "sunan an-nasa'i": 'nasai',
  'ibn majah': 'ibnmajah',
  'ibnmajah': 'ibnmajah',
  'sunan ibn majah': 'ibnmajah',
  'malik': 'malik',
  'muwatta malik': 'malik',
  'ahmad': 'ahmad',
  'musnad ahmad': 'ahmad',
  'nawawi': 'nawawi40',
  'riyad as-salihin': 'riyadussalihin',
  'riyad us-saliheen': 'riyadussalihin',
  'bulugh al-maram': 'bulugh',
  'hisn al-muslim': 'hisn',
}

/**
 * Build a sunnah.com URL for a hadith dua.
 * Prefers an explicit `sunnahRef` (e.g. "abudawud:5095"); otherwise attempts
 * to parse the free-text `reference` (e.g. "Abu Dawud 5095") into a slug:number.
 * Returns null if neither yields a confident collection + number.
 */
export function sunnahComUrl(sunnahRef: string | undefined, reference: string): string | null {
  // 1. Explicit structured ref wins: "slug:number"
  if (sunnahRef) {
    const m = sunnahRef.match(/^\s*([a-z0-9]+)\s*:\s*(\d+[a-z]?)\s*$/i)
    if (m) return `https://sunnah.com/${m[1].toLowerCase()}:${m[2]}`
  }
  // 2. Fallback: parse free-text reference like "Abu Dawud 5095"
  if (reference) {
    // Take only the first collection reference (before any comma)
    const first = reference.split(',')[0].trim()
    const nameMatch = first.match(/^(.*?)\s+(\d+[a-z]?)/)
    if (nameMatch) {
      const name = nameMatch[1].toLowerCase().replace(/\./g, '').trim()
      const num = nameMatch[2]
      const slug = SUNNAH_COLLECTION_SLUGS[name]
      if (slug) return `https://sunnah.com/${slug}:${num}`
    }
  }
  return null
}

/** Human-readable authenticity label for badges. */
export function authenticityLabel(meta: Pick<DuaMeta, 'source_type' | 'grading'>): string {
  switch (meta.source_type) {
    case 'quran':
      return 'Qur\u2019an'
    case 'hadith':
      if (meta.grading === 'sahih') return 'Authentic Hadith (Sahih)'
      if (meta.grading === 'hasan') return 'Sound Hadith (Hasan)'
      if (meta.grading === 'daif') return 'Weak Narration (Da\u2019if)'
      return 'Hadith'
    case 'athar':
      return 'Companion / Salaf (Athar)'
    case 'general':
      return 'General Supplication'
    default:
      return 'Unverified'
  }
}

function parseFrontmatter(content: string): { meta: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: content }

  const meta: Record<string, unknown> = {}
  const lines = match[1].split('\n')
  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value: unknown = line.slice(colonIdx + 1).trim()

    // Strip surrounding quotes
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }
    // Parse arrays like [tag1, tag2]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean)
    }
    meta[key] = value
  }
  return { meta, body: match[2] }
}

function extractSection(body: string, heading: string): string {
  const re = new RegExp(`##?\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n##?\\s|\\n*$)`, 'i')
  const m = body.match(re)
  return m ? m[1].trim() : ''
}

export function useDuas() {
  const [duas, setDuas] = useState<DuaMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDuaIndex()
  }, [])

  async function fetchDuaIndex() {
    try {
      setLoading(true)

      // 1. Prefer the static build-time index — zero GitHub API calls, served
      //    from our own Pages host. Robust against the 60/hr unauthenticated cap.
      try {
        const idxRes = await fetch(`${import.meta.env.BASE_URL}duas-index.json`, { cache: 'no-cache' })
        if (idxRes.ok) {
          const data = await idxRes.json()
          if (Array.isArray(data?.duas)) {
            setDuas(data.duas as DuaMeta[])
            setError(null)
            return
          }
        }
      } catch {
        // fall through to live API
      }

      // 2. Fallback: live GitHub contents API (used if the static index is
      //    missing, e.g. a freshly-submitted dua not yet in a build).
      const live = await fetchDuaIndexFromGitHub()
      setDuas(live)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return { duas, loading, error, refetch: fetchDuaIndex }
}

/** Live GitHub contents API path (fallback only — rate-limited to 60/hr unauthenticated). */
async function fetchDuaIndexFromGitHub(): Promise<DuaMeta[]> {
  const token = localStorage.getItem('duahub_gh_token')
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

  const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DUAS_PATH}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch duas')
  const categories: DuaFile[] = await res.json()

  const allDuas: DuaMeta[] = []

  const catPromises = categories.filter(c => c.type === 'dir').map(async (cat) => {
    const catRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${cat.path}`, { headers })
    if (!catRes.ok) return []
    const files: DuaFile[] = await catRes.json()

    const duaPromises = files
      .filter(f => f.name.endsWith('.md') && f.name !== '_template.md')
      .map(async (file) => {
        const fileRes = await fetch(file.download_url)
        const content = await fileRes.text()
        const { meta, body } = parseFrontmatter(content)
        const translation = extractSection(body, 'Translation')

        return {
          title: (meta.title as string) || file.name.replace('.md', ''),
          author: (meta.author as string) || 'unknown',
          category: cat.name,
          source_type: ((meta.source_type as string) || 'general') as SourceType,
          reference: (meta.reference as string) || '',
          grading: ((meta.grading as string) || '') as Grading,
          sunnah_ref: (meta.sunnah_ref as string) || undefined,
          occasion: (meta.occasion as string) || '',
          tags: (meta.tags as string[]) || [],
          based_on: (meta.based_on as string) || undefined,
          created: (meta.created as string) || '',
          slug: file.name.replace('.md', ''),
          path: file.path,
          translation,
        } as DuaMeta
      })

    return Promise.all(duaPromises)
  })

  const results = await Promise.all(catPromises)
  for (const batch of results) allDuas.push(...batch)
  return allDuas
}

export async function fetchDuaContent(path: string): Promise<{ meta: Record<string, unknown>; body: string }> {
  const res = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${path}`)
  if (!res.ok) throw new Error('Dua not found')
  const content = await res.text()
  return parseFrontmatter(content)
}

export interface DuaPayload {
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

function buildFrontmatter(userLogin: string, dua: DuaPayload, basedOn?: string): string {
  return `---
title: "${dua.title.replace(/"/g, "'")}"
author: ${userLogin}
category: ${dua.category}
source_type: ${dua.source_type}
reference: "${dua.reference.replace(/"/g, "'")}"
grading: ${dua.grading}
occasion: "${dua.occasion.replace(/"/g, "'")}"${dua.sunnah_ref ? `\nsunnah_ref: "${dua.sunnah_ref.replace(/"/g, "'")}"` : ''}
tags: [${dua.tags.split(',').map(t => t.trim()).filter(Boolean).join(', ')}]${basedOn ? `\nbased_on: ${basedOn}` : ''}
created: ${new Date().toISOString().split('T')[0]}
---`
}

function buildBody(dua: DuaPayload): string {
  return `
# ${dua.title}

## Arabic

${dua.arabic}

## Transliteration

${dua.transliteration}

## Translation

${dua.translation}

## Reference

${dua.reference_notes || dua.reference}
${dua.notes ? `\n## Notes\n\n${dua.notes}` : ''}
`
}

export async function submitDua(
  token: string,
  userLogin: string,
  dua: DuaPayload,
  basedOn?: string
) {
  const slug = dua.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const path = `duas/${dua.category}/${slug}.md`

  const content = buildFrontmatter(userLogin, dua, basedOn) + '\n' + buildBody(dua)
  const encoded = btoa(unescape(encodeURIComponent(content)))

  await ensureFork(token, userLogin)
  const baseSha = await getMainSha(token, userLogin)

  const branchName = `dua/${slug}`
  await createBranch(token, userLogin, branchName, baseSha)

  await putFile(token, userLogin, path, {
    message: `Add dua: ${dua.title}`,
    content: encoded,
    branch: branchName,
  })

  const prRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: basedOn ? `\u{1F501} Variation: ${dua.title}` : `\u{1F932} New dua: ${dua.title}`,
      body: `## ${basedOn ? 'Dua Variation' : 'New Dua Submission'}\n\n**${dua.title}**\n- Category: ${dua.category}\n- Source: ${dua.source_type}${dua.reference ? ` (${dua.reference})` : ''}${dua.grading ? `\n- Grading: ${dua.grading}` : ''}\n${basedOn ? `- Based on: \`${basedOn}\`\n` : ''}\nSubmitted by @${userLogin}`,
      head: `${userLogin}:${branchName}`,
      base: 'main',
    }),
  })

  return prRes.json()
}

export async function editDua(
  token: string,
  userLogin: string,
  filePath: string,
  dua: DuaPayload
) {
  const content = buildFrontmatter(userLogin, dua) + '\n' + buildBody(dua)
  const encoded = btoa(unescape(encodeURIComponent(content)))

  await ensureFork(token, userLogin)
  const baseSha = await getMainSha(token, userLogin)

  const slug = filePath.replace('duas/', '').replace('.md', '').replace('/', '-')
  const branchName = `edit/${slug}-${Date.now()}`
  await createBranch(token, userLogin, branchName, baseSha)

  const existingFile = await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}/contents/${filePath}?ref=${branchName}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const existingData = await existingFile.json()

  await putFile(token, userLogin, filePath, {
    message: `Edit dua: ${dua.title}`,
    content: encoded,
    branch: branchName,
    sha: existingData.sha,
  })

  const prRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `\u270F\uFE0F Edit: ${dua.title}`,
      body: `## Dua Edit\n\n**${dua.title}**\n\nEdited by @${userLogin}`,
      head: `${userLogin}:${branchName}`,
      base: 'main',
    }),
  })

  return prRes.json()
}

// --- GitHub API helpers ---

async function ensureFork(token: string, userLogin: string) {
  const forkRes = await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!forkRes.ok) {
    await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/forks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
    await new Promise(r => setTimeout(r, 3000))
  }
}

async function getMainSha(token: string, userLogin: string): Promise<string> {
  const mainRef = await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}/git/ref/heads/main`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const mainData = await mainRef.json()
  return mainData.object.sha
}

async function createBranch(token: string, userLogin: string, branchName: string, baseSha: string) {
  await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}/git/refs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha }),
  })
}

async function putFile(
  token: string,
  userLogin: string,
  path: string,
  body: { message: string; content: string; branch: string; sha?: string }
) {
  await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
