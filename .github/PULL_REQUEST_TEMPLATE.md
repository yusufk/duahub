---
name: 🤲 New Dua
about: Submit a dua via PR
title: "🤲 New dua: [Dua Name]"
labels: dua
---

## Dua Checklist

- [ ] Dua file placed in correct category folder (`duas/sunnah/`, `duas/quranic/`, etc.)
- [ ] Filename is kebab-case (e.g. `dua-leaving-home.md`)
- [ ] Frontmatter includes all required fields (see template below)
- [ ] `author` field matches your GitHub username
- [ ] **Source is accurately cited** — Qur'an (Surah:Ayah) or Hadith (collection + number)
- [ ] **For hadith: grading provided** (sahih / hasan / da'if) with reference
- [ ] For hadith: `sunnah_ref` added where possible (e.g. `abudawud:5095`) to enable a Sunnah.com verification link
- [ ] Arabic text included and correct
- [ ] Transliteration and English translation included
- [ ] Weak (da'if) narrations are clearly marked as such

> **Authenticity matters.** DuaHub distinguishes between duas confirmed from the
> Qur'an / authentic Sunnah and general supplications. Please do not misattribute
> a dua to the Prophet ﷺ without a sound source. PRs with inaccurate sourcing
> will be requested to correct before merge.

## Frontmatter Template

```yaml
---
title: "Your Dua Title"
author: your-github-username
category: morning-evening | salah | quranic | sunnah | daily-life | emotions | forgiveness | protection | occasions
source_type: quran | hadith | athar | general
reference: "e.g. Al-Baqarah 2:201  OR  Abu Dawud 5074"
grading: sahih | hasan | daif    # required if source_type is hadith
sunnah_ref: "abudawud:5074"      # optional, for hadith — enables a Sunnah.com link
occasion: "when to recite"
tags: [tag1, tag2]
based_on: duas/category/original.md   # optional, for variations
created: YYYY-MM-DD
---
```
