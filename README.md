# DuaHub 🤲

**Duas, version controlled.** A git-based collection of supplications for devs who remember Allah.

> `git commit -m 'added a dua for ease'`

## What is this?

DuaHub is a dua-sharing platform where **everything lives in Git**. No database, no CMS — just markdown files in a GitHub repo with a clean frontend that hides the complexity.

Every dua is **referenced to its source** — the Qur'an, authentic Sunnah, or clearly marked as a general supplication. Authenticity is a first-class feature, not an afterthought.

- **Browse** duas without signing in
- **Filter** by authenticity — show only duas from the Qur'an or authentic Sunnah
- **Submit** duas via a form — creates a pull request behind the scenes
- **Edit** your own duas — author-only editing
- **Vary** other people's duas — fork a different narration with attribution
- **Search** across all duas instantly

## Authenticity model

Every dua carries a `source_type`:

| Source | Meaning | Badge |
|--------|---------|-------|
| `quran` | Directly from the Qur'an | ✓ (filled) |
| `hadith` + `sahih`/`hasan` | Authentic/sound Prophetic hadith | ✓ (filled) |
| `hadith` + `daif` | Weak narration — recite with caution | ! (dashed) |
| `athar` | Companion / salaf, not directly Prophetic | ◦ (outline) |
| `general` | A permissible personal supplication | ◦ (outline) |

The "✓" filled badge means the dua is confirmed from the Qur'an or the authentic Sunnah of the Prophet ﷺ.

## How it works

Duas are markdown files with YAML frontmatter under `duas/<category>/`:

```yaml
---
title: "Dua Upon Leaving the Home"
author: yusufk
category: daily-life
source_type: hadith
reference: "Abu Dawud 5095"
grading: sahih
occasion: "when leaving the house"
tags: [home, protection]
created: 2026-10-17
---
```

Followed by sections: `## Arabic`, `## Transliteration`, `## Translation`, `## Reference`, `## Notes`.

## Categories

`morning-evening` · `salah` · `quranic` · `sunnah` · `daily-life` · `emotions` · `forgiveness` · `protection` · `occasions`

## Variations

Instead of editing someone else's dua, DuaHub uses a **variation** system:

- Only the **author** can edit their dua
- Everyone else can **"Make a variation"** — creates a new dua linked to the original (e.g. a different narration or wording)
- Variations show "Based on [Original] by @author"

Think of it like forking — but for supplications.

## Development

```bash
git clone https://github.com/yusufk/duahub.git
cd duahub
npm install
cp .env.example .env   # add your GitHub OAuth App client ID + worker URL
npm run dev
```

## Deploy

Push to `main` → GitHub Actions builds and deploys to GitHub Pages automatically.

## Tech

React + Vite + TypeScript · GitHub Pages · GitHub API · Cloudflare Worker (OAuth token exchange) · Amiri font for Arabic.
