from pathlib import Path
import sys,json,collections
root=Path(sys.argv[1] if len(sys.argv)>1 else 'dist');base=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(base))
from learning_builder import norm,evidence,REVISION
from thematic_questions import THEMATIC
from focused_qa import FOCUSED_QA
rows=json.loads((root/'content.json').read_text());bank=json.loads((base/'learning-content.json').read_text())
counts=collections.Counter();keys=[];stems=[];qa_stems=[];sizes=[]
for i,d in enumerate(rows):
 s=bank[d['id']];assert s['revision']==REVISION
 assert 1<=len(s['mcq'])<=10 and len(s['mcq'])==len(THEMATIC[i])
 assert 1<=len(s['qa'])<=8 and len(s['qa'])==len(FOCUSED_QA[i])
 sizes.append(len(s['mcq']))
 for item,q in zip(THEMATIC[i],s['mcq']):
  assert q['evidence']==evidence(d,item)
  assert q['options'][q['correct']]==item['a']
  assert len(set(map(norm,q['options'])))==4
  assert q['hint'] and all(q['feedback'])
  counts[q['correct']]+=1;keys.append(q['id']);stems.append(norm(q['q']))
 for item,q in zip(FOCUSED_QA[i],s['qa']):
  assert q['evidence']==evidence(d,item)
  assert q['a']==item['a'] and q['q']==item['q']
  qa_stems.append(norm(q['q']))
 assert not any(q['group'] in ['Narrator, source and transmission','Further lessons from the publisher','Arabic vocabulary'] for q in s['qa'])
 assert not set(norm(q['q']) for q in s['qa']) & set(norm(q['q']) for q in s['mcq'])
 counts['qa']+=len(s['qa'])
 # Complete benefits and glossary remain in the source reading panels, without artificial question quotas.
 page=(root/'hadith'/(d['slug']+'.html')).read_text()
 import html
 for h in d['hints']:assert html.escape(h.strip(),quote=True).replace('\r\n','\n').replace('\r','\n') in page
assert len(keys)==len(set(keys))==sum(map(len,THEMATIC))
assert len(stems)==len(set(stems))
assert len(qa_stems)==len(set(qa_stems))==sum(map(len,FOCUSED_QA))
assert max(counts[x] for x in range(4))-min(counts[x] for x in range(4))<=1
assert len(set(sizes))>1
assert 'ibn Umar' in bank['3772']['narrator'] and 'Jarir' in bank['3506']['narrator']
print(f'PASS: {len(qa_stems)} explanatory Q&A; {len(keys)} MCQs; variable set sizes; {len(qa_stems)+len(keys)} exact source anchors; unique stems; published benefits preserved; balanced answers.')
