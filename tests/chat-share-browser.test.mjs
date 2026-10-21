// « Partager avec… » in a real browser: every kind can be chosen and sent, the sweet note accepts
// one's own words, the shopping week is chosen, empty lists offer a way to start, stickers stay
// close together, our emojis are drawn inline and nothing scrolls sideways at 360 px or on desktop.
// The fake API runs the real house-api card helpers and validation on a local fixture state.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,realpathSync} from 'node:fs';
import {createServer} from 'node:http';
const require=createRequire(import.meta.url),{build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const day=n=>{const d=new Date();d.setUTCHours(12);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
const monday=(()=>{const d=new Date(day(0)+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10);})();
const nextMonday=(()=>{const d=new Date(monday+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+7);return d.toISOString().slice(0,10);})();
const uid=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
const item=(n,title,quantity,week,extra={})=>({id:uid(n),kind:'shopping',title,quantity,assignee:-1,due:'',priority:0,done:false,note:'',photoId:null,weekStart:week,owner:1,version:1,...extra});
const full={household:{first:'Alex',second:'Camille',version:1},devices:[],activity:[],sequence:0,
 items:[item(1,'Pain','1',monday),item(2,'Lait','2 L',monday),item(3,'Farine','1 kg',nextMonday),{...item(4,'Sortir les poubelles','',''),kind:'task',assignee:0,due:day(2),priority:1}],
 entries:[{id:uid(10),kind:'expense',title:'Restaurant',cents:4250,member:1,owner:1,category:'Sorties',date:day(-1),note:'',version:1}],
 plants:[{id:uid(20),owner:1,name:'Le petit cactus du bureau de Camille',species:'cactus',location:'',note:'',waterEvery:3,lightEvery:0,feedEvery:0,lastWater:day(-6),lastLight:day(-6),lastFeed:day(-6),reminders:false,remindBoth:false,version:1,careLog:[]}],
 appointments:[{id:uid(30),title:'Dîner chez nos amis',category:'party',visibility:'shared',person:-1,status:'scheduled',date:day(3),time:'20:00',bookBy:'',location:'Lyon',note:'',recurrence:'none',endDate:'',repeatUntil:'',owner:1,version:1}],
 personalRecipes:[],mealPlans:[{id:uid(40),version:1,owner:0,weekStart:monday,slots:[{day:0,meal:'dinner',recipeId:'shakshuka'}]}]};
const empty={...full,items:[],entries:[],plants:[],appointments:[],mealPlans:[]};
const api=`import {buildChatCard,storeChatCard,attachChatCards,stickerText} from './supabase/functions/house-api/chat-cards.ts';import {chatInput} from './supabase/functions/house-api/validation.ts';
export const APP_BASE='/Nous-deux/';const state=window.fixtureState;let messages=[];
export function hasSession(){return true;}
export async function apiFetch(path,init={}){await new Promise(r=>setTimeout(r,20));try{
 if(path.startsWith('/api/chat-settings'))return Response.json({theme:'rose'});
 if(path.startsWith('/api/recipes'))return Response.json({recipes:state.personalRecipes,plans:state.mealPlans});
 if(path.startsWith('/api/chat')){if(init.body){const v=chatInput.parse(JSON.parse(init.body)),at=new Date().toISOString();let text=v.text||'';
  if(v.attachmentId)throw Object.assign(Error('Pas de fichier ici.'),{status:400});
  if(v.sticker){storeChatCard(state,v.id,{member:0,kind:'sticker',ref:v.sticker,at});text=stickerText(v.sticker);}
  else if(v.card){const c=buildChatCard(state,v.card,0,undefined,v.text||'');storeChatCard(state,v.id,{member:0,kind:v.card.kind,ref:c.ref,data:c.data,...(v.text&&!c.ownText?{note:v.text}:{}),at});text=c.summary;}
  if(!messages.some(m=>m.id===v.id))messages.push({id:v.id,member:0,text,created_at:at,version:1,editable_until:null});window.sent=(window.sent||0)+1;}
  return Response.json({messages:attachChatCards(messages,state.chatCards),hasMore:false,serverNow:new Date().toISOString()});}
 return Response.json({});
}catch(e){return Response.json({error:e.issues?'Vérifiez les champs.':e.message},{status:e.status||400});}}`;
const source=`import React from 'react';import {createRoot} from 'react-dom/client';import HouseChat from './app/house-chat';
function Fixture(){return <div className="app-shell chat-view"><div className="workspace"><main><HouseChat active={0} names={['Alex','Camille']} home={window.fixtureState} onOpen={t=>{window.opened=t;}}/></main></div></div>;}createRoot(document.getElementById('root')).render(<Fixture/>);`;
const bundle=await build({stdin:{contents:source,loader:'tsx',resolveDir:process.cwd()},bundle:true,platform:'browser',format:'esm',write:false,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'fixture',setup(b){
 b.onResolve({filter:/api-client$/},()=>({path:'api',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:api,loader:'ts',resolveDir:process.cwd()}));
 b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));}}]});
