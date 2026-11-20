import {execFileSync} from 'node:child_process';
import {cpSync,existsSync,writeFileSync} from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const target=path.join(root,'.pages-publish');
const remote='https://github.com/Weicheng-Gu1/frontier-blender-web.git';
const run=(cmd,args,cwd=root)=>execFileSync(cmd,args,{cwd,stdio:'inherit'});
const base=process.env.PAGES_BASE||'/frontier-blender-web';
run(process.execPath,['node_modules/astro/astro.js','check']);
run(process.execPath,['node_modules/astro/astro.js','build','--base',base,'--outDir','dist-pages']);
if(!existsSync(path.join(target,'.git'))) run('git',['clone','--branch','gh-pages','--single-branch',remote,target]);
run('git',['pull','--ff-only'],target);
// Only clear files tracked by this dedicated deployment checkout.
run('git',['rm','-r','--ignore-unmatch','.'],target);
cpSync(path.join(root,'dist-pages'),target,{recursive:true});
writeFileSync(path.join(target,'.nojekyll'),'');
run('git',['add','-A'],target);
try {execFileSync('git',['diff','--cached','--quiet'],{cwd:target});console.log('No deployment changes.');}
catch {run('git',['-c','user.name=FrontierBlender publisher','-c','user.email=publisher@users.noreply.github.com','commit','-m','Publish updated FrontierBlender website'],target);run('git',['push','origin','gh-pages'],target);}
