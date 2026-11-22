// Android (Capacitor) build invariants. Builds go to temporary folders: dist-android/, dist-android-essai/ and
// dist-web/ are left alone. No network, no Supabase.
import assert from 'node:assert/strict';
import {build} from 'vite';
import {mkdtempSync,readdirSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const slash=id=>id.replace(/\\/g,'/');
const has=(modules,path)=>modules.some(id=>id.endsWith(path));
async function viteBuild(configFile,mode,extra={}){
 const outDir=mkdtempSync(join(tmpdir(),'nous-deux-build-')),modules=[];
 try{
  await build({configFile,mode,logLevel:'silent',...extra,build:{outDir},
   plugins:[{name:'test-module-list',generateBundle(){modules.push(...[...this.getModuleIds()].map(slash));}},...(extra.plugins||[])]});
  const assets=readdirSync(join(outDir,'assets')),read=ext=>assets.filter(f=>f.endsWith(ext)).map(f=>readFileSync(join(outDir,'assets',f),'utf8')).join('\n');
  return {files:readdirSync(outDir),html:readFileSync(join(outDir,'index.html'),'utf8'),js:read('.js'),css:read('.css'),modules};
 }finally{rmSync(outDir,{recursive:true,force:true});}
}

// The real app: Android client, android entry and styles, no web-only files or paths.
const app=await viteBuild('vite.android.config.ts','production');
for(const f of ['sw.js','manifest.webmanifest','ESSAI-NE-PAS-PUBLIER.txt'])assert.ok(!app.files.includes(f),f+' must not be in the app');
assert.ok(has(app.modules,'web/android.ts'),'web/android.ts is injected');
assert.ok(has(app.modules,'lib/android-api-client.ts'),'Android client used');
assert.ok(!has(app.modules,'lib/essai-api-client.ts'),'no trial client in the real app');
assert.ok(app.css.includes('.native-app'),'app/android.css bundled');
assert.ok(!app.html.includes('/Nous-deux/')&&!app.js.includes('/Nous-deux/'),'no GitHub Pages path in the app');
assert.ok(!/rel="manifest"/.test(app.html),'no manifest link');
assert.match(app.html,/<title>Nous deux · Notre maison<\/title>/);
assert.ok(!app.html.includes('Mode essai'));

// The trial: its own client and title, the marker that blocks a release build, never the web client.
const essai=await viteBuild('vite.android.config.ts','essai');
assert.ok(essai.files.includes('ESSAI-NE-PAS-PUBLIER.txt'),'trial marker written');
for(const f of ['sw.js','manifest.webmanifest'])assert.ok(!essai.files.includes(f));
assert.ok(has(essai.modules,'lib/essai-api-client.ts')&&has(essai.modules,'web/android.ts'));
assert.ok(!has(essai.modules,'lib/api-client.ts')&&!has(essai.modules,'lib/android-api-client.ts'),'no real client in the trial');
assert.match(essai.html,/<title>Nous deux · Mode essai<\/title>/);

// The web client cannot slip into the app through an alias: the build fails.
const webClient=resolve('lib/api-client.ts');
await assert.rejects(viteBuild('vite.android.config.ts','production',{
 resolve:{alias:[{find:/^@client-du-site$/,replacement:webClient}]},
 plugins:[{name:'test-sneak-web-client',enforce:'pre',transform(code,id){if(slash(id).endsWith('web/main.tsx'))return "import '@client-du-site';\n"+code;}}]}),
 /client du site/);

// The GitHub Pages build keeps none of the Android files.
const web=await viteBuild('vite.web.config.ts','production');
assert.ok(!has(web.modules,'web/android.ts')&&!has(web.modules,'lib/android-api-client.ts')&&!has(web.modules,'app/android.css'),'no Android module in the site');
assert.ok(!web.css.includes('.native-app'),'no Android styles in the site');
assert.ok(web.files.includes('sw.js')&&web.files.includes('manifest.webmanifest'),'the site keeps its service worker and manifest');
console.log('PASS: Android build (client, entry, no service worker, no /Nous-deux/), trial marker and title, web client guard, site without Android files.');
