from pathlib import Path
from playwright.sync_api import sync_playwright
import json,sys
results=json.loads(Path('src/data/results.json').read_text(encoding='utf-8'))
model_count=len(results['models'])
city_count=results['models'][0]['domains']['cities']['tasks']
out=Path('qa/live' if len(sys.argv)>1 else 'qa');out.mkdir(exist_ok=True,parents=True)
errors=[];failures=[];report={}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--enable-unsafe-swiftshader','--use-angle=swiftshader'])
 page=b.new_page(viewport={'width':1440,'height':1100},device_scale_factor=1)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:failures.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
 base=sys.argv[1].rstrip('/') if len(sys.argv)>1 else 'http://127.0.0.1:4387'
 page.goto(base,wait_until='networkidle');page.screenshot(path=str(out/'blog-desktop.png'),full_page=True)
 assert 'Can AI Agents Faithfully Reconstruct the World in 3D?' in page.locator('h1').inner_text()
 assert page.locator('.hero-links a').first.get_attribute('href').endswith('/leaderboard/')
 assert page.locator('h1').evaluate('(h)=>h.offsetHeight < 1.5*parseFloat(getComputedStyle(h).lineHeight)')
 assert page.locator('.article-toc a').count()==6
 page.locator('#evaluation').evaluate("(h)=>h.scrollIntoView({behavior:'instant'})")
 page.wait_for_selector('.section-menu a[href="#evaluation"][aria-current="location"]')
 page.get_by_role('button',name='Technical drawings',exact=True).click()
 drawing=page.locator('[data-gallery="1"]')
 drawing.locator('.reel-strip').first.locator('button').nth(1).click()
 assert 'A-101' in drawing.locator('.villa-image').get_attribute('alt')
 drawing.locator('.villa-image').evaluate('(i)=>i.decode()')
 page.locator('[data-axis="tokens"]').click()
 page.locator('[data-choice="3"]').click()
 assert 'Opus' in page.locator('.cost-selected').inner_text()
 assert page.locator('[data-plot="tokens"]').is_visible()
 assert page.locator('.fidelity-column').count()==5
 assert page.locator('.results-table tbody tr').count()==model_count
 explorer=page.locator('.fidelity-explorer')
 for model in range(model_count):
  explorer.locator(f'[data-all-model="{model}"]').click()
  assert explorer.locator(f'.score-logo.is-selected[data-model="{model}"]').count()==5
  for i in range(5):
   img=explorer.locator(f'[data-category="{i}"] .case-prediction')
   img.scroll_into_view_if_needed()
   img.evaluate('(img)=>img.decode()')
   assert img.evaluate('(img)=>img.naturalWidth>0')
 qwen_index=next(i for i,m in enumerate(results['models']) if m['model']=='qwen4-max-preview')
 opus_index=next(i for i,m in enumerate(results['models']) if m['model']=='claude-opus-5-5')
 logo=explorer.locator(f'[data-category="0"] [data-model="{qwen_index}"]');logo.focus()
 assert 'Qwen4' in page.locator('#pair-model').inner_text()
 assert 'qwen4' in page.locator('#detail-prediction').get_attribute('src')
 explorer.locator(f'[data-category="2"] [data-model="{opus_index}"]').focus()
 assert 'gt--opus-paper' in page.locator('#detail-gt').get_attribute('src')
 assert '/task/modern-villa/' in page.locator('#pair-link').get_attribute('href')
 page.locator('[data-variant="1"]').click()
 assert page.locator('.diagnostic-db').inner_text()=='24.06 dB'
 page.locator('#diagnostic-view').select_option('1')
 assert page.locator('.diagnostic-db').inner_text()=='12.79 dB'
 page.locator('[data-variant="2"]').click()
 assert page.locator('.diagnostic-db').inner_text()=='20.62 dB'
 page.locator('[data-variant="3"]').click()
 assert page.locator('.diagnostic-db').inner_text()=='21.37 dB'
 video=page.locator('video')
 video_source=video.locator('source').evaluate('(source) => source.src')
 video_file=page.request.head(video_source)
 assert video_file.ok and video_file.headers['content-type'].startswith('video/mp4')
 if video.evaluate("(v) => v.canPlayType('video/mp4; codecs=avc1.64001e')"):
  video.evaluate('(v) => {v.preload="metadata";v.load()}')
  page.wait_for_function('document.querySelector("video").readyState>=1',timeout=60000)
  assert 76<video.evaluate('(v)=>v.duration')<78
 for link in page.locator('.article-toc a').all():
  assert page.locator(link.get_attribute('href')).count()==1
 page.locator('.fidelity-explorer').screenshot(path=str(out/'fidelity-desktop.png'))
 page.locator('.diagnostic-explorer').screenshot(path=str(out/'diagnostic-desktop.png'))
 page.locator('.research-hero').screenshot(path=str(out/'hero-desktop.png'))
 page.get_by_role('button',name='Switch to dark mode').click();assert page.locator('html').get_attribute('data-theme')=='dark'
 page.screenshot(path=str(out/'blog-dark.png'),full_page=True)
 page.reload(wait_until='networkidle');assert page.locator('html').get_attribute('data-theme')=='dark'
 page.get_by_role('button',name='Switch to light mode').click()
 page.get_by_role('navigation',name='Main navigation').get_by_role('link',name='Leaderboard').click();page.wait_for_load_state('networkidle')
 assert page.locator('.results-table tbody tr').count()==model_count
 page.screenshot(path=str(out/'leaderboard.png'),full_page=True)
 page.goto(base+'/task/',wait_until='networkidle')
 page.locator('.case-card').first.wait_for()
 assert page.locator('.case-card').count()==80
 page.locator('#search').fill('handheld-console')
 console=page.locator('.case-card[href$="/task/handheld-console/"]')
 console.wait_for()
 assert page.locator('.case-card:visible').count()==1
 console.click();page.wait_for_load_state('networkidle')
 assert page.get_by_role('heading',name='Overall',exact=True).is_visible()
 page.screenshot(path=str(out/'task-detail.png'),full_page=True)
 page.set_viewport_size({'width':390,'height':844});page.goto(base,wait_until='networkidle')
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'mobile overflow'
 page.screenshot(path=str(out/'blog-mobile.png'),full_page=True)
 page.locator('[data-all-model="3"]').click()
 assert page.locator('.score-logo.is-selected[data-model="3"]').count()==5
 page.locator('.research-hero').screenshot(path=str(out/'hero-mobile.png'))
 page.goto(base+'/leaderboard/',wait_until='networkidle')
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'leaderboard overflow'
 page.goto(base+'/task/',wait_until='networkidle');assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 page.locator('#category').select_option('cities');assert page.locator('.case-card:visible').count()==city_count
 page.locator('#search').fill('zzzz');assert page.locator('.case-card:visible').count()==0
 page.goto(base,wait_until='networkidle')
 assert page.locator('[data-output="views"] .villa-image').is_visible()
 assert 'modern-villa__Vd6qvVQ/camera/' in page.locator('[data-output="views"] .villa-image').get_attribute('src')
 page.locator('[data-mode="model"]').click()
 page.wait_for_function("document.querySelector('model-viewer').loaded === true",timeout=60000)
 assert page.locator('model-viewer').evaluate('(v)=>v.model.materials.length')>0
 assert not errors,errors
 assert not failures,failures
 report={'desktop':True,'mobile':True,'theme_persistence':True,'task_search':True,'category_filter':True,'model_rows':model_count,'prediction_images':5*model_count,'keyboard_model_selection':True,'diagnostic_scores':True,'video_asset':True,'toc_anchors':True,'scroll_highlight':True,'villa_3d':True,'drawings':True,'cost_chart':True,'console_errors':errors,'http_errors':failures}
 b.close()
(out/'browser-check.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
