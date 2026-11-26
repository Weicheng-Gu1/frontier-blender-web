'use strict';
const $=s=>document.querySelector(s), esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=x=>typeof x==='number'&&Number.isFinite(x)?x.toFixed(4):'—',score=x=>typeof x==='number'?(x*100).toFixed(2):'—';
const siteBase = new URL(".", document.currentScript.src).pathname.replace(/\/$/, "");
let base='',documentImages=new Map();
function image(src,label){return src?'<button class="image" data-image="'+esc(src)+'"><img src="'+esc(src)+'" alt="'+esc(label)+'" loading="lazy"></button>':'<div class="empty">No visualization available</div>'}
function section(n,t){return '<div class="section-title"><span>'+n+'</span><h2>'+t+'</h2></div>'}
function panel(title,body){return '<section class="panel"><h3>'+title+'</h3>'+body+'</section>'}
function carousel(el,items,draw){
 if(!items.length){el.innerHTML='<div class="empty">No images available</div>';return}
 let i=Math.min(Number(el.dataset.selectedIndex)||0,items.length-1);
 function render(){el.dataset.selectedIndex=i;const v=items[i];el.innerHTML=draw(v,i)+'<div class="thumbs" role="group" aria-label="Select image">'+items.map((x,j)=>'<button class="'+(j===i?'active':'')+'" data-index="'+j+'" aria-pressed="'+(j===i)+'" aria-label="'+esc(x.name||x.id||j+1)+'">'+(x.image?'<img loading="lazy" src="'+esc(base+x.image)+'" alt="">':'')+esc(x.name||x.id||j+1)+'</button>').join('')+'</div>';
 el.querySelectorAll('[data-index]').forEach(b=>b.onclick=()=>{i=Number(b.dataset.index);render();el.querySelector('[data-index="'+i+'"]').scrollIntoView({block:'nearest',inline:'nearest'})});}
 render();
}
function inline(s){
 const pictures=[];
 s=s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(m,label,url)=>{const src=documentImages.get(url.split('/').pop());pictures.push(src?image(src,label):esc(label));return '\u0000'+(pictures.length-1)+'\u0000'});
 s=esc(s).replace(/\x60([^\x60]+)\x60/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
 s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(m,t,u)=>/^https?:/.test(u)?'<a href="'+u+'" target="_blank" rel="noopener">'+t+'</a>':t);
 return s.replace(/\u0000(\d+)\u0000/g,(m,i)=>pictures[Number(i)]);
}
function markdown(text){
 let code=false,table=false;
 return text.split('\n').map(line=>{
 if(line.startsWith('\x60\x60\x60')){code=!code;return code?'<pre>':'</pre>'}if(code)return esc(line)+'\n';
 if(/^\s*\|?[\s:|-]+\|\s*$/.test(line))return '';
 if(line.trim().startsWith('|')){const cells=line.trim().replace(/^\||\|$/g,'').split('|');const start=table?'':'<table>';table=true;return start+'<tr>'+cells.map(c=>'<td>'+inline(c.trim())+'</td>').join('')+'</tr>'}
 const end=table?'</table>':'';table=false;
 let m=line.match(/^(#{1,6})\s+(.+)/);if(m)return end+'<h'+m[1].length+'>'+inline(m[2])+'</h'+m[1].length+'>';
 if(/^[-*]\s/.test(line))return end+'<div>• '+inline(line.slice(2))+'</div>';
 return end+(line.trim()?'<p>'+inline(line)+'</p>':'');
 }).join('')+(table?'</table>':'');
}
function foldSection(title,text,open=false){return '<details class="doc-section"'+(open?' open':'')+'><summary>'+esc(title)+'</summary><div class="doc-section-body">'+markdown(text)+'</div></details>'}
function instructionOutline(text){
 const titles=['Task Overview','Modeling References','Core Acceptance Constraints','Submission Requirements','Time and Restrictions'];
 return text.trim().split(/\n\s*\n/).map((p,i)=>foldSection(titles[i]||'Additional Requirements',p,i===0)).join('');
}
function designOutline(text){
 const lines=text.split('\n'),parts=[];let title='Overview',body=[];
 for(const line of lines){const h=line.match(/^##\s+(.+)/);if(h){if(body.join('\n').trim())parts.push([title,body.join('\n')]);title=h[1];body=[]}else body.push(line)}
 if(body.join('\n').trim())parts.push([title,body.join('\n')]);
 return parts.map(([title,body])=>foldSection(title,body,title.trim().toLowerCase()==='overview')).join('');
}
function scoreColumn(rows){return '<aside class="test-scores"><div class="test-score-title">Scores / 100</div>'+rows.map(r=>'<div class="test-score"><div class="score-heading"><b>'+esc(r.metric)+'</b><strong>'+score(r.normalized)+'</strong></div><div class="score-track"><span style="width:'+(typeof r.normalized==='number'?Math.max(0,Math.min(100,r.normalized*100)):0)+'%"></span></div><div class="score-raw">Value: '+fmt(r.raw)+'</div></div>').join('')+'</aside>'}
function metricTable(rows){return '<div class="table-wrap"><table><thead><tr><th>Metric</th><th>Value</th><th>Score / 100</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+esc(r.metric)+'</td><td>'+fmt(r.raw)+'</td><td>'+score(r.normalized)+'</td></tr>').join('')+'</tbody></table></div>'}
function treeNode(n){return '<li><span class="node '+(n.selected?'selected':'')+'">'+esc(n.name)+'</span>'+(n.children?.length?'<ul>'+n.children.map(treeNode).join('')+'</ul>':'')+'</li>'}
function regionHierarchy(d){
 const root={name:d.title,children:[]};
 for(const t of d.targets){let parts=(t.semantic_path||t.human_label||t.unit_id).split('/').filter(Boolean).map(x=>({"\u73b0\u4ee3\u522b\u5885": "Modern Villa", "\u4e3b\u522b\u5885": "Main Villa", "\u573a\u5730": "Site", "\u9996\u5c42": "Ground Floor", "\u4e0a\u5c42": "Upper Floor", "\u8d70\u5eca\u4e0e\u623f\u95f4\u5f00\u53e3": "Corridors and Room Openings", "\u9910\u5385": "Dining Room", "\u9910\u6905": "Dining Chairs", "\u5165\u53e3": "Entrance", "\u72ec\u7acb\u5ead\u56ed\u4ead": "Garden Pavilion", "\u9996\u5c42\u536b\u6d74": "Ground-floor Bathroom", "\u56fa\u5b9a\u5bb6\u5177": "Built-in Furniture"})[x]||x);if(parts[0]===d.title)parts.shift();if(!parts.length)parts=[t.human_label||t.unit_id];let node=root;
 for(const name of parts){let child=node.children.find(c=>c.name===name);if(!child){child={name,children:[]};node.children.push(child)}node=child}node.selected=true;node.name=t.human_label||node.name;}
 return root;
}
function renderStructureTree(host,root){
 host.innerHTML='<div class="tree-stage"><ul>'+treeNode(root)+'</ul></div>';host.tabIndex=0;host.setAttribute('aria-label','Scene structure tree; scroll to explore');
 const tools=document.createElement('div');tools.className='tree-tools';
 tools.innerHTML='<button type="button" data-tree-fit>Fit to width</button><button type="button" data-tree-out aria-label="Zoom out">−</button><output aria-live="polite"></output><button type="button" data-tree-in aria-label="Zoom in">+</button><button type="button" data-tree-reset>100%</button>';
 host.before(tools);const stage=host.firstElementChild,graph=stage.firstElementChild;let scale=1,fitMode=true,previousWidth=0,naturalWidth=0,naturalHeight=0;
 function measure(){naturalWidth=graph.scrollWidth;naturalHeight=graph.offsetHeight;}
 function apply(value){scale=Math.max(.01,Math.min(2,value));graph.style.transform='scale('+scale+')';stage.style.width=(naturalWidth*scale)+'px';stage.style.height=(naturalHeight*scale)+'px';tools.querySelector('output').textContent=Math.round(scale*100)+'%';}
 function fit(){fitMode=true;measure();apply(Math.min(1,(host.clientWidth-40)/Math.max(1,naturalWidth)));host.scrollLeft=0;}
 tools.querySelector('[data-tree-fit]').onclick=fit;
 tools.querySelector('[data-tree-out]').onclick=()=>{fitMode=false;apply(scale/1.25)};
 tools.querySelector('[data-tree-in]').onclick=()=>{fitMode=false;apply(scale*1.25)};
 tools.querySelector('[data-tree-reset]').onclick=()=>{fitMode=false;measure();apply(1);host.scrollLeft=0};
 new ResizeObserver(()=>{if(host.clientWidth!==previousWidth){previousWidth=host.clientWidth;if(fitMode)fit()}}).observe(host);
 requestAnimationFrame(fit);
}

async function detail(slug){
 base=siteBase+'/task/'+encodeURIComponent(slug)+'/';const resp=await fetch(base+'case.json.gz');if(!resp.ok)throw Error('Task not found');
 const stream=resp.body.pipeThrough(new DecompressionStream('gzip'));
 const d=await new Response(stream).json();documentImages=new Map([...d.drawings,...d.public].flatMap(v=>[[v.image.split('/').pop().replace(/(\.(?:png|jpe?g))\.webp$/i,'$1'),base+v.image],[v.id+'.png',base+v.image]]));document.title=d.title+' · AgentRecBench';
 const res=d.result,metrics=res?.metrics,rows=metrics?.rows||[];
 const overall=res?'<div class="caption"><span>'+esc(res.displayName)+'</span><span>'+esc(res.trial)+'</span></div><div class="score">'+score(metrics.total)+' <small class="small">/ 100</small></div><div class="metric-grid">'+Object.entries(metrics.means||{}).map(([k,v])=>'<div><span class="small">'+esc(k)+'</span><b>'+score(v)+'</b></div>').join('')+'</div>':'<div class="empty">No result in this evaluation run</div>';
 const structure=!['objects','object-arrangements'].includes(d.domain);
 $('#app').innerHTML='<a class="muted" href="'+siteBase+'/task/">← All tasks</a><p class="eyebrow task-taxonomy">'+esc($('#app').dataset.taxonomyLines||$('#app').dataset.taxonomy)+'</p><h1>'+esc(d.title)+'</h1>'+section('01','Task Input')+
 '<section class="panel design-document"><details id="design-document"><summary>'+esc(d.guideName)+'</summary><div class="doc doc-outline">'+designOutline(d.guide)+'</div></details></section>'+
 '<div class="two"><section class="panel instruction-panel"><details id="instruction-document" open><summary>instruction.md</summary><div class="doc doc-outline instruction-content">'+instructionOutline(d.instruction)+'</div></details></section>'+panel('Design Drawings','<div id="drawings"></div>')+'</div>'+
 '<div class="two">'+panel('Public Camera Layout & Calibration',image(d.layouts.public?base+d.layouts.public:null,'Public camera layout')+'<div class="calibration-row"><select id="camera" aria-label="Public camera"></select><details><summary>Full recorded calibration</summary><pre id="calibration" class="calibration"></pre></details></div>')+panel('Public Reference Images','<div id="public"></div>')+'</div>'+
 section('02','Evaluation Results')+panel('Overall','<div id="overall-models"></div><div id="overall-results">'+overall+'</div>')+panel('Test Camera Views','<div id="camera-models"></div><div id="camera-views"></div>')+panel('Test Regions','<div id="region-models"></div><div id="regions"></div>')+
 panel('Camera & Region Layouts','<div class="two"><div><h3>Hidden Camera Layout</h3>'+image(d.layouts.hidden?base+d.layouts.hidden:null,'Hidden camera layout')+'</div><div><h3>Target Region Layout</h3><div id="target-layout"></div></div></div>')+(structure?panel('Scene Structure Tree','<div class="tree" id="structure"></div>'):'');
 carousel($('#drawings'),d.drawings,v=>image(base+v.image,v.id));carousel($('#public'),d.public,v=>image(base+v.image,v.id));
 const sel=$('#camera');sel.innerHTML=d.public.map(v=>'<option>'+esc(v.id)+'</option>').join('');const cal=()=>{$('#calibration').textContent=JSON.stringify(d.public.find(v=>v.id===sel.value),null,2)};sel.onchange=cal;cal();
 carousel($('#target-layout'),d.regionLayouts,v=>image(base+v.image,v.id));
 const models=Array.isArray(d.results)&&d.results.length?d.results:(d.result?[{...d.result,hidden:d.hidden,regionVisuals:d.regionVisuals}]:[]);
 function modelPicker(id,draw){
  const host=$(id);let current=0;
  const available=m=>id==='#camera-models'?(m.hidden||[]).some(v=>v.prediction):id==='#region-models'?Object.values(m.regionVisuals||{}).some(v=>v.prediction):true;
  const best=models.findIndex(available);if(best>=0)current=best;
  function select(i){current=i;host.innerHTML='<div class="model-picker" role="group" aria-label="Select model">'+models.map((m,j)=>'<button type="button" data-model="'+j+'" class="'+(j===current?'active':'')+'" aria-pressed="'+(j===current)+'">'+esc(m.displayName)+'</button>').join('')+'</div>';host.querySelectorAll('[data-model]').forEach(b=>b.onclick=()=>select(Number(b.dataset.model)));draw(models[current])}
  if(models.length)select(current);else{host.innerHTML='';draw(null)}
 }
 modelPicker('#overall-models',m=>{if(!m)return;$('#overall-results').innerHTML='<div class="score">'+score(m.metrics.total)+' <small class="small">/ 100</small></div><div class="metric-grid">'+Object.entries(m.metrics.means||{}).map(([k,v])=>'<div><span class="small">'+esc(k)+'</span><b>'+score(v)+'</b></div>').join('')+'</div>'});
 modelPicker('#camera-models',model=>{
  const rows=model?.metrics?.rows||[],views=model?.hidden||[];
  carousel($('#camera-views'),d.hidden,v=>{
   const candidate=views.find(x=>x.id===v.id),prediction=candidate?.prediction;
   return '<div class="test-comparison"><figure><figcaption>Ground truth</figcaption>'+image(base+v.image,v.id+' GT')+'</figure><figure><figcaption>'+esc(model?.displayName||'Model output')+'</figcaption>'+image(prediction?base+prediction:null,v.id+' prediction')+'</figure>'+scoreColumn(rows.filter(r=>r.id===v.id&&r.metric!=='SurfaceDistance'))+'</div>';
  });
 });
 modelPicker('#region-models',model=>{
  const rg=$('#regions'),rows=model?.metrics?.rows||[],visuals=model?.regionVisuals||{},gtVisuals=d.gtRegionVisuals||d.regionVisuals||{};
  const sourceRows=model?rows.filter(r=>r.metric==='SurfaceDistance'):[...d.targets.map(t=>({id:t.unit_id})),...(d.wholeScene?[{id:'whole_scene',name:'Whole Scene'}]:[])];
  if(!sourceRows.length){rg.innerHTML='<div class="empty">No regions available</div>';return}
  const groups={};
  for(const r of sourceRows){const target=d.targets.find(t=>t.unit_id===r.id),group=target?.evaluation_group||'objects';const gt=visuals[r.id]?.gt||gtVisuals[r.id]?.gt;
   (groups[group]??=[]).push({...r,target,name:target?.human_label||r.name||(r.id==='whole_scene'?'Whole Scene':'Region'),gt,prediction:visuals[r.id]?.prediction});
  }
  const order=['architecture','objects'].filter(k=>groups[k]),items=order.flatMap(k=>groups[k]);
  let current=Math.max(0,items.findIndex(r=>r.id===rg.dataset.selectedRegion));
  rg.innerHTML='<div class="region-viewer"></div><div class="region-navigation">'+order.map(k=>'<div class="region-navigation-row"><h4>'+(k==='architecture'?'Architectural Regions':'Object Regions')+'</h4><div class="thumbs" role="group" aria-label="'+(k==='architecture'?'Architectural Regions':'Object Regions')+'">'+groups[k].map(r=>'<button data-region-id="'+esc(r.id)+'" title="'+esc(r.name)+'" aria-label="'+esc(r.name)+'">'+(r.gt?'<img src="'+esc(base+r.gt)+'" loading="lazy" alt="">':'')+'<span>'+esc(r.name)+'</span></button>').join('')+'</div></div>').join('')+'</div>';
  function select(i){
   current=i;const r=items[i],scale=r.gt_scale_m;rg.dataset.selectedRegion=r.id;const titlePrefix=order.length===2?(r.target?.evaluation_group==='architecture'?'Architecture: ':'Object: '):'';
   rg.querySelector('.region-viewer').innerHTML='<div class="region-title">'+esc(titlePrefix+r.name)+'</div>'+(model?'<div class="test-comparison"><figure><figcaption>Ground truth</figcaption>'+image(r.gt?base+r.gt:null,r.name+' GT')+'</figure><figure><figcaption>'+esc(model.displayName)+'</figcaption>'+image(r.prediction?base+r.prediction:null,r.name+' prediction')+'</figure>'+scoreColumn([{metric:'Surface distance / L',raw:typeof r.raw==='number'&&scale?r.raw/scale:null,normalized:r.normalized}])+'</div>':'<div class="gt-only-comparison"><figure><figcaption>Ground truth</figcaption>'+image(r.gt?base+r.gt:null,r.name+' GT')+'</figure></div>');
   rg.querySelectorAll('[data-region-id]').forEach(b=>{const active=b.dataset.regionId===r.id;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
  }
  rg.querySelectorAll('[data-region-id]').forEach(b=>b.onclick=()=>select(items.findIndex(r=>r.id===b.dataset.regionId)));select(current);
 });
 if(structure)renderStructureTree($('#structure'),d.tree||regionHierarchy(d));
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-image]');if(b){$('#zoom img').src=b.dataset.image;$('#zoom').showModal()}});
$('#close').onclick=()=>$('#zoom').close();
const path=location.pathname.slice(siteBase.length).split('/').filter(Boolean);
detail(decodeURIComponent(path[1])).catch(e=>{$('#app').textContent=e.message;console.error(e)});
