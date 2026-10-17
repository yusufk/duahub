# DuaHub — Plan & Setup Checklist

**Cloned from Recipo (2026-10-17).** Same git-as-database architecture, adapted for duas.

## Concept

Duas, version controlled. Markdown files in a GitHub repo, rendered by a React frontend.
Every dua referenced to Qur'an / authentic Sunnah, with a prominent authenticity badge.

## Data model

Frontmatter: `title, author, category, source_type, reference, grading, occasion, tags, based_on, created`
Body sections: `## Arabic` (RTL), `## Transliteration`, `## Translation`, `## Reference`, `## Notes`

## Authenticity (the core differentiator)

- `source_type`: quran | hadith | athar | general
- `grading` (hadith only): sahih | hasan | daif
- Monochrome badges: ✓ filled (Qur'an/sahih/hasan), ! dashed (da'if), ◦ outline (athar/general)
- Home page filter: "Qur'an & authentic Sunnah only" toggle
- PR template enforces source accuracy

## Styling — Kaaba / Haram palette

- Kiswah black (`--ink #121212`), gold calligraphy (`--accent #B8912E`), marble white/grey
- Header = black kiswah band with gold title + embroidered gold base line
- Arabic block = black background, gold border, ivory calligraphy (Amiri Quran font)

## Categories

morning-evening · salah · quranic · sunnah · daily-life · emotions · forgiveness · protection · occasions
(Modelled on Life with Allah / My Dua Companion app.)

## Seed duas (done)

- quranic: Rabbana atina (good in both worlds)
- daily-life: Dua upon leaving the home
- emotions: Dua for anxiety and grief
- forgiveness: Sayyid al-Istighfar

## Remaining setup — requires Yusuf's GitHub/Cloudflare account

- [ ] Create GitHub repo `yusufk/duahub` (public), push this code
- [ ] Create a new GitHub OAuth App:
      - Homepage: https://yusuf.kaka.co.za/duahub/
      - Callback: https://yusuf.kaka.co.za/duahub/login
      - Copy the Client ID → `wrangler.toml` GITHUB_CLIENT_ID + GH Actions var VITE_GITHUB_CLIENT_ID
      - Generate a Client Secret → set as Worker secret (never commit)
- [ ] Deploy Cloudflare Worker `duahub-auth`:
      - `cd worker && wrangler deploy`
      - `wrangler secret put GITHUB_CLIENT_SECRET`
      - Worker URL → GH Actions var VITE_AUTH_WORKER_URL
- [ ] Enable GitHub Discussions on the repo, configure Giscus at https://giscus.app
      - Fill GISCUS_REPO_ID + GISCUS_CATEGORY_ID in src/components/Comments.tsx
- [ ] GitHub Pages: enable, deploy via Actions (workflow already present)
      - Add repo variables VITE_GITHUB_CLIENT_ID + VITE_AUTH_WORKER_URL
- [ ] Site routing: add /duahub/ subpath on yusuf.kaka.co.za (same as /recipo/, /dha-slot-sniper/)

## Future ideas

- [ ] Audio recitation per dua (link or embed)
- [ ] Daily dua / "dua of the day"
- [ ] Dark mode (kiswah is already dark-friendly)
- [ ] PWA offline support
- [ ] Dedicated domain (duahub.app?)

---
*Created: 2026-10-17*
