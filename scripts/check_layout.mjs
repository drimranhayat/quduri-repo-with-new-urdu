import {fileURLToPath} from 'node:url';import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'dist'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),rows=JSON.parse(read('content.json'));
const home=read('index.html'),library=read('library.html');
assert.equal((home.match(/class="unit-card /g)||[]).length,5);
for(const text of [home,library]){assert.ok(!text.includes('class="language-block'));assert.ok(!text.includes('class="qa-item"'));assert.ok(!text.includes('assets/data.js'));assert.ok(!text.includes('assets/learning.js'));}
assert.ok(Buffer.byteLength(home)<30000);assert.ok(Buffer.byteLength(library)<100000);
assert.equal((library.match(/class="hadith-card library-tile /g)||[]).length,40);
const original=JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)),'../learning-content.json'),'utf8'));
for(const d of rows){
 const page=read('hadith/'+d.slug+'.html');assert.equal((page.match(/class="hadith-card"/g)||[]).length,1);
 assert.ok(page.includes('assets/navigation.js'));assert.ok(page.includes('assets/entries/'+d.id+'.js'));assert.ok(!page.includes('assets/catalog.js'));assert.ok(!page.includes('assets/data.js'));
 const ctx={window:{}};vm.runInNewContext(read('assets/navigation.js'),ctx);vm.runInNewContext(read('assets/entries/'+d.id+'.js'),ctx);
 assert.equal(ctx.window.HADITH_DATA.length,40);assert.equal(new Set(ctx.window.HADITH_DATA.map(x=>x.id)).size,40);
 assert.equal(ctx.window.HADITH_DATA.filter(x=>x.ar).length,1);assert.equal(ctx.window.HADITH_DATA.find(x=>x.id===d.id).en,d.en);
 assert.deepEqual(Object.keys(ctx.window.LEARNING_DATA),[d.id]);assert.equal(JSON.stringify(ctx.window.LEARNING_DATA[d.id]),JSON.stringify(original[d.id]));
 assert.ok(page.includes('../library.html?section='+d.section+'#reader'));
 const sectionLinks=[...page.matchAll(/aria-current="page" href="([^"]+)"/g)].map(m=>m[1]);assert.ok(sectionLinks.includes(d.slug+'.html'));
}
const nav={window:{}};vm.runInNewContext(read('assets/navigation.js'),nav);assert.equal(nav.window.HADITH_DATA.length,40);assert.ok(nav.window.HADITH_DATA.every(d=>!d.en&&!d.ar));
vm.runInNewContext(read('assets/catalog.js'),nav);assert.ok(nav.window.HADITH_DATA.every(d=>d.ar&&d.en&&d.ur&&!d.explanation));assert.equal(nav.window.LEARNING_DATA,undefined);
console.log('PASS: compact five-section home; 40 linked library cards; one full hadith per reader; per-entry learning payloads; all 40 IDs retained for cross-page saved state; exact learning content preserved; section navigation and payload budgets.');
