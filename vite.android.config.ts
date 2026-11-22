// Android build (Capacitor): the real interface and the same Supabase API as the web build,
// with relative paths and APP_BASE='/' (lib/android-api-client.ts), output in dist-android/.
// web/android.ts (edge to edge, system bars, app/android.css) is injected only here.
// vite.web.config.ts (GitHub Pages) is left untouched.
// No manifest and no service worker in the app: Web Push does not exist in the Android WebView; notifications go
// through Firebase Cloud Messaging (lib/android-push-client.ts instead of lib/push-client.ts, web/android.ts).
// `--mode essai` (pnpm run build:android:essai): local test build with lib/essai-api-client.ts (fake house in the
// WebView storage, nothing sent to Supabase), written to dist-android-essai/ so that a plain `cap sync` (which reads
// dist-android/) can never ship it, with a marker file that makes Gradle refuse a release build. Never publish it.
import {defineConfig,type Plugin} from 'vite';
import {fileURLToPath} from 'node:url';
import {rmSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const androidClient=fileURLToPath(new URL('./lib/android-api-client.ts',import.meta.url));
const essaiClient=fileURLToPath(new URL('./lib/essai-api-client.ts',import.meta.url));
const androidPush=fileURLToPath(new URL('./lib/android-push-client.ts',import.meta.url));
const ESSAI_MARKER='ESSAI-NE-PAS-PUBLIER.txt';
const slash=(id:string)=>id.replace(/\\/g,'/');
export default defineConfig(({mode})=>{
 const essai=mode==='essai';
 let outDir='';
 // Every import of lib/api-client (with or without .ts) gets the Android or the trial client.
 const swapClient:Plugin={name:'android-api-client',enforce:'pre',resolveId(source,importer){
  if(!/(^|\/)api-client(\.ts)?$/.test(source)||!importer)return null;
  const from=slash(importer);
  if(from.endsWith('lib/android-api-client.ts')||from.endsWith('lib/essai-api-client.ts'))return null;
  return essai?essaiClient:androidClient;}};
 // Fails the build if the web client (APP_BASE='/Nous-deux/', NATIVE_APP=false) slipped in through another path
 // (alias, unusual specifier): only lib/android-api-client.ts may import it, and never in the trial build.
 const checkClient:Plugin={name:'android-api-client-check',apply:'build',generateBundle(){
  const ids=[...this.getModuleIds()];
  const expected=essai?'lib/essai-api-client.ts':'lib/android-api-client.ts';
  if(!ids.some(id=>slash(id).endsWith(expected)))this.error('Build Android : '+expected+' absent du bundle.');
  const web=ids.find(id=>slash(id).endsWith('lib/api-client.ts'));if(!web)return;
  const importers=[...(this.getModuleInfo(web)?.importers||[])].map(slash);
  const wrong=essai?importers:importers.filter(i=>!i.endsWith('lib/android-api-client.ts'));
  if(wrong.length)this.error('Build Android : lib/api-client.ts (client du site) importé par '+wrong.join(', ')+'.');
  // Notifications: the real app uses Firebase (lib/android-push-client.ts); the trial keeps the site's client.
  if(!essai){
   if(!ids.some(id=>slash(id).endsWith('lib/android-push-client.ts')))this.error('Build Android : lib/android-push-client.ts absent du bundle.');
   const push=ids.find(id=>slash(id).endsWith('lib/push-client.ts'));
   const wrongPush=push?[...(this.getModuleInfo(push)?.importers||[])].map(slash).filter(i=>!i.endsWith('lib/android-push-client.ts')):[];
   if(wrongPush.length)this.error('Build Android : lib/push-client.ts (Web Push du site) importé par '+wrongPush.join(', ')+'.');
  }}};
 // Every import of lib/push-client gets the Firebase client in the real app (house-notifications, house-app).
 const swapPush:Plugin={name:'android-push-client',enforce:'pre',resolveId(source,importer){
  if(essai||!/(^|\/)push-client(\.ts)?$/.test(source)||!importer||slash(importer).endsWith('lib/android-push-client.ts'))return null;
  return androidPush;}};
 return {base:'./',esbuild:{jsx:'automatic'},
  resolve:essai?{alias:[{find:/^npm:zod@.*$/,replacement:'zod'}]}:undefined,
  plugins:[
   swapClient,swapPush,checkClient,
   {name:'android-html',transformIndexHtml:{order:'pre',handler:html=>html
    .replace(/<link rel="manifest"[^>]*>/,'')
    .replace(/href="\/Nous-deux\//g,'href="./')
    .replace('<script type="module" src="/web/main.tsx"></script>','<script type="module" src="/web/android.ts"></script><script type="module" src="/web/main.tsx"></script>')
    .replace(/<title>[^<]*<\/title>/,m=>essai?'<title>Nous deux · Mode essai</title>':m)}},
   {name:'android-output',apply:'build',configResolved(config){outDir=resolve(config.root,config.build.outDir);},closeBundle(){
    for(const f of ['sw.js','manifest.webmanifest'])rmSync(resolve(outDir,f),{force:true});
    if(essai)writeFileSync(resolve(outDir,ESSAI_MARKER),'Build du mode essai (fausse maison) : ne jamais publier.\n');}},
  ],
  build:{outDir:essai?'dist-android-essai':'dist-android',emptyOutDir:true},css:{postcss:{plugins:[]}}};
});
