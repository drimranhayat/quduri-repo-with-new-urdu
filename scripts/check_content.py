import json,pathlib,html,re,collections,sys
from html.parser import HTMLParser
root=pathlib.Path(__file__).resolve().parent.parent;out=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else root/'dist';data=json.loads((out/'content.json').read_text())
for d in data:
 a=json.loads((root/'source-data'/f'{d["id"]}-en.json').read_text());b=json.loads((root/'source-data'/f'{d["id"]}-ur.json').read_text())
 for k,key in [('ar','hadeeth_ar'),('en','hadeeth'),('explanation','explanation')]:assert d[k]==a[key]
 assert d['ur']==b['hadeeth'] and d['explanationUr']==b['explanation']
 for field in ['ar','en','ur']:
  assert html.escape(d[field],quote=True).replace('\r\n','\n').replace('\r','\n') in (out/'hadith'/f'{d["slug"]}.html').read_text()
class Links(HTMLParser):
 def handle_starttag(self,t,a):
  for k,v in a:
   if k in ['href','src'] and v and not v.startswith(('http','data:','#','mailto:')):
    path=v.split('#')[0].split('?')[0]
    if path:assert (self.base/path).resolve().exists(),(self.base,path)
for f in out.rglob('*.html'):
 if f.name=='404.html':continue
 q=Links();q.base=f.parent;q.feed(f.read_text())
def lum(s):
 a=[int(s[i:i+2],16)/255 for i in (0,2,4)];a=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in a];return sum(x*y for x,y in zip(a,[.2126,.7152,.0722]))
ratios=[]
for bg,colors in [('ffffff',['17654c','244c86','74418c','875818']),('edf3e9',['17654c','244c86','74418c','875818']),('192c22',['8cddba','a9caff','ddb7f3','efd08e']),('233b2c',['8cddba','a9caff','ddb7f3','efd08e'])]:
 for c in colors:
  l,h=sorted([lum(bg),lum(c)]);ratio=(h+.05)/(l+.05);assert ratio>=4.5;ratios.append(ratio)
print('PASS: all 40 Arabic/English/Urdu texts match source JSON; source explanations preserved; all local links resolve; reading colors >=',round(min(ratios),2),'contrast ratio in both themes.')
print('Data size',sum(p.stat().st_size for p in out.rglob('*') if p.is_file()),'bytes')
