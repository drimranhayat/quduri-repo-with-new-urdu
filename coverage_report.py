"""Render the per-hadith coverage map and downloadable editorial audit."""
import json,csv,html
from pathlib import Path
E=lambda x:html.escape(str(x),quote=True)
def write_coverage(rows,bank,out,base,head):
 records=[];total_qa=sum(len(v['qa']) for v in bank.values());total_mc=sum(len(v['mcq']) for v in bank.values())
 for d in rows:
  b=bank[d['id']];points=b['coverage']['topics']
  for p in points:
   assert p['point'] and p['qa'] and p['mcq']
   assert all(1<=n<=len(b['qa']) for n in p['qa']),(d['number'],p)
   assert all(1<=n<=len(b['mcq']) for n in p['mcq']),(d['number'],p)
  records.append({'number':d['number'],'id':d['id'],'title':d['title'],'qaCount':len(b['qa']),'mcqCount':len(b['mcq']),'primary':d['primary'],'source':d['source'],'page':'hadith/'+d['slug']+'.html','points':points})
 scope='Coverage of the forty selected published texts and their main explanatory distinctions. All source benefits and available vocabulary remain readable in their panels. Incidental descriptive details do not each require an isolated question. This is an editorial coverage audit, not independent scholarly certification or exhaustive coverage of every chain, variant or legal debate.'
 audit={'revision':'topic001-coverage-2026-10-17','qaCount':total_qa,'mcqCount':total_mc,'teachingPoints':sum(len(r['points']) for r in records),'scope':scope,'records':records}
 (base/'coverage-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
 md=['# Repository 1: final learning coverage audit','',f'40 hadith selections · {total_qa} explanatory Q&A · {total_mc} MCQs · {audit["teachingPoints"]} mapped teaching points','',scope,'','Every question has an exact publisher-source anchor and a visible supporting passage. A source anchor verifies the cited wording, not every interpretive claim by itself. Teaching-point mappings reflect editorial review. Source texts, report IDs, existing question IDs, notes, bookmarks and reading-progress keys are retained. Quiz attempts use a new revision key because the practice bank has changed.','', '## Counts by hadith','', '| No. | Hadith | Q&A | MCQs |','|---|---|---:|---:|']
 md += [f'| {r["number"]:02d} | {r["title"]} | {r["qaCount"]} | {r["mcqCount"]} |' for r in records]
 for r in records:
  md+=['',f'## {r["number"]:02d}. {r["title"]}', '',f'Publisher: {r["source"]} · Primary: {r["primary"]}', '', '| Teaching point | Q&A | MCQs |','|---|---|---|']
  md += ['| '+p['point']+' | '+', '.join(map(str,p['qa']))+' | '+', '.join(map(str,p['mcq']))+' |' for p in r['points']]
 (base/'COVERAGE_AUDIT.md').write_text('\n'.join(md)+'\n')
 with (base/'coverage-audit.csv').open('w',newline='',encoding='utf-8-sig') as f:
  w=csv.writer(f);w.writerow(['Hadith','Title','Q&A count','MCQ count','Teaching point','Q&A numbers','MCQ numbers','Publisher','Primary'])
  for r in records:
   for p in r['points']:w.writerow([r['number'],r['title'],r['qaCount'],r['mcqCount'],p['point'],', '.join(map(str,p['qa'])),', '.join(map(str,p['mcq'])),r['source'],r['primary']])
 body=head('Learning Coverage Audit | Al-Hayat Topic 001')+'<body><main class="wrap single-reader"><a class="button" href="index.html#reader">← Main collection</a><h1>Learning coverage</h1><p>'+f'Forty selections · {total_qa} Q&amp;A · {total_mc} MCQs'+'</p><p>'+E(scope)+'</p><p>Open a hadith below to see its teaching points and question numbers. The full hadith page contains its expandable answers, practice and source passages.</p>'
 for r in records:
  body+='<details class="source-evidence"><summary>'+f'{r["number"]:02d}. '+E(r['title'])+f' · {r["qaCount"]} Q&amp;A / {r["mcqCount"]} MCQs'+'</summary><div class="panel-content"><a class="button" href="'+r['page']+'">Open this hadith →</a><ul>'
  for p in r['points']:body+='<li>'+E(p['point'])+'<br><small class="show-source">Q&amp;A '+E(', '.join(map(str,p['qa'])))+' · MCQ '+E(', '.join(map(str,p['mcq'])))+'</small></li>'
  body+='</ul><p class="learning-credit"><a href="'+E(r['source'])+'" target="_blank" rel="noopener">Publisher record ↗</a> · <a href="'+E(r['primary'])+'" target="_blank" rel="noopener">Primary reference ↗</a></p></div></details>'
 body+='<p class="learning-credit">No independent scholarly sign-off is claimed. Automated content and interaction checks pass; browser and real-device visual testing remain unverified.</p><a class="button" href="index.html#reader">← Back to collection</a></main></body></html>'
 (out/'coverage.html').write_text(body)
 print(f'Coverage audit: {len(records)} selections, {audit["teachingPoints"]} teaching points, {total_qa} Q&A and {total_mc} MCQs.')
