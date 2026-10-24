# Reading and learning layout review — Repository 1

## Reference patterns reviewed

Quran.com — its published Study Mode description shows a focused passage view, navigation between passages, contextual study material, bookmarks and continuation. Applied here as one hadith per reading page, with explanations and evidence on demand. Source: https://quran.com/en/product-updates/new-study-mode-on-quran-com

Khan Academy — its getting-started and mastery guidance describes entering courses, choosing units and lessons, then practising. Applied here as a compact course home, five visible sections, a lesson library and practice attached to the relevant hadith. Reading progress is not represented as certified mastery. Sources: https://www.khanacademy.org/resources/students/resources-for-students/a/getting-started-with-khan-academy and https://support.khanacademy.org/hc/en-us/articles/360007253831-Using-self-paced-practice-and-Mastery-in-the-classroom

Sunnah.com — the Bukhari contents page separates a collection into named books and numbered ranges. Applied here through explicit section labels, numbered hadith, direct references and an expandable eight-item section menu. Source: https://sunnah.com/bukhari

These are adaptations of navigation and reading patterns, not copied site code, logos, proprietary graphics or a claim of affiliation. The review used public page structure and official feature descriptions; no visual browser inspection is claimed.

## Findings and changes

Previously the homepage embedded all forty full reports, 104 answers and 135 MCQs. JavaScript displayed eight reports at a time, but all content remained in the document. The homepage HTML was 1,094,825 bytes, and every reading page loaded a shared 677,122-byte detailed dataset.

The new homepage is a compact five-section course dashboard. The separate library contains compact title cards and three-language search. Each reader contains one full report and its own detailed learning payload. Shared metadata retains every report ID, preserving cross-page bookmarks, notes and reading progress. A remembered unfinished report supports continuation. The library preserves its query, section, view and page in its URL for Back navigation.

Only the selected reader's learning payload is loaded. The full data file remains available for export and audit tests but is not referenced by the public pages. Previous and next links remain native links. Section contents, source material, explanations, notes and questions stay expandable. A reader toolbar restores memorization controls alongside language and text-size settings.

## Verification

Automated checks cover all 40 routes, one complete record per reader, the exact per-entry exercise bank, lightweight home/library payload budgets, three-language search data, URL initialization, resume navigation, pagination, filters, bookmarks, notes, read progress, all quiz choices and exact source preservation. All existing learning content and its IDs are retained. The new structure uses the established language colors and responsive stylesheet.

No browser or real-device visual QA was available. No claim is made that reviewing these sites establishes an objectively best layout or guarantees learning outcomes.
