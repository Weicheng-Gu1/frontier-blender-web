from pathlib import Path
import json,re
from urllib.parse import unquote,urlsplit
p=Path('dist');tasks=json.loads(Path('public/tasks.json').read_text(encoding='utf-8'))
assert len(tasks)==80
for t in tasks:assert (p/'task'/t['slug']/'index.html').is_file(),t['slug']
assert (p/'leaderboard/index.html').is_file()
size=sum(x.stat().st_size for x in p.rglob('*') if x.is_file());assert size<900_000_000,size
result=json.loads(Path('src/data/results.json').read_text(encoding='utf-8'))
assert len(result['models'])==7 and all(m['tasks']==80 for m in result['models'])
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
print(json.dumps({'pages':len(list(p.rglob('*.html'))),'tasks':len(tasks),'bytes':size,'models':len(result['models']),'broken_local_links':len(missing)}))
