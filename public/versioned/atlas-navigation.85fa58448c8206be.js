const siteBase = new URL("../", document.currentScript.src).pathname.replace(/\/$/, "");
let GROUPS=[],MODEL_SCORES={models:[],tasks:{}};
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let cases=[],closed=new Set();
const fields=new Map();
function scoreChart(task){
 const scores=MODEL_SCORES.tasks[task]||{};
 return `<aside class="model-scores" aria-label="Model total scores out of 100"><div class="score-caption">MODEL SCORES <span>/ 100</span></div>${[...MODEL_SCORES.models].sort((a,b)=>scores[b]-scores[a] || a.localeCompare(b)).map((model)=>{
  const i=MODEL_SCORES.models.indexOf(model),score=scores[model],valid=typeof score==='number'&&Number.isFinite(score),display=valid?score.toFixed(2):'—';
  return `<div class="model-score-row model-${i}" data-model="${esc(model)}" data-score="${valid?score:''}" aria-label="${esc(model)}: ${valid?display+' out of 100':'not evaluated'}"><span class="model-name">${esc(model)}</span><span class="model-track" aria-hidden="true"><i style="width:${valid?Math.max(0,Math.min(100,score)):0}%"></i></span><b class="model-value">${display}</b></div>`;
 }).join('')}${MODEL_SCORES.models.every(m=>typeof scores[m]!=='number')?'<div class="score-unavailable">Not evaluated · 未评测</div>':''}</aside>`;
}
function card(c){
 const cover=c.cover?(c.cover.startsWith('assets/')?c.slug+'/'+c.cover:c.cover):'',f=fields.get(c.task);
 return `<a class="case-card" data-task="${esc(c.task)}" href="${siteBase}/task/${esc(c.slug)}/"><div class="cover">${cover?`<img src="${esc(cover.startsWith('/')?siteBase+cover:cover)}" alt="${esc(c.title)}" loading="lazy">`:''}${scoreChart(c.task)}</div><div class="category">${esc(f?.label||'')}</div><h2>${esc(c.title)}</h2><div class="counts"><span><b>${c.drawings}</b> drawings</span><span><b>${c.publicImages}</b> public</span><span><b>${c.hiddenViews}</b> hidden</span><span><b>${c.regions}</b> regions</span></div></a>`;
}
function render(){
 const q=$('#search').value.trim().toLowerCase(),cat=$('#category').value;
 const filtered=cases.filter(c=>{
  const g=GROUPS.find(g=>g.id===c.category),f=fields.get(c.task);
  return (!cat||c.category===cat)&&(!q||[c.title,c.task,g?.label,g?.zh,f?.label,f?.zh].join(' ').toLowerCase().includes(q));
 });
 $('#result').textContent=`${filtered.length} / ${cases.length} tasks`;
 const params=new URLSearchParams();if(cat)params.set('category',cat);if(q)params.set('q',$('#search').value.trim());history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);
 $('#collections').innerHTML=GROUPS.map(g=>{
  const rows=filtered.filter(c=>c.category===g.id);if(!rows.length)return '';
  const key=g.id;
  return `<details class="task-category" id="category-${esc(g.id)}" data-key="${esc(key)}" style="--category-color:${esc(g.color)}" ${q||!closed.has(key)?'open':''}><summary class="category-summary"><span class="fold-chevron" aria-hidden="true"></span><span class="category-heading"><strong class="category-lines">${esc(g.labelLines.join("\n"))}</strong><small>${esc(g.zh)}</small></span><span class="category-total">${rows.length}<small>tasks</small></span></summary><div class="category-content">${g.children.map(f=>{
   const tasks=rows.filter(c=>f.tasks.includes(c.task));if(!tasks.length)return '';
   const subkey=g.id+'/'+f.id;
   return `<details class="task-subgroup" data-key="${esc(subkey)}" ${q||!closed.has(subkey)?'open':''}><summary class="subgroup-summary"><span class="fold-chevron" aria-hidden="true"></span><span><strong>${esc(f.label)}</strong><small>${esc(f.zh)}</small></span><span class="subgroup-count">${tasks.length} tasks</span></summary><div class="cards">${tasks.map(card).join('')}</div></details>`;
  }).join('')}</div></details>`;
 }).join('')||'<p class="empty">No matching tasks. Try another search or reset the filters.</p>';
 document.querySelectorAll('#collections details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)closed.delete(d.dataset.key);else closed.add(d.dataset.key)}));
 document.querySelectorAll('.category-jumps a').forEach(a=>a.classList.toggle('selected',a.dataset.category===cat));
}
(async()=>{
 try{
  const response=await fetch(siteBase+'/atlas/current-catalog.json');if(!response.ok)throw Error('Catalog unavailable');const data=await response.json();cases=data.cases;GROUPS=data.groups;MODEL_SCORES=data.scores;for(const g of GROUPS)for(const f of g.children)for(const task of f.tasks)fields.set(task,{...f,category:g.id});
  document.querySelector("#model-total").textContent=MODEL_SCORES.models.length;
  if(cases.some(c=>!fields.has(c.task)))throw Error('Scene group assignments need updating');
  $('#total').textContent=cases.length;$('#updated').textContent=data.updated?'Updated '+data.updated:'Current published collection';
  $('#category').innerHTML='<option value="">All categories</option>'+GROUPS.map(g=>`<option value="${esc(g.id)}">${esc(g.label)} (${cases.filter(c=>c.category===g.id).length})</option>`).join('');
  $('#category-jumps').innerHTML=GROUPS.map(g=>`<a href="#category-${esc(g.id)}" data-category="${esc(g.id)}" style="--category-color:${esc(g.color)}"><span class="category-lines">${esc(g.labelLines.join("\n"))}</span><b>${cases.filter(c=>c.category===g.id).length}</b></a>`).join('');
  const p=new URLSearchParams(location.search);$('#category').value=p.get('category')||'';$('#search').value=p.get('q')||'';
  $('#search').oninput=render;$('#category').oninput=render;
  $('#reset-filters').onclick=()=>{$('#category').value='';$('#search').value='';closed.clear();render()};
  $('#expand-all').onclick=()=>{closed.clear();document.querySelectorAll('#collections details').forEach(d=>d.open=true)};
  $('#collapse-all').onclick=()=>document.querySelectorAll('.task-category').forEach(d=>d.open=false);
  $('#category-jumps').addEventListener('click',e=>{
   const a=e.target.closest('a');if(!a)return;e.preventDefault();
   if(($('#category').value&&$('#category').value!==a.dataset.category)||!$('#category-'+a.dataset.category)){$('#category').value='';$('#search').value='';render()}
   const d=$('#category-'+a.dataset.category);if(d){d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'',location.pathname+location.search+a.getAttribute('href'))}
  });render();
  if(location.hash){const target=document.getElementById(location.hash.slice(1));if(target){target.open=true;target.scrollIntoView({block:'start'})}}
 }catch(e){$('#collections').innerHTML='<p class="empty">Unable to load the task collection. Please refresh.</p>';console.error(e)}
})();
