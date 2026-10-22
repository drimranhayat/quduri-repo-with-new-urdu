# مختصر القدوري — Mukhtasar al-Quduri Reader

A static, single-page learning site for the Hanafi matn *Mukhtasar al-Quduri*
(Volume 1: Tahara, Salat, Zakat, Sawm, Hajj). Companion to the Urdu sharh
*Al-Tauzih al-Zaruri Sharh al-Quduri* (Maktaba Habibul Ummat, 2026).
No framework and no runtime dependencies. Fonts come from Google Fonts.

## Features
- 5 Kitabs → 22 parts/themes, fully vowelled (tashkeel toggle in settings) → 46 babs → 431 masa'il, each Kitab with its own colour world
- Meaning colours: rulings (wajib / sunnah / jaiz / makruh / forbidden), numbers, imams (ح ي م ز), ayat and ahadith
- Read mode and Memorize mode (cloze, 3 levels, rulings and numbers hidden first)
- Spaced-repetition review cards (Leitner: 1, 3, 7, 16, 35 days), daily goal and streak
- Auto-generated quizzes: who said it, which number, which ruling
- Progress map, bookmarks, full-text Arabic search, dark mode, font size
- Progress is stored in the browser (`localStorage`) only

## Project layout
```
data/      matn text, one file per section (see format below)
src/       app.js, style.css, plan.json (parts + one-line bab summaries)
build.py   builds docs/index.html from data + src
docs/      generated site (served by GitHub Pages)
```

## Build and run
```bash
python3 build.py          # writes docs/index.html
python3 -m http.server -d docs 8000
```

## Deploy on GitHub Pages
`index.html` at the repo root and `docs/index.html` are the same generated page, so Pages works from the root, from `/docs`, or via the workflow.

Push to `main`. The included workflow builds and deploys `docs/`.
In the repo: **Settings → Pages → Source: GitHub Actions**.

## Data format (`data/*.txt`)
```
@kitab N | title        starts a Kitab
@bab | title            starts a bab (titles not starting with «باب» are editorial)
~ heading               editorial section heading inside a bab
# label                 label line (e.g. «فرائض الصلاة ستة:»)
> text                  quoted ayah block
any other line          one masalah
```
In `src/plan.json`, `parts` group bab indexes (0-based, contiguous, in matn order)
and `maps` holds one summary line per bab.

## Text notes
- Source: *Mukhtasar al-Quduri* on al-Maktaba al-Shamela (book 124336).
- Obvious typos were corrected. "…" marks a gap in that edition, to be checked against print.
- Parts, bab summaries and «عنوان تنظيمي» headings are learning aids, not part of the original text.
- Ruling/number colouring is automatic by keyword; verify against the masalah itself.

## Roadmap
- Urdu sharh under each masalah (needs OCR, proofreading and publisher permission)
- Remaining Kitabs (Buyu' to Fara'id)
- Verify the "…" gaps against a printed edition

## License
Code: MIT. The matn is a classical public-domain text; the Urdu sharh is not included and remains the publisher's.


## Tabs per Kitab
- **المتن العربي**: fully vowelled matn (toggle tashkeel in settings), parts, quizzes, spaced repetition.
- **اردو ترجمہ**: Urdu translation of the whole matn (`ur/*.txt`, line-aligned with `data_plain/*.txt`).
- **مفردات**: vocabulary / concept cards (`src/vocab.json`).

Translation and tashkeel were produced with AI assistance; please review against a printed edition.

## Learning route (5 tabs per Kitab)
1. **المتن** – vowelled Arabic text with colour-coded rulings and an inline Urdu button
2. **اردو** – full Urdu translation
3. **مفردات** – vocabulary cards
4. **سوال جواب** – short Q&A covering every masalah
5. **MCQs** – self-marking multiple-choice questions with saved score

Each tab ends with a "next step" button. Run `python3 tests/check.py` before `python3 build.py`.

> Tashkeel, Urdu translation, vocabulary, Q&A and MCQs were produced with AI assistance and need review by a qualified scholar before being relied on.

## Urdu font
Default: Noto Nastaliq Urdu (fast, from Google Fonts). Optional: **Jameel Noori Nastaleeq** — choose it in Settings (خط الأردية). It is a ~7 MB file (`docs/fonts/jameel-noori-subset.woff2`, subsetted from the npm package `jameel-noori`, ISC-licensed per the package) that loads only when selected, so the default site stays fast.

## SEO
`seo.py` runs during `python3 build.py` and generates, in `docs/`: `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, icons, and one static, crawlable page per Kitab (`docs/k1/` … `docs/k5/`) containing the Arabic text, plus title / description / canonical / Open Graph / JSON-LD tags on every page.
After deploying: add the site in **Google Search Console** and **Bing Webmaster Tools**, and submit `https://drimranhayat.github.io/quduri-repo/sitemap.xml`. If your URL differs, edit `SITE` at the top of `seo.py` and rebuild.

## Navigation
Each tab shows **one bab (chapter) at a time**; long babs are split into short parts (about 4–8 masa'il, split at section headings). A sticky bar shows "باب ٤ / ٢٠ · حصہ ٢ / ٤" with previous/next buttons and opens the chapter list when tapped; previous/next cards sit at the bottom of every page. Links such as `#k2-m50`, `#k2-b3`, `#k3-vqa` open the right page, tab and masalah, and your place is remembered.

## Accessibility / contrast
`python3 tests/contrast.py` (needs `pip install playwright` + Chromium) measures the real text/background contrast of every visible text element in light and dark mode, on mobile and desktop widths, across all tabs and overlays. The current build passes WCAG AA (4.5:1 normal text, 3:1 large text) with 0 failures. Kitab accent colours are auto-darkened in `build.py` (`_fix`) to keep that guarantee; in dark mode text on accent colours uses `--on-k`.

## Navigation
Each tab shows **one bab (chapter) at a time**; long babs are split into short parts (about 4–8 masa'il, split at section headings). A sticky bar shows "باب ٤ / ٢٠ · حصہ ٢ / ٤" with previous/next buttons and opens the chapter list when tapped; previous/next cards sit at the bottom of every page. Links such as `#k2-m50`, `#k2-b3`, `#k3-vqa` open the right page, tab and masalah, and your place is remembered.

## Accessibility / contrast
`python3 tests/contrast.py` (needs `pip install playwright` and Chromium) measures the real text/background contrast of every visible text element in light and dark mode, on mobile and desktop widths, across all tabs and overlays. The current build passes WCAG AA (4.5:1 normal text, 3:1 large text) with 0 failures. Kitab accent colours are auto-darkened in `build.py` (`_fix`) to keep that guarantee; in dark mode, text on accent colours uses `--on-k`.
