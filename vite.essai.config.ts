// Trial build: the real interface with lib/essai-api-client.ts instead of the Supabase client.
// Relative paths so the build can be served from any address; no CSP/manifest tied to the real app.
import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({base:'./',esbuild:{jsx:'automatic'},
 resolve:{alias:[{find:/^(\.\.\/)+lib\/api-client$/,replacement:fileURLToPath(new URL('./lib/essai-api-client.ts',import.meta.url))},{find:/^npm:zod@.*$/,replacement:'zod'}]},
 plugins:[{name:'essai-html',transformIndexHtml:html=>html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/,'').replace(/<link rel="manifest"[^>]*>/,'').replace(/href="\/Nous-deux\//g,'href="./').replace(/<title>[^<]*<\/title>/,'<title>Nous deux · Mode essai</title>')}],
 build:{outDir:'dist-essai',emptyOutDir:true},css:{postcss:{plugins:[]}}});
