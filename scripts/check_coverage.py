"""Validate the coverage map, preserved content and preserved question identities."""
from pathlib import Path
import json,sys
base=Path(__file__).resolve().parent.parent;root=Path(sys.argv[1]) if len(sys.argv)>1 else base/'dist'
rows=json.loads((root/'content.json').read_text());oldrows=json.loads((base/'audit/previous-hadith-content.json').read_text())
assert rows==oldrows,'Source text or metadata changed during a learning-bank revision'
bank=json.loads((base/'learning-content.json').read_text());old=json.loads((base/'audit/previous-learning-content.json').read_text());audit=json.loads((base/'coverage-audit.json').read_text())
assert len(audit['records'])==40 and audit['qaCount']==104 and audit['mcqCount']==135
points=0
for d,r in zip(rows,audit['records']):
 b=bank[d['id']];o=old[d['id']];assert r['id']==d['id']
 assert r['qaCount']==len(b['qa']) and r['mcqCount']==len(b['mcq'])
 for x,y in zip(o['qa'],b['qa']):assert all(x[k]==y[k] for k in ['id','q','a','evidence'])
 for x,y in zip(o['mcq'],b['mcq']):
  assert x['id']==y['id'] and x['q']==y['q'] and x['evidence']==y['evidence']
  assert x['options'][x['correct']]==y['options'][y['correct']]
 for p in r['points']:
  assert p['point'] and all(1<=n<=len(b['qa']) for n in p['qa'])
  assert p['mcq'] and all(1<=n<=len(b['mcq']) for n in p['mcq'])
  points+=1
 page=(root/r['page']).read_text();assert 'What this study set covers' in page and 'assets/mobile.css?' in page
 for q in b['qa']:assert f'id="{q["id"]}"' in page
assert points==audit['teachingPoints']==135
assert 'alhayat-topic001-v4-coverage-quiz' in (root/'assets/learning.js').read_text()
assert 'alhayat-topic001-v3-focused-quiz' not in (root/'assets/learning.js').read_text()
assert (root/'coverage.html').exists()
print('PASS: 135 mapped teaching points, all question references valid, 40 records unchanged, previous question identities preserved, separate revised-quiz storage and mobile styles retained.')
