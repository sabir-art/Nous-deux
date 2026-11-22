// Android build (Capacitor): the real interface and the same Supabase API as the web build,
// with relative paths and APP_BASE='/' (lib/android-api-client.ts), output in dist-android/.
// web/android.ts (edge to edge, system bars, app/android.css) is injected only here.
// vite.web.config.ts (GitHub Pages) is left untouched.
// No manifest and no service worker in the app: Web Push does not exist in the Android WebView;
// native notifications are a later step (Firebase).
// `--mode essai` (pnpm run build:android:essai): local test build with lib/essai-api-client.ts (fake house in the
// WebView storage, nothing sent to Supabase). Never publish it.
import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import {rmSync} from 'node:fs';
const androidClient=fileURLToPath(new URL('./lib/android-api-client.ts',import.meta.url));
const essaiClient=fileURLToPath(new URL('./lib/essai-api-client.ts',import.meta.url));
export default defineConfig(({mode})=>{
 const essai=mode==='essai';
 return {base:'./',esbuild:{jsx:'automatic'},
  resolve:essai?{alias:[{find:/^npm:zod@.*$/,replacement:'zod'}]}:undefined,
  plugins:[
   {name:'android-api-client',enforce:'pre',resolveId(source,importer){
    if(!/(^|\/)api-client$/.test(source)||!importer)return null;
    const from=importer.replace(/\\/g,'/');
    if(from.endsWith('lib/android-api-client.ts')||from.endsWith('lib/essai-api-client.ts'))return null;
    return essai?essaiClient:androidClient;}},
   {name:'android-html',transformIndexHtml:{order:'pre',handler:html=>html
    .replace(/<link rel="manifest"[^>]*>/,'')
    .replace(/href="\/Nous-deux\//g,'href="./')
    .replace('<script type="module" src="/web/main.tsx"></script>','<script type="module" src="/web/android.ts"></script><script type="module" src="/web/main.tsx"></script>')
    .replace(/<title>[^<]*<\/title>/,m=>essai?'<title>Nous deux · Mode essai</title>':m)}},
   {name:'android-no-service-worker',apply:'build',closeBundle(){for(const f of ['sw.js','manifest.webmanifest'])rmSync(fileURLToPath(new URL('./dist-android/'+f,import.meta.url)),{force:true});}},
  ],
  build:{outDir:'dist-android',emptyOutDir:true},css:{postcss:{plugins:[]}}};
});
