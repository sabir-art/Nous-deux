// Isolated call UI. The SDK, invitations and API are fixtures; no one is called.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,realpathSync} from 'node:fs';
import {createServer} from 'node:http';
const require=createRequire(import.meta.url),{build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const api=`
const time=Date.now(),incoming=location.search.includes('incoming'),history=[];
let call=incoming?{id:crypto.randomUUID(),caller:1,mode:'video',state:'ringing',mine:false,createdAt:time,expiresAt:time+90000,maxExpiresAt:time+7200000,connectedAt:null,endedAt:null,endReason:null}:null;
export const APP_BASE='/Nous-deux/';
export async function apiFetch(path,init={}){
 if(!path.startsWith('/api/daily-calls'))throw Error('Unexpected fixture API: '+path);
 if(!init.body)return Response.json({configured:true,call,history,estimatedMinutes:8});
 const p=JSON.parse(init.body);(window.actions??=[]).push(p.action);
 if(p.action==='start')call={id:p.id,caller:0,mode:p.mode,state:'ringing',mine:true,createdAt:Date.now(),expiresAt:time+90000,maxExpiresAt:time+7200000,connectedAt:null,endedAt:null,endReason:null};
 if(p.action==='accept')call={...call,state:'connecting',mine:true};
 if(p.action==='heartbeat'&&p.connected)call={...call,state:'connected',connectedAt:call.connectedAt||Date.now()};
 if(p.action==='end'||p.action==='decline'){const ended={...call,state:p.action==='decline'?'declined':'ended',endedAt:Date.now()};history.unshift(ended);call=null;return Response.json({call,ended});}
 return Response.json({call,join:{url:'https://fixture.daily.co/private',token:'fixture'}});
}`;
const engine=`export async function createCallEngine(cb){
 let local={local:true,audio:true,video:false,tracks:{audio:{state:'off'},video:{state:'off'}}},remote;
 function update(){cb.media({local:{...local},remote});}
 window.callCallbacks=cb;
 return {async prepare(video){local.video=video;update();},async join(){remote={local:false,audio:true,video:false,tracks:{audio:{state:'off'},video:{state:'off'}}};update();cb.network('connected');},mute(value){local.audio=!value;update();},async camera(value){local.video=value;update();},async flip(){window.flips=(window.flips||0)+1;},async microphone(){},async destroy(){window.destroyed=(window.destroyed||0)+1;}};
}`;
const source=`import React,{useState} from 'react';import {createRoot} from 'react-dom/client';import HouseCalls from './app/house-calls';
function Fixture(){const [mounted,setMounted]=useState(true);window.unmountCall=()=>setMounted(false);return <main className="app-shell">{mounted&&<HouseCalls active={0} names={['Alex','Camille']} expanded onOpen={()=>{}}/>}</main>;}createRoot(document.getElementById('root')).render(<Fixture/>);`;
const bundle=await build({stdin:{contents:source,loader:'tsx',resolveDir:process.cwd()},bundle:true,platform:'browser',format:'esm',write:false,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'isolated-calls',setup(b){b.onResolve({filter:/api-client$/},()=>({path:'api',namespace:'fixture'}));b.onResolve({filter:/daily-engine$/},()=>({path:'engine',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path==='api'?api:engine}));}}]});
if(process.argv.includes('--bundle-only')){console.log('PASS: Daily isolated UI fixture compiles.');process.exit(0);}
const css=['design-system/tokens/tokens.css','design-system/components/bundle.css','app/application.css'].map(p=>readFileSync(p,'utf8')).join('\n');
const csp=readFileSync('index.html','utf8').match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
const server=createServer((req,res)=>{if(req.url==='/fixture.js'){res.setHeader('Content-Type','text/javascript');res.end(bundle.outputFiles[0].text);}else if(req.url==='/fixture.css'){res.setHeader('Content-Type','text/css');res.end(css);}else{res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html lang="fr" data-theme="light"><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta http-equiv="Content-Security-Policy" content="${csp}"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`);}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const {webkit,chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
try{for(const browserType of [webkit,chromium]){
 const browser=await browserType.launch({headless:true});
 try{const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/?incoming');await page.getByRole('button',{name:'Répondre',exact:true}).waitFor();
  const geometry=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('.call-control')].map(b=>{const r=b.getBoundingClientRect();return {x:r.x,right:r.right,width:r.width,height:r.height};})}));
  assert(geometry.scroll<=geometry.width,JSON.stringify({width,...geometry}));for(const b of geometry.buttons){assert(b.width>=44&&b.height>=44);assert(b.x>=0&&b.right<=width);}
  await page.getByRole('button',{name:'Répondre',exact:true}).click();await page.getByRole('button',{name:'Raccrocher',exact:true}).waitFor();
  await page.waitForFunction(()=>window.actions?.includes('heartbeat'));
  assert(await page.locator('dialog[open]').isVisible());
  await page.getByRole('button',{name:'Micro',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Micro coupé',exact:true}).getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Caméra',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Caméra',exact:true}).getAttribute('aria-pressed'),'false');
  await page.evaluate(()=>window.callCallbacks.network('reconnecting'));await page.getByText('Connexion perdue · reconnexion…',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Réduire l’appel'}).click();await page.locator('.call-mini').waitFor();assert.equal(await page.locator('dialog[open]').count(),0);
  await page.locator('.call-mini').click();await page.getByRole('button',{name:'Raccrocher',exact:true}).click();await page.getByRole('heading',{name:'Nos derniers appels'}).waitFor();assert.equal(await page.evaluate(()=>window.destroyed),1);
  assert.equal(await page.locator('.call-history article').count(),1);
 }
 await page.goto(base);await page.getByRole('button',{name:'Appel audio',exact:true}).click();await page.getByRole('button',{name:'Raccrocher',exact:true}).waitFor();
 await page.evaluate(()=>window.unmountCall());await page.waitForFunction(()=>window.destroyed===1&&window.actions.includes('end'));
 await page.goto(base+'/?incoming');await page.getByRole('button',{name:'Refuser',exact:true}).click();await page.getByRole('heading',{name:'Nos derniers appels'}).waitFor();assert.equal(await page.locator('.call-history article').count(),1);
 assert.deepEqual(errors,[]);console.log('PASS: '+browserType.name()+' Daily incoming, answer, decline, mute, camera, reconnect, minimize, hangup, unmount and responsive layouts.');await context.close();
 }finally{await browser.close();}
}}finally{await new Promise(r=>server.close(r));}
