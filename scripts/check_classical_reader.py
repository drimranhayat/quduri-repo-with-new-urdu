"""Check literal quotations, routes, source separation and preserved exercise identities."""
from pathlib import Path
from lxml import html
import json,re,hashlib
root=Path(__file__).resolve().parent.parent
pages=json.loads((root/'classical-pages.json').read_text());c=json.loads((root/'classical-content.json').read_text());rows=json.loads((root/'audit/reader-baseline.json').read_text());bank=json.loads((root/'learning-content.json').read_text())
assert len(c)==40
quotation_count=0
for d in rows:
 id=d['id'];rec=c[id];p=root/'hadith'/f'{d["slug"]}.html';doc=html.fromstring(p.read_text());ids=doc.xpath('//@id');assert len(ids)==len(set(ids)),p
 assert len(doc.xpath('//*[@role="tab"]'))==4
 assert len(doc.xpath('//*[@role="tabpanel"]'))==4
 assert len(doc.xpath('//h1'))==1
 assert doc.xpath('//*[@class="lesson-title-ar"]') and doc.xpath('//*[@class="lesson-title-ur"]')
 primary='\n\n'.join(q['text'] for q in rec['primary'])
 assert doc.xpath('//*[contains(@class,"primary-narration")]')[0].text_content()==primary
 rendered=doc.xpath('//section[contains(@class,"source-extract")]/blockquote')
 assert [x.text_content() for x in rendered]==[q['text'] for q in rec['commentary']]
 for q in rec['primary']+rec['commentary']:
  assert q['text'] in pages[q['key']]['text'],(id,q['key'])
  assert q['citation']==pages[q['key']]['citation']['markdown']
  assert hashlib.sha256(q['text'].encode()).hexdigest()==q['sha256']
  assert re.fullmatch(r'\[.*\]\(https://shamela.ws/book/\d+/\d+\)',q['citation'])
  quotation_count+=1
 assert 'sunnah.com' not in p.read_text()
 assert len(doc.xpath('//*[contains(concat(" ",@class," ")," qa-item ")]'))==len(bank[id]['qa'])
 assert len(doc.xpath('//*[contains(concat(" ",@class," ")," quiz-question ")]'))==len(bank[id]['mcq'])
 assert doc.xpath(f'//*[@data-note="{id}"]') and doc.xpath(f'//*[@data-read="{id}"]')
 for a in doc.xpath('//*[@href or @src]'):
  url=a.get('href') or a.get('src')
  if url.startswith(('http:','https:','data:','#','mailto:')):continue
  path=url.split('#')[0].split('?')[0]
  assert (p.parent/path).exists(),(p,url)
assert sum(len(b['qa']) for b in bank.values())==104
assert sum(len(b['mcq']) for b in bank.values())==135
home=html.fromstring((root/'index.html').read_text());library=html.fromstring((root/'library.html').read_text())
assert home.xpath('//*[contains(@class,"course-title-ar")]') and home.xpath('//*[contains(@class,"course-title-ur")]')
assert len(home.xpath('//a[contains(@class,"unit-card")]'))==5
assert len(library.xpath('//article[contains(@class,"library-tile")]'))==40
print(f'PASS: 40 readers; {quotation_count} literal source extracts and checksums; linked classical citations; four tabs; multilingual titles; 104 Q&A and 135 MCQs retained; local reader links resolve.')
