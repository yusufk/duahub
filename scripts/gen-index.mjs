#!/usr/bin/env node
/**
 * Build-time index generator for DuaHub.
 *
 * Walks duas/<category>/*.md, parses frontmatter + the Translation section,
 * and writes public/duas-index.json. The app loads this single static file
 * instead of hitting the GitHub contents API on every visit (which is capped
 * at 60 requests/hour for unauthenticated users).
 *
 * Runs automatically before `vite build` (see package.json "build" script).
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DUAS_DIR = join(ROOT, 'duas')
const OUT = join(ROOT, 'public', 'duas-index.json')

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: content }
  const meta = {}
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':')
    if (i === -1) continue
    const key = line.slice(0, i).trim()
    let value = line.slice(i + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean)
    }
    meta[key] = value
  }
  return { meta, body: match[2] }
}

function extractSection(body, heading) {
  const re = new RegExp(`##?\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n##?\\s|\\n*$)`, 'i')
  const m = body.match(re)
  return m ? m[1].trim() : ''
}

async function main() {
  const duas = []
  let categories
  try {
    categories = await readdir(DUAS_DIR, { withFileTypes: true })
  } catch {
    console.warn(`[gen-index] no duas/ dir at ${DUAS_DIR}; writing empty index`)
    await mkdir(dirname(OUT), { recursive: true })
    await writeFile(OUT, JSON.stringify({ generated: new Date().toISOString(), duas: [] }, null, 2))
    return
  }

  for (const cat of categories) {
    if (!cat.isDirectory()) continue
    const catDir = join(DUAS_DIR, cat.name)
    const files = await readdir(catDir)
    for (const file of files) {
      if (!file.endsWith('.md') || file === '_template.md') continue
      const content = await readFile(join(catDir, file), 'utf8')
      const { meta, body } = parseFrontmatter(content)
      const slug = file.replace('.md', '')
      duas.push({
        title: meta.title || slug,
        author: meta.author || 'unknown',
        category: cat.name,
        source_type: meta.source_type || 'general',
        reference: meta.reference || '',
        grading: meta.grading || '',
        sunnah_ref: meta.sunnah_ref || undefined,
        occasion: meta.occasion || '',
        tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
        based_on: meta.based_on || undefined,
        created: meta.created || '',
        slug,
        path: `duas/${cat.name}/${file}`,
        translation: extractSection(body, 'Translation'),
      })
    }
  }

  await mkdir(dirname(OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify({ generated: new Date().toISOString(), duas }, null, 2))
  console.log(`[gen-index] wrote ${duas.length} duas to public/duas-index.json`)
}

main().catch(err => { console.error(err); process.exit(1) })
