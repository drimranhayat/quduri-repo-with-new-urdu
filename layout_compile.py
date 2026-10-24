"""Compile a compact course home/library and independent reading payloads."""
import json,re,html
from card_titles import SECTIONS as SECTION_TITLES,TITLES as HADITH_TITLES
E=lambda s:html.escape(str(s),quote=True)
def js(x):return json.dumps(x,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
def apply_layout(rows,bank,out,head,header,footer,dock,dialogs,end,sections):
 meta=[{k:d[k] for k in ['id','number','title','section','sectionTitle','slug','ref','source','primary']} for d in rows]
 for m,(ar,ur) in zip(meta,HADITH_TITLES):m.update(titleAr=ar,titleUr=ur)
 assets=out/'assets';(assets/'entries').mkdir(exist_ok=True)
 (assets/'navigation.js').write_text('window.HADITH_DATA='+js(meta)+';window.SECTIONS='+js(sections)+';')
 search=[{k:d[k] for k in ['id','number','title','section','sectionTitle','slug','ref','source','primary','ar','en','ur']} for d in rows]
 for d,(ar,ur) in zip(search,HADITH_TITLES):d.update(titleAr=ar,titleUr=ur)
 (assets/'catalog.js').write_text('window.HADITH_DATA='+js(search)+';')
 for d in rows:
  (assets/'entries'/f'{d["id"]}.js').write_text('window.HADITH_DATA=window.HADITH_DATA.map(d=>d.id==='+js(d['id'])+'?'+js(d)+':d);window.LEARNING_DATA='+js({d['id']:bank[d['id']]})+';')
 byid={d['id']:d for d in rows}
 def multilingual(en,ar,ur):
  return '<span class="card-title-en" lang="en" dir="ltr">'+E(en)+'</span><span class="card-title-ar" lang="ar" dir="rtl">'+E(ar)+'</span><span class="card-title-ur" lang="ur" dir="rtl">'+E(ur)+'</span>' 
 def common(s,prefix='',entry=None,catalog=False):
  s=s.replace('assets/mobile.css?v=20261017">','assets/mobile.css?v=20261017"><link rel="stylesheet" href="'+prefix+'assets/layout.css?v=20261017">')
  s=s.replace('index.html#methodology','sources.html#methodology')
  s=s.replace('index.html#reader','library.html#reader').replace('index.html?view=saved','library.html?view=saved')
  def legacy(m):
   d=byid[m.group(2)];return 'href="'+m.group(1)+'library.html?section='+str(d['section'])+'#reader"'
  s=re.sub(r'href="((?:\.\./)?)index\.html#hadith-(\d+)"',legacy,s)
  def outline(m):return '<a href="'+prefix+'hadith/'+byid[m.group(1)]['slug']+'.html" data-outline-link="'+m.group(1)+'"'
  s=re.sub(r'<a href="[^"]*" data-outline-link="(\d+)"',outline,s)
  old=f'<script src="{prefix}assets/data.js" defer></script>'
  data=f'<script src="{prefix}assets/navigation.js" defer></script>'
  if catalog:data+=f'<script src="{prefix}assets/catalog.js" defer></script>'
  if entry:data+=f'<script src="{prefix}assets/entries/{entry}.js" defer></script>'
  s=s.replace(old,data)
  if not entry:s=s.replace(f'<script src="{prefix}assets/learning.js" defer></script>','')
  s=s.replace('</span>Read</a>','</span>Library</a>')
  return s
 original=(out/'index.html').read_text()
 def tile(d):
  b=bank[d['id']]
  return f'''<article class="hadith-card library-tile unit-{d['section']}" id="hadith-{d['id']}" data-id="{d['id']}"><div class="tile-top"><span class="number">{d['number']:02d}</span><span class="tile-status" data-card-status="{d['id']}">Not read</span><button class="tile-save js-only" data-save="{d['id']}" aria-pressed="false" aria-label="Save {E(d['title'])}">☆ Save</button></div><p class="tile-section">{E(d['sectionTitle'])}</p><h3><a href="hadith/{d['slug']}.html">{multilingual(d['title'],*HADITH_TITLES[d['number']-1])}</a></h3><p class="tile-reference">{E(d['ref'])}</p><p class="tile-counts">{len(b['qa'])} answers · {len(b['mcq'])} practice questions</p><a class="button tile-open" href="hadith/{d['slug']}.html">Read and study <span aria-hidden="true">→</span></a></article>'''
 library=re.sub(r'<article class="hadith-card"[^>]*>.*?</article>',lambda m:tile(byid[re.search(r'data-id="(\d+)"',m.group()).group(1)]),original,flags=re.S)
 library=library.replace('<title>40 Hadith on Revelation and Following the Sunnah | Al-Hayat</title>','<title>Study Library | Revelation and Following the Sunnah | Al-Hayat</title>')
 library=library.replace('<body>','<body data-library="true">',1)
 library=re.sub(r'<div class="breadcrumb">.*?</section>(?=<div class="stats">)','<div class="breadcrumb"><a href="index.html">HOME</a> / STUDY LIBRARY</div><div class="library-heading"><div><p class="section-label">CHOOSE YOUR NEXT LESSON</p><h1>The study library</h1><p>Browse five sections, or search the Arabic, English and Urdu text. Each card opens one focused reading page.</p></div><a class="button primary" href="hadith/'+rows[0]['slug']+'.html">Begin with hadith 01 →</a></div>',library,count=1,flags=re.S)
 library=library.replace('<button id="memorize" aria-pressed="false">Memorize</button>','')
 library=library.replace('All forty hadith are available below. Search, bookmarks and notes require JavaScript. Every entry also has a focused reading page.','All forty titles below open independent reading pages. Search and filters require JavaScript.')
 library=library.replace('aria-label="Hadith reader"','aria-label="Study library"')
 # The catalog grid only contains compact cards; there are no hidden full reports.
 start=library.index('<article class="hadith-card library-tile ');stop=library.index('<div class="empty"',start)
 library=library[:start]+'<p class="show-source" id="page-position" role="status"></p><div class="catalog-grid">'+library[start:stop]+'</div>'+library[stop:]
 (out/'library.html').write_text(common(library,catalog=True))
 units=''
 for i,sec in enumerate(sections,1):
  first=rows[(i-1)*8];last=rows[i*8-1]
  units+=f'''<a class="unit-card unit-{i}" href="library.html?section={i}#reader"><div class="unit-top"><span class="unit-number">0{i}</span><span class="unit-progress" data-section-progress="{i}">0 of 8 read</span></div><h3>{multilingual(sec['title'],*SECTION_TITLES[i-1])}</h3><p>{E(sec['subtitle'])}</p><div class="unit-bottom"><span>Hadith {first['number']:02d}–{last['number']:02d}</span><b>Explore section →</b></div></a>'''
 home=head('Revelation and Following the Sunnah | Al-Hayat Learning')+'<body data-home="true">'+header()+'''<main class="wrap"><section class="course-hero"><div><p class="course-kicker">AL-HAYAT · FORTY HADITH SERIES · 01</p><div class="course-title-group"><h1>Revelation &amp;<br><em>Following the Sunnah</em></h1><div class="course-title-translations"><p class="course-title-ar" lang="ar" dir="rtl">الْوَحْيُ وَاتِّبَاعُ السُّنَّةِ</p><p class="course-title-ur" lang="ur" dir="rtl">وحی اور اتباعِ سنت</p></div></div><p class="course-description">A thoughtful path through revelation, the Prophetic example and the responsibility of learning. One hadith. One focused lesson.</p><div class="hero-actions"><button class="button primary js-only" id="continue">Start reading →</button><a class="button" href="library.html#reader">Browse the library</a></div><p class="course-meta">40 hadith · 5 sections · Arabic, English &amp; Urdu</p></div><div class="course-progress"><span class="section-label">YOUR READING JOURNEY</span><strong id="progress-label">0 of 40 read</strong><div class="track" id="progress-track" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="40" aria-valuenow="0"><span id="progress-fill"></span></div><p>Read at your own pace. Save useful passages, write a reflection and return when you are ready.</p><a href="library.html?view=unread#reader">Find an unread hadith →</a></div></section><section class="course-sections" id="reader"><div class="section-heading"><div><p class="section-label">A CLEAR PATH THROUGH THE COLLECTION</p><h2>Five sections. Forty lessons.</h2></div><a href="library.html#reader">View all titles →</a></div><div class="unit-grid">'''+units+'''</div></section><section class="how-to-study"><h2>A small lesson, studied well.</h2><div class="study-path"><div><b>01 · Read</b><p>Choose your languages and read the source-linked text.</p></div><div><b>02 · Understand</b><p>Open the explanation, benefits or references when needed.</p></div><div><b>03 · Reflect</b><p>Explore focused answers and write your own notes.</p></div><div><b>04 · Practise</b><p>Try the questions, check the evidence and continue.</p></div></div><a class="button" href="coverage.html">Explore learning coverage →</a></section>'''+footer()+'</main>'+dock()+dialogs()+end()
 home=home.replace('<a href="index.html#methodology">Our sources</a>','<a href="sources.html">Our sources</a>')
 (out/'index.html').write_text(common(home))
 for d in rows:
  p=out/'hadith'/f'{d["slug"]}.html';s=p.read_text()
  part=[x for x in rows if x['section']==d['section']]
  links=''.join('<li><a '+('aria-current="page" ' if x['id']==d['id'] else '')+'href="'+x['slug']+'.html"><span>'+f'{x["number"]:02d}'+'</span>'+E(x['title'])+'</a></li>' for x in part)
  section=f'''<details class="section-contents"><summary>Section {d['section']} · {E(d['sectionTitle'])} <span>{(d['number']-1)%8+1} of 8</span></summary><ol>{links}</ol><a class="section-library" href="../library.html?section={d['section']}#reader">View this section in the library →</a></details>'''
  tools='<div class="reader-toolbar"><a class="button" href="../index.html">Home</a><button class="button js-only" id="memorize" aria-pressed="false">Memorize</button><button class="button js-only" data-dialog="settings">Languages &amp; text size</button></div>'
  s=s.replace('<nav class="pager top-pager"',section+tools+'<nav class="pager top-pager"',1)
  ar,ur=HADITH_TITLES[d['number']-1]
  s=s.replace('</h1>','</h1><div class="reader-translated-titles"><p class="card-title-ar" lang="ar" dir="rtl">'+E(ar)+'</p><p class="card-title-ur" lang="ur" dir="rtl">'+E(ur)+'</p></div>',1)
  s=s.replace('← Main menu','← Section menu')
  p.write_text(common(s,'../',d['id']))
 for name in ['sources.html']:
  p=out/name;s=p.read_text();p.write_text(common(s))
 # Avoid missing anchors on utility pages.
 for name in ['coverage.html']:
  p=out/name;s=p.read_text().replace('index.html#reader','library.html#reader');s=s.replace('assets/mobile.css?v=20261017">','assets/mobile.css?v=20261017"><link rel="stylesheet" href="assets/layout.css?v=20261017">');p.write_text(s)
