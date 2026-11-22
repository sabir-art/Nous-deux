// Android build (Capacitor): the real interface and the same Supabase API as the web build,
// with relative paths and APP_BASE='/' (lib/android-api-client.ts), output in dist-android/.
// vite.web.config.ts (GitHub Pages) is left untouched.
// No manifest and no service worker in the app: Web Push does not exist in the Android WebView;
// native notifications are a later step (Firebase).
import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import {rmSync} from 'node:fs';
const androidClient=fileURLToPath(new URL('./lib/android-api-client.ts',import.meta.url));
export default defineConfig({base:'./',esbuild:{jsx:'automatic'},
 plugins:[
  {name:'android-api-client',enforce:'pre',resolveId(source,importer){
   if(/(^|\/)api-client$/.test(source)&&importer&&!importer.replace(/\\/g,'/').endsWith('lib/android-api-client.ts'))return androidClient;
   return null;}},
  {name:'android-html',transformIndexHtml:html=>html.replace(/<link rel="manifest"[^>]*>/,'').replace(/href="\/Nous-deux\//g,'href="./')},
  {name:'android-no-service-worker',apply:'build',closeBundle(){for(const f of ['sw.js','manifest.webmanifest'])rmSync(fileURLToPath(new URL('./dist-android/'+f,import.meta.url)),{force:true});}},
 ],
 build:{outDir:'dist-android',emptyOutDir:true},css:{postcss:{plugins:[]}}});