const css=['design-system/tokens/tokens.css','design-system/components/bundle.css','app/application.css'].map(p=>readFileSync(p,'utf8')).join('\n');
const server=createServer((req,res)=>{const u=new URL(req.url,'http://x');if(u.pathname==='/fixture.js'){res.setHeader('Content-Type','text/javascript');res.end(bundle.outputFiles[0].text);}else if(u.pathname==='/fixture.css'){res.setHeader('Content-Type','text/css');res.end(css);}
 else{res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script>window.fixtureState=${JSON.stringify(u.searchParams.get('empty')?empty:full)};</script><script type="module" src="/fixture.js"></script></body></html>`);}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const sideways=page=>page.evaluate(()=>[document.documentElement,document.querySelector('.chat-messages')].filter(el=>el&&el.scrollWidth>el.clientWidth+1).map(el=>el.className||el.tagName));
try{for(const engine of process.env.CHROMIUM_EXECUTABLE?[chromium]:[chromium,webkit]){
 const browser=await engine.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']}:{})});
 try{for(const width of [360,1280]){
  const context=await browser.newContext({viewport:{width,height:820}});await context.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.getByText('Un petit mot pour vous deux').waitFor();
  const share=async kind=>{await page.getByRole('button',{name:/Joindre une photo ou partager/}).click();await page.getByRole('button',{name:new RegExp('^'+kind)}).click();};
  const send=async label=>{const button=page.getByRole('button',{name:/^Envoyer$/});await page.waitForFunction(()=>{const b=[...document.querySelectorAll('dialog[open] button')].find(b=>b.textContent==='Envoyer');return b&&!b.disabled;},null,{timeout:4000}).catch(()=>{throw Error(label+': Envoyer reste inactif');});await button.click();await page.locator('dialog.house-share-dialog').waitFor({state:'detached'});};
  // Every kind: choose, Send becomes active, the card arrives.
  await share('La liste de courses');assert.equal(await page.locator('.house-share-weeks [role=radio]').count(),2,'This week and next week have items');
  await page.getByRole('radio',{name:/La semaine prochaine/}).click();await send('courses');await page.locator('.house-card-shopping').filter({hasText:'Farine'}).waitFor();
  for(const [kind,cls] of [['Une dépense','expense'],['Une plante','plant'],['Une mission','task'],['Un rendez-vous partagé','appointment'],['Une recette','recipe'],['Un menu de la semaine','menu']]){
   await share(kind);await page.locator('.house-share-options [role=radio]').first().click();if(kind==='Une plante'){await page.getByRole('button',{name:/Ajouter un petit mot/}).click();await page.locator('.house-share-note textarea').fill('Il a soif !');}
   await send(kind);await page.locator('.house-card-'+cls).first().waitFor();}
  // Sweet notes: own words only, then a ready-made note with an extra line.
  await share('Un petit mot doux');await page.locator('.house-share-note textarea').fill('Merci pour ce matin :nd-coeur:');await send('mot perso');
  await page.locator('.house-card-mot').filter({hasText:'Merci pour ce matin'}).locator('.nd-emoji[aria-label="Un cœur tout doux"]').waitFor();
  await share('Un petit mot doux');await page.locator('.house-share-sweet-list [role=radio]').first().click();await page.locator('.house-share-note textarea').fill('Et un câlin');await send('mot + ligne');
  await page.locator('.house-card-mot').filter({hasText:'Et un câlin'}).waitFor();
  // The plant card reads horizontally (the speech bubble keeps a real width).
  assert(await page.locator('.house-card-plant-row p').first().evaluate(el=>el.getBoundingClientRect().width)>120,'Plant speech bubble is not squeezed');
  // Two stickers in a row stay close; our emojis are drawn inside the text.
  await page.getByRole('button',{name:'Choisir un émoji'}).click();for(const s of ['bisou !','ouaf !']){await page.getByRole('button',{name:'Envoyer le sticker « '+s+' »',exact:true}).click();await page.waitForFunction(n=>document.querySelectorAll('.chat-sticker-bubble').length===n,s==='bisou !'?1:2);}
  const gap=await page.evaluate(()=>{const [a,b]=[...document.querySelectorAll('.chat-sticker-bubble .couple-sticker')].map(e=>e.getBoundingClientRect());return b.top-a.bottom;});assert(gap<32,'Stickers in a row stay close: '+gap);
  await page.getByRole('button',{name:'Émojis',exact:true}).click();await page.getByRole('button',{name:'Le chat',exact:true}).click();await page.locator('textarea[aria-label="Votre message"]').press('End');await page.locator('textarea[aria-label="Votre message"]').type(' a volé ma place');
  await page.getByRole('button',{name:'Envoyer le message'}).click();await page.locator('.chat-message .nd-emoji[aria-label="Le chat"]').waitFor();
  assert.deepEqual(await sideways(page),[],engine.name()+' '+width+' no horizontal scroll');
  // Photos and documents still open the file chooser, whose Send is active.
  await page.getByRole('button',{name:/Joindre une photo ou partager/}).click();const [chooser]=await Promise.all([page.waitForEvent('filechooser'),page.getByRole('button',{name:/^Photos ou documents/}).click()]);
  await chooser.setFiles({name:'liste.txt',mimeType:'text/plain',buffer:Buffer.from('pain')});assert(await page.locator('dialog[open] .chat-upload-actions .primary').isEnabled());
  assert.deepEqual(errors,[]);await context.close();}
  // Nothing to share yet: a warm sentence and a button to start, Send stays off.
  const context=await browser.newContext({viewport:{width:360,height:780}});await context.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());const page=await context.newPage();await page.goto(base+'/?empty=1');await page.getByText('Un petit mot pour vous deux').waitFor();
  for(const [kind,action,create] of [['La liste de courses','Ajouter des courses','shopping'],['Une dépense','Noter une dépense','expense'],['Une plante','Ajouter une plante','plants'],['Une mission','Créer une mission','task'],['Un rendez-vous partagé','Ajouter un rendez-vous','appointment'],['Un menu de la semaine','Préparer un menu','menu']]){
   await page.getByRole('button',{name:/Joindre une photo ou partager/}).click();await page.getByRole('button',{name:new RegExp('^'+kind)}).click();
   await page.getByRole('button',{name:action}).waitFor();assert(!(await page.getByRole('button',{name:/^Envoyer$/}).isEnabled()),kind);
   await page.getByRole('button',{name:action}).click();assert.equal(await page.evaluate(()=>window.opened?.create),create);assert.equal(await page.locator('dialog.house-share-dialog').count(),0);}
  await context.close();
  console.log('PASS: '+engine.name()+' every share kind sends, own sweet note, week choice, empty states with a way to start, close stickers, inline emojis, no sideways scroll at 360 px and 1280 px.');
 }finally{await browser.close();}
}}finally{await new Promise(r=>server.close(r));}
