import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=process.argv[2]||'dist',c={window:{}};vm.runInNewContext(fs.readFileSync(root+'/assets/data.js','utf8'),c);const bank=c.window.LEARNING_DATA,code=fs.readFileSync(root+'/assets/learning.js','utf8');let checks=0;
for(const [id,set] of Object.entries(bank)){
 const buttons=[],nodes={},events={},storage={'alhayat-topic001-v2-thematic-quiz':JSON.stringify({[id]:{0:0}})},score={};
 const card={dataset:{},querySelectorAll:()=>[],querySelector:()=>null};
 for(let j=0;j<set.mcq.length;j++){
  const q=set.mcq[j];nodes[q.id+'-feedback']={};nodes[q.id+'-evidence']={open:false,hidden:true};
  for(let k=0;k<4;k++){const b={dataset:{quiz:id,q:String(j),option:String(k)},attrs:{},disabled:false,classes:new Set(),setAttribute(n,v){this.attrs[n]=v},closest:s=>s==='button'?b:card};b.classList={toggle:(n,on)=>on?b.classes.add(n):b.classes.delete(n)};buttons.push(b);}
 }
 const document={addEventListener:(e,f)=>events[e]=f,querySelectorAll:q=>q==='.hadith-card'?[card]:buttons.filter(b=>q.includes(`data-quiz="${b.dataset.quiz}"`)&&q.includes(`data-q="${b.dataset.q}"`)),getElementById:x=>x==='quiz-score-'+id?score:nodes[x]};
 const ctx={window:{LEARNING_DATA:{[id]:set}},document,localStorage:{getItem:k=>storage[k],setItem:(k,v)=>storage[k]=v}};
 vm.runInNewContext(code,ctx);assert.equal(score.textContent,`0 of ${set.mcq.length} attempted · 0 correct`);
 const reset={dataset:{quizReset:id},closest:()=>reset};
 for(let j=0;j<set.mcq.length;j++)for(let k=0;k<4;k++){
  const q=set.mcq[j],b=buttons.find(x=>x.dataset.q===String(j)&&x.dataset.option===String(k));events.click({target:b});assert.equal(score.textContent,`1 of ${set.mcq.length} attempted · ${k===q.correct?1:0} correct`);assert.ok(nodes[q.id+'-feedback'].textContent.includes(q.feedback[k]));assert.equal(nodes[q.id+'-evidence'].hidden,false);assert.equal(b.attrs['aria-pressed'],'true');assert.ok(buttons.filter(x=>x.dataset.q===String(j)).every(x=>x.disabled));
  const other=buttons.find(x=>x.dataset.q===String(j)&&x.dataset.option!==String(k));events.click({target:other});assert.equal(b.attrs['aria-pressed'],'true');events.click({target:reset});assert.equal(score.textContent,`0 of ${set.mcq.length} attempted · 0 correct`);assert.ok(nodes[q.id+'-feedback'].hidden&&nodes[q.id+'-evidence'].hidden);checks++;
 }
 const q=set.mcq[0],b=buttons.find(x=>x.dataset.q==='0'&&Number(x.dataset.option)===q.correct);events.click({target:b});vm.runInNewContext(code,ctx);assert.equal(score.textContent,`1 of ${set.mcq.length} attempted · 1 correct`);assert.ok(storage['alhayat-topic001-v4-coverage-quiz']);
 const route={dataset:{stageGo:'quiz'},closest:s=>s==='button'?route:card};events.click({target:route});assert.equal(card.dataset.learningStep,'3');const back={dataset:{stageMove:'-1'},closest:s=>s==='button'?back:card};events.click({target:back});assert.equal(card.dataset.learningStep,'2');
}
console.log(`PASS: ${checks} answer-choice paths across all 40 sets; correct/wrong scoring; per-option feedback; evidence reveal/reset; attempt locking; saved reload; legacy-score separation; learning routes.`);
