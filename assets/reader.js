'use strict';
(()=>{
 const tabs=[...document.querySelectorAll('[data-tab]')],panels=[...document.querySelectorAll('.lesson-panel')];
 const allowed=tabs.map(t=>t.dataset.tab),motion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
 function select(name,focus=false,write=true){
  if(!allowed.includes(name))name='read';
  tabs.forEach(t=>{const active=t.dataset.tab===name;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1});
  panels.forEach(p=>p.hidden=p.id!=='panel-'+name);
  if(write){const u=new URL(location.href);u.hash=name==='read'?'':name;history.pushState({tab:name},'',u)}
  if(focus){document.querySelector('.lesson-tabs').scrollIntoView({block:'start',behavior:motion()});document.getElementById('panel-'+name).focus({preventScroll:true})}
 }
 select(location.hash.slice(1),false,false);
 document.addEventListener('click',e=>{const t=e.target.closest('[data-tab],[data-tab-open]');if(t)select(t.dataset.tab||t.dataset.tabOpen,!!t.dataset.tabOpen)});
 tabs.forEach((tab,i)=>tab.addEventListener('keydown',e=>{let j=i;if(e.key==='ArrowRight')j=(i+1)%tabs.length;else if(e.key==='ArrowLeft')j=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;else return;e.preventDefault();tabs[j].focus();select(tabs[j].dataset.tab)}));
 window.addEventListener('popstate',()=>select(location.hash.slice(1),false,false));
 window.addEventListener('hashchange',()=>select(location.hash.slice(1),false,false));
 const chooser=document.getElementById('translation-choice'),prefix='alhayat-topic001-v1';
 function language(value,persist=true){if(!['ur','en','both','none'].includes(value))value='ur';chooser.value=value;document.body.classList.remove('no-en','no-ur');document.getElementById('show-en').checked=['en','both'].includes(value);document.getElementById('show-ur').checked=['ur','both'].includes(value);if(value==='none'){document.body.classList.remove('no-ar');document.getElementById('show-ar').checked=true}document.querySelectorAll('[data-translation]').forEach(el=>el.hidden=value!=='both'&&value!==el.dataset.translation);if(persist){try{localStorage.setItem(prefix+'-translation',value);const p=JSON.parse(localStorage.getItem(prefix+'-prefs')||'{}');p.en=['en','both'].includes(value);p.ur=['ur','both'].includes(value);p.ar=true;localStorage.setItem(prefix+'-prefs',JSON.stringify(p))}catch{}}}
 let initial='ur';try{initial=localStorage.getItem(prefix+'-translation')||'ur';const p=JSON.parse(localStorage.getItem(prefix+'-prefs')||'{}');if(!localStorage.getItem(prefix+'-translation')&&('ur'in p||'en'in p))initial=p.en!==false?(p.ur!==false?'both':'en'):(p.ur!==false?'ur':'none')}catch{}
 language(initial,false);chooser.addEventListener('change',()=>{document.body.classList.remove('no-ar','no-en','no-ur');language(chooser.value)});
 document.addEventListener('change',e=>{if(e.target.dataset.language){const en=document.getElementById('show-en').checked,ur=document.getElementById('show-ur').checked;language(en?(ur?'both':'en'):(ur?'ur':'none'));}});
 const share=document.getElementById('native-share');if(share)share.onclick=async()=>{const d=window.HADITH_DATA.find(x=>x.id===document.querySelector('article[data-id]').dataset.id);const payload={title:d.title,text:d.title+' — '+d.ref,url:location.href.split('#')[0]};try{if(navigator.share)await navigator.share(payload);else{await navigator.clipboard.writeText(payload.text+'\n'+payload.url);document.getElementById('toast').textContent='Lesson link copied';document.getElementById('toast').hidden=false;setTimeout(()=>document.getElementById('toast').hidden=true,2500)}}catch(e){if(e.name!=='AbortError'){document.getElementById('toast').textContent='Use Copy to copy the text and its references.';document.getElementById('toast').hidden=false}}};
})();
