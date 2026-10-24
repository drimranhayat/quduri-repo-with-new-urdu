# Al-Hayat — Revelation and Following the Sunnah

A static teaching website with 40 hadith lessons, five sections, Arabic/Urdu/English reading, bookmarks, personal notes, reading progress and editorial exercises.

## This revision

- Four reader tabs: Read, Understand, Practice and Notes.
- Desktop section sidebar and phone Previous / Contents / Next navigation.
- English, Arabic and Urdu main headings.
- Redesigned homepage and library cards with distinct dark section headings.
- Arabic narrations copied from directly cited classical collections.
- Literal extracts from classical commentaries, plus explicitly editorial summaries.
- Per-lesson references and a complete book-reference register.
- Existing 104 Q&A, 135 MCQs and stable lesson IDs retained.

## What source checking establishes

`classical-pages.json` retains the retrieved digital page transcriptions and citations. `classical-content.json` identifies each displayed quotation, source key and SHA-256 checksum. The source validator checks that each displayed quotation is an unchanged substring of the retained source page. It does not constitute an independent hadith grading, specialist approval or printed-facsimile comparison. Edition numbering is retained rather than silently reconciled.

Translations of the meaning remain separately attributed to HadeethEnc.com. They may represent shorter or parallel wording and omit chains. The former website explanations are archived, not used as the new classical commentary. The exercise bank is retained editorial material; no new specialist sign-off is claimed. See `sources.html`.

## Deploy

Upload the contents of this folder to the repository root and serve with GitHub Pages or another static HTTPS host. No build is needed to use the supplied HTML.

## Rebuild

Install Python and `pip install -r requirements.txt`, then run:

```
python build.py
python redesign.py
python finish_release.py
python configure_seo.py --directory . --base-url https://YOUR-ACTUAL-SITE-URL/
```

The final command requires your real deployment URL. Keep the audit source snapshots when rebuilding. Do not rerun historical source-preservation tests as proof of the new text: they intentionally expect the old publisher explanation layout. The current release checks are:

```
python scripts/check_classical_reader.py
node scripts/check-site.mjs .
node scripts/check-learning.mjs .
node scripts/check-reader.mjs .
```

Bookmarks, notes, reading status and quiz attempts use their existing storage keys. The original backup format does not include quiz attempts. This release is a responsive website, not an Android APK/AAB, and does not yet provide offline caching. Real-device and visual-browser QA are still required before a public release: the execution environment could not launch a local browser for this revision.
