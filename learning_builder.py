"""Build source-linked Q&A and thematic MCQs from the reviewed editorial bank."""
import re,unicodedata,random
from learning_core import NARRATORS
from thematic_questions import THEMATIC
from focused_qa import FOCUSED_QA
from coverage_map import COVERAGE
REVISION='topic001-coverage-2026-10-17'
def norm(s):
 return ' '.join(''.join(c for c in unicodedata.normalize('NFKD',s.replace('’',"'").replace('‘',"'").replace('–','-')) if not unicodedata.combining(c)).casefold().split())
def evidence(d,item):
 kind=item['basis']
 if kind=='T':text=d['en'];label='Published English selection';url=d['source']
 elif kind=='E':text=d['explanation'];label='Published explanation';url=d['source']
 elif kind.startswith('B'):text=d['hints'][int(kind[1:])-1];label='Published benefit '+kind[1:];url=d['source']
 elif kind=='M':text=d['ref']+'. Publisher assessment: '+d['grade']+'.';label='Reference and publisher grade';url=d['primary']
 else:raise ValueError(kind)
 assert norm(item['anchor']) in norm(text),(d['number'],item['q'],item['anchor'])
 # Select an actual source sentence containing the audited anchor, retaining its wording.
 candidates=re.split(r'(?<=[.!?])\s+|[\r\n]+',text)
 passage=next((s for s in candidates if norm(item['anchor']) in norm(s)),text)
 return {'label':label,'text':passage.strip(),'url':url,'anchor':item['anchor'],'field':kind}
def build_learning(rows):
 out={};cursor=0
 total=sum(len(qs) for qs in THEMATIC)
 positions=[j%4 for j in range(total)]
 random.Random(REVISION).shuffle(positions)
 for i,d in enumerate(rows):
  narrator=NARRATORS[i];d['narrator']=narrator
  if d['id']=='3506':d['narrator_note']='Narrator correction: the Arabic text, Urdu translation and Sahih Muslim 1017a identify Jarir ibn Abdullah. The publisher English translation says Jabir. That published text is retained unchanged; use Jarir for study and citation.'
  qa=[];mc=[]
  for j,item in enumerate(FOCUSED_QA[i]):
   qa.append({'id':f'{d["id"]}-focus-qa-{j+1}','group':'Meaning and understanding','q':item['q'],'a':item['a'],'origin':'Editorial explanation based on the linked source','lang':'en','source':d['source'],'evidence':evidence(d,item)})
  for j,item in enumerate(THEMATIC[i]):
   proof=evidence(d,item)
   options=[item['a']]+item['wrong'];assert len(set(map(norm,options)))==4
   correct=positions[cursor];cursor+=1;options.insert(correct,options.pop(0))
   feedback=[item['why'] if choice==item['a'] else 'The supported answer is: '+item['a'].rstrip('.')+'. '+item['why'] for choice in options]
   mc.append({'id':f'{d["id"]}-focus-mc-{j+1}','q':item['q'],'options':options,'correct':correct,'feedback':feedback,'hint':item['hint'],'category':'Content practice','source':d['source'],'evidence':proof})
  out[d['id']]={'revision':REVISION,'narrator':narrator,'qa':qa,'mcq':mc,'coverage':{'focusedAnswers':len(qa),'thematicQuestions':len(mc),'completeSanadProvided':False,'topics':COVERAGE[i]},'source':d['source']}
 return out
