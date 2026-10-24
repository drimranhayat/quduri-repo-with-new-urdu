"""Apply canonical metadata, structured data and a crawlable sitemap."""
import argparse,re,html,json
from pathlib import Path
from urllib.parse import urlsplit,quote
p=argparse.ArgumentParser();p.add_argument('--base-url',required=True);p.add_argument('--directory',default='dist');a=p.parse_args()
base=a.base_url.rstrip('/')+'/';url=urlsplit(base)
if url.scheme!='https' or not url.netloc or url.query or url.fragment:raise SystemExit('Use the real HTTPS deployment URL without a query or fragment.')
root=Path(a.directory);urls=[]
rows=json.loads((root/'content.json').read_text());by_slug={d['slug']:d for d in rows}
classical=json.loads((root/'classical-content.json').read_text()) if (root/'classical-content.json').exists() else {}
for f in sorted(root.rglob('*.html')):
 if 'audit' in f.relative_to(root).parts:continue
 s=f.read_text()
 if f.name=='404.html':
  s=s.replace('</head>','<meta name="robots" content="noindex,follow"></head>');f.write_text(s);continue
 rel=f.relative_to(root).as_posix();canonical=base if rel=='index.html' else base+quote(rel)
 s=re.sub(r'<link rel="canonical"[^>]*>|<meta property="og:[^"]*"[^>]*>|<meta name="(?:twitter:[^"]*|robots)"[^>]*>|<script type="application/ld\+json">.*?</script>','',s,flags=re.S)
 title=html.unescape(re.search(r'<title>(.*?)</title>',s,re.S)[1]);desc=html.unescape(re.search(r'<meta name="description" content="([^"]*)"',s)[1])
 d=by_slug.get(f.stem)
 if d:desc=f'{d["title"]}: {d["ref"]}, with Arabic, English and Urdu text, source explanation, focused questions and practice MCQs.'
 elif rel=='library.html':desc='Browse 40 source-linked hadith on revelation and following the Sunnah. Search Arabic, English and Urdu, explore five topics, and learn one hadith at a time.'
 elif rel=='sources.html':desc='Read the reference register, classical book references, translation attribution and editorial policy for all 40 hadith in the Al-Hayat collection.'
 elif rel=='coverage.html':desc='Explore the learning coverage of 40 hadith: 104 focused questions, 135 MCQs and 135 mapped teaching points.'
 s=re.sub(r'<meta name="description" content="[^"]*">','<meta name="description" content="'+html.escape(desc,quote=True)+'">',s)
 schema={'@context':'https://schema.org','@type':'LearningResource' if d else 'CollectionPage' if rel in ['index.html','library.html'] else 'WebPage','name':title,'description':desc,'url':canonical,'inLanguage':['en','ar','ur'],'isAccessibleForFree':True}
 if d:
  refs=classical.get(d['id'],{}).get('primary',[])+classical.get(d['id'],{}).get('commentary',[])
  source_urls=list(dict.fromkeys(re.search(r'\]\((.*?)\)',q['citation']).group(1) for q in refs)) if refs else [d['primary'],d['source']]
  schema.update({'learningResourceType':'Hadith study lesson','isBasedOn':source_urls,'citation':[q['citation'] for q in refs] if refs else d['ref']})
 crumbs=[{'@type':'ListItem','position':1,'name':'Home','item':base}]
 if rel!='index.html':crumbs.append({'@type':'ListItem','position':2,'name':'Hadith library' if d else title,'item':base+'library.html' if d else canonical})
 if d:crumbs.append({'@type':'ListItem','position':3,'name':d['title'],'item':canonical})
 graph=[schema,{'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':crumbs}]
 if rel=='index.html':graph.append({'@context':'https://schema.org','@type':'WebSite','name':'Al-Hayat Forty Hadith — Revelation and Following the Sunnah','url':base,'inLanguage':['en','ar','ur']})
 tags=f'<link rel="canonical" href="{html.escape(canonical,quote=True)}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:url" content="{html.escape(canonical,quote=True)}">'
 for k,v in [('title',title),('description',desc),('type','article' if d else 'website'),('site_name','Al-Hayat Forty Hadith')]:tags+=f'<meta property="og:{k}" content="{html.escape(v,quote=True)}">'
 tags+='<meta name="twitter:card" content="summary"><script type="application/ld+json">'+json.dumps(graph,ensure_ascii=False).replace('<','\\u003c')+'</script>'
 s=s.replace('</head>',tags+'</head>');f.write_text(s);urls.append(canonical)
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+html.escape(u)+'</loc></url>' for u in urls)+'</urlset>')
(root/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+base+'sitemap.xml\n')
print('Configured',len(urls),'canonical pages, structured data and sitemap for',base)
