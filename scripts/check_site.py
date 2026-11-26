from pathlib import Path
import json,re,sys
from urllib.parse import unquote,urlsplit
p=Path(sys.argv[1] if len(sys.argv)>1 else 'dist');tasks=json.loads(Path('public/tasks.json').read_text(encoding='utf-8'))
assert len(tasks)==80
for t in tasks:assert (p/'task'/t['slug']/'index.html').is_file(),t['slug']
assert (p/'leaderboard/index.html').is_file()
size=sum(x.stat().st_size for x in p.rglob('*') if x.is_file());assert size<900_000_000,size
result=json.loads(Path('src/data/results.json').read_text(encoding='utf-8'))
assert len(result['models'])==10 and all(m['tasks']==80 for m in result['models'])
assert result['score_normalization']=='psnr-sigmoid-c30-slope025-v2-20261117'
prefix='/frontier-blender-web/'
missing=[]
for f in p.rglob('*.html'):
 for target in re.findall(r'(?:src|href)="([^"]+)"',f.read_text(encoding='utf-8')):
  if target.startswith(('http:','https:','data:','#','mailto:')):continue
  path=unquote(urlsplit(target).path)
  if path.startswith(prefix):path=path[len(prefix):]
  else:path=path.lstrip('/')
  q=p/path
  if not (q.is_file() or (q/'index.html').is_file()):missing.append((str(f),target))
assert not missing,missing[:20]

# The atlas owns the task-to-category mapping for all published comparisons.
import gzip
from statistics import mean
from math import isclose
atlas=json.loads((p/'atlas/current-catalog.json').read_bytes())
membership={}
for group in atlas['groups']:
 for field in group['children']:
  for slug in field['tasks']:
   assert slug not in membership,slug
   membership[slug]=(group['id'],field['id'])
assert {t['slug']:t['category'] for t in tasks}=={t:v[0] for t,v in membership.items()}
assert {t['slug']:t['category'] for t in atlas['cases']}=={t:v[0] for t,v in membership.items()}
for slug,(domain,field) in membership.items():
 case=json.loads(gzip.decompress((p/'task'/slug/'case.json.gz').read_bytes()))
 assert (case['domain'],case['category'])==(domain,field),slug
for model in result['models']:
 per_task={r['slug']:r['total'] for r in result['selected'] if (r['model'],r['effort'])==(model['model'],model['effort'])}
 assert per_task.keys()==membership.keys()
 for group,summary in model['domains'].items():
  values=[score for slug,score in per_task.items() if membership[slug][0]==group]
  assert summary['tasks']==len(values) and isclose(summary['mean_total'],mean(values)),(model['model'],group)

print(json.dumps({'pages':len(list(p.rglob('*.html'))),'tasks':len(tasks),'bytes':size,'models':len(result['models']),'broken_local_links':len(missing)}))
