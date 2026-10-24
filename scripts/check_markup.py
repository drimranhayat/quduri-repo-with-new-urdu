from html.parser import HTMLParser
from pathlib import Path
import sys
void={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class Audit(HTMLParser):
 def __init__(self):super().__init__();self.stack=[];self.errors=[];self.openextras=0;self.extras=0
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='details' and 'extra-panel' in a.get('class',''):self.extras+=1;self.openextras+='open' in a
  if t not in void:self.stack.append(t)
 def handle_endtag(self,t):
  if self.stack and self.stack[-1]==t:self.stack.pop()
  else:self.errors.append((t,self.stack[-3:]))
root=Path(sys.argv[1] if len(sys.argv)>1 else 'dist')
for f in root.rglob('*.html'):
 a=Audit();s=f.read_text();a.feed(s);assert not a.errors and not a.stack,(f.name,a.errors,a.stack)
 assert not a.openextras,f.name
 assert '{icon(' not in s
 if f.parent.name=='hadith':assert a.extras==8,(f.name,a.extras)
print('PASS: balanced HTML; all extras collapsed initially; eight colored panels per focused page; resolved SVG icons.')
