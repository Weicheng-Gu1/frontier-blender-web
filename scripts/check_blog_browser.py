from pathlib import Path
from playwright.sync_api import sync_playwright
import json,sys
out=Path('qa/live' if len(sys.argv)>1 else 'qa');out.mkdir(exist_ok=True,parents=True)
errors=[];failures=[];report={}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 page=b.new_page(viewport={'width':1440,'height':1100},device_scale_factor=1)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:failures.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
 base=sys.argv[1].rstrip('/') if len(sys.argv)>1 else 'http://127.0.0.1:4387'
 page.goto(base,wait_until='networkidle');page.screenshot(path=str(out/'blog-desktop.png'),full_page=True)
 assert 'Can a Coding Agent Reconstruct the World Faithfully' in page.locator('h1').inner_text()
 assert page.locator('.fidelity-column').count()==6
 assert page.locator('.results-table tbody tr').count()==7
 explorer=page.locator('.fidelity-explorer')
 for model in range(7):
  explorer.locator(f'[data-all-model="{model}"]').click()
  assert explorer.locator(f'.score-logo.is-selected[data-model="{model}"]').count()==6
  for i in range(6):
   img=explorer.locator(f'[data-category="{i}"] .case-prediction')
   img.scroll_into_view_if_needed()
   img.evaluate('(img)=>img.decode()')
   assert img.evaluate('(img)=>img.naturalWidth>0')
 logo=explorer.locator('[data-category="0"] [data-model="4"]');logo.focus()
 assert 'Qwen4' in page.locator('#pair-model').inner_text()
 assert 'qwen4' in page.locator('#detail-prediction').get_attribute('src')
 explorer.locator('[data-category="3"] [data-model="2"]').focus()
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
 page.locator('video').evaluate('(v)=>{v.load()}')
 page.wait_for_function('document.querySelector("video").readyState>=1',timeout=60000)
 assert 76<page.locator('video').evaluate('(v)=>v.duration')<78
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
 assert page.locator('.results-table tbody tr').count()==7
 page.screenshot(path=str(out/'leaderboard.png'),full_page=True)
 page.goto(base+'/task/',wait_until='networkidle');assert page.locator('.task-card:visible').count()==80
 page.locator('#task-search').fill('console');assert page.locator('.task-card:visible').count()==1
 page.locator('.task-card:visible').click();page.wait_for_load_state('networkidle')
 assert page.locator('#results tbody tr').count()==7
 page.screenshot(path=str(out/'task-detail.png'),full_page=True)
 page.set_viewport_size({'width':390,'height':844});page.goto(base,wait_until='networkidle')
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'mobile overflow'
 page.screenshot(path=str(out/'blog-mobile.png'),full_page=True)
 page.locator('[data-all-model="3"]').click()
 assert page.locator('.score-logo.is-selected[data-model="3"]').count()==6
 page.locator('.research-hero').screenshot(path=str(out/'hero-mobile.png'))
 page.goto(base+'/leaderboard/',wait_until='networkidle')
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'leaderboard overflow'
 page.goto(base+'/task/',wait_until='networkidle');assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 page.locator('#task-category').select_option('cities');assert page.locator('.task-card:visible').count()==4
 page.locator('#task-search').fill('zzzz');assert page.locator('#no-tasks').is_visible()
 assert not errors,errors
 assert not failures,failures
 report={'desktop':True,'mobile':True,'theme_persistence':True,'task_search':True,'category_filter':True,'seven_model_rows':True,'42_prediction_images':True,'keyboard_model_selection':True,'diagnostic_scores':True,'video_metadata':True,'toc_anchors':True,'console_errors':errors,'http_errors':failures}
 b.close()
(out/'browser-check.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
