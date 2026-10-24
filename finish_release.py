"""Final bibliography and metadata step; run after redesign.py."""
from pathlib import Path
import json,re,html as H
from lxml import html
R=Path(__file__).parent;rows=json.loads((R/'audit/reader-baseline.json').read_text());C=json.loads((R/'classical-content.json').read_text());E=lambda s:H.escape(str(s),quote=True)
def link(q):
 label,url=re.fullmatch(r'\[(.*)\]\((.*)\)',q['citation']).groups()
 return '<li><a lang="ar" dir="rtl" href="'+E(url)+'" target="_blank" rel="noopener">'+E(label)+'</a></li>'
doc=html.fromstring((R/'sources.html').read_text());main=doc.xpath('//main')[0]
for child in list(main):main.remove(child)
body='''<div class="breadcrumb"><a href="index.html">Home</a> / Sources</div><h1>Sources, editions &amp; editorial policy</h1><p lang="ur" dir="rtl" class="urdu">حدیث کا عربی متن متعلقہ مجموعۂ حدیث سے اور شرح کے عربی اقتباسات کلاسیکی کتبِ شروح سے نقل کیے گئے ہیں۔ ہر اقتباس کے ساتھ متعلقہ کتاب اور اس برقی نسخے کا جلد و صفحہ درج ہے۔</p><h2>How the text is presented</h2><p>Arabic narration is copied directly from the collection identified beside it, including the source chain where present. The commentary consists of literal, selected Arabic extracts. Each extract has its own book and digital-edition volume/page reference. A summary is explicitly labelled editorial; it is not a quotation from a scholar.</p><p>Shamela is the access platform, not the author or a separate hadith collection. Page references belong to the linked digital edition. Digital transcriptions can contain errors; these checks do not establish independent specialist authentication or comparison against printed facsimiles.</p><h2>Wording, numbering and grading</h2><p>The wording of one narration is not silently merged with another. A complete chain is not reconstructed from memory. For Tirmidhi, the linked edition numbers the two selected reports 2848 and 2855; earlier material used a different numbering scheme. The grading expressed in the quoted source remains part of that source: the report on prophetic authority is described by al-Tirmidhi as hasan gharib. This website does not relabel every report sahih or issue a new grading.</p><h2>Translations and teaching material</h2><p>The pre-existing English and Urdu translations of the meaning are retained from HadeethEnc.com, snapshot 17 October 2026. They usually omit the chain and may follow a shorter or parallel wording. They are not quotations from classical commentaries. The old publisher explanations are retained in the audit archive, not presented as the new classical explanation. Translation provenance remains linked in each lesson.</p><p>The 104 Q&amp;A and 135 MCQs are retained editorial teaching exercises. They are not the wording of hadith or a commentator, and are not claimed to have undergone a new independent scholarly authentication in this update. Earlier exercise evidence and its provenance are retained in the repository audit files. Study the quoted narration and commentary alongside the questions.</p><h2>Study data</h2><p>Notes, bookmarks, reading progress and quiz attempts stay in this browser. The existing export/import feature covers notes, bookmarks and reading progress; it does not provide automatic synchronization. Fonts currently load from Google Fonts. No Android package is included in this website release.</p><h2>Book references by lesson</h2><div class="classical-register">'''
for d in rows:
 c=C[d['id']];body+='<details><summary>'+f'{d["number"]:02d} · '+E(d['title'])+'</summary><h3>Hadith collection</h3><ul>'+''.join(link(q) for q in c['primary'])+'</ul><h3>Classical commentary</h3><ul>'+''.join(link(q) for q in c['commentary'])+'</ul><a href="hadith/'+d['slug']+'.html#understand">Open lesson →</a></details>'
body+='</div><footer class="site-footer">Al-Hayat Centre for Islamic Studies · Dr. Imran Hayat</footer>'
for node in html.fragments_fromstring(body):main.append(node)
(R/'sources.html').write_text('<!doctype html>'+html.tostring(doc,encoding='unicode',method='html'))
# Use the new book references on visible library tiles, keeping their stable lesson IDs.
p=R/'library.html';doc=html.fromstring(p.read_text())
for d in rows:
 tile=doc.get_element_by_id('hadith-'+d['id']);ref=tile.xpath('.//*[contains(@class,"tile-reference")]')[0]
 ref.text=re.search(r'\[(.*?)\]',C[d['id']]['primary'][0]['citation']).group(1)
 ref.set('lang','ar');ref.set('dir','rtl')
p.write_text('<!doctype html>'+html.tostring(doc,encoding='unicode',method='html'))
# Keep a genuinely useful no-JavaScript reading experience and a scroll-safe library.
print('Final bibliography and library references updated.')
