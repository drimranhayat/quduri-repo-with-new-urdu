import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import path from 'node:path';
const root=path.resolve(process.argv[2]||'.');
function harness(hash=''){
 const events={},history=[],store={};
 class El{constructor(id='',data={}){this.id=id;this.dataset=data;this.attrs={};this.hidden=false;this.value='';this.checked=true;this.handlers={};this.tabIndex=0;this.classList={remove(){}}}setAttribute(k,v){this.attrs[k]=v}addEventListener(k,v){this.handlers[k]=v}focus(){this.focused=true}scrollIntoView(){this.scrolled=true}closest(){return this}}
 const tabs=['read','understand','practice','notes'].map(n=>new El('tab-'+n,{tab:n}));
 const panels=['read','understand','practice','notes'].map(n=>new El('panel-'+n));
 const choice=new El('translation-choice'),translations=['ur','en'].map(n=>new El('',{translation:n}));
 const nodes=Object.fromEntries([...tabs,...panels,choice,new El('show-ar'),new El('show-en'),new El('show-ur'),new El('toast')].map(e=>[e.id,e]));const bar=new El('tabs');
 const document={body:new El('body'),getElementById:id=>nodes[id]||null,querySelectorAll:s=>s==='[data-tab]'?tabs:s==='.lesson-panel'?panels:s==='[data-translation]'?translations:[],querySelector:s=>s==='.lesson-tabs'?bar:null,addEventListener:(k,v)=>events[k]=v};
 const ctx={document,window:{addEventListener:(k,v)=>events[k]=v},location:{hash,href:'https://example.org/hadith/lesson.html'+hash},history:{pushState:(state,_,u)=>history.push({state,url:String(u)})},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},matchMedia:()=>({matches:true}),URL,JSON,setTimeout:()=>0,navigator:{},console};
 vm.runInNewContext(fs.readFileSync(path.join(root,'assets/reader.js'),'utf8'),ctx);
 return {tabs,panels,choice,translations,nodes,events,history,store,ctx,El};
}
const h=harness();assert.equal(h.panels.filter(p=>!p.hidden).length,1);assert.equal(h.panels.find(p=>!p.hidden).id,'panel-read');assert.equal(h.choice.value,'ur');assert.equal(h.translations[0].hidden,false);assert.equal(h.translations[1].hidden,true);
h.events.click({target:h.tabs[1]});assert.equal(h.panels.find(p=>!p.hidden).id,'panel-understand');assert.equal(h.tabs[1].attrs['aria-selected'],'true');assert.equal(h.tabs[1].tabIndex,0);assert.match(h.history.at(-1).url,/#understand$/);
h.tabs[1].handlers.keydown({key:'End',preventDefault(){}});assert.equal(h.panels.find(p=>!p.hidden).id,'panel-notes');assert.ok(h.tabs[3].focused);
h.tabs[3].handlers.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(h.panels.find(p=>!p.hidden).id,'panel-read');
h.events.click({target:new h.El('',{tabOpen:'practice'})});assert.equal(h.panels.find(p=>!p.hidden).id,'panel-practice');assert.ok(h.panels[2].focused);
h.choice.value='both';h.choice.handlers.change();assert.ok(h.translations.every(p=>!p.hidden));assert.equal(h.nodes['show-en'].checked,true);assert.equal(h.nodes['show-ur'].checked,true);
h.choice.value='none';h.choice.handlers.change();assert.ok(h.translations.every(p=>p.hidden));assert.equal(h.nodes['show-ar'].checked,true);
assert.equal(harness('#notes').panels.find(p=>!p.hidden).id,'panel-notes');assert.equal(harness('#invalid').panels.find(p=>!p.hidden).id,'panel-read');
h.ctx.location.hash='#read';h.events.popstate();assert.equal(h.panels.find(p=>!p.hidden).id,'panel-read');
console.log('PASS: tab selection, keyboard navigation/wrap, direct hashes, browser-history handler, focus, and translation/settings synchronization. Simulated DOM; no visual-browser claim.');
