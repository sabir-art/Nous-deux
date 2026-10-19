// Shared house cards and couple stickers in the chat: server validation, privacy and rendering.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
const require=createRequire(import.meta.url),{build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const plugins=[{name:'test-dependencies',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));b.onResolve({filter:/^npm:@block65/},()=>({path:'push',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export function buildPushPayload(){throw Error("No pushes permitted in tests")}'}));}}];
const bundle=await build({entryPoints:['supabase/functions/house-api/index.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins});
globalThis.Deno={env:{get:n=>n==='SUPABASE_URL'?'https://db.test':n==='SUPABASE_SERVICE_ROLE_KEY'?'test-service-key':undefined},serve:()=>{}};
const paris=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const monday=(()=>{const d=new Date(paris+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10);})();
const daysAgo=n=>{const d=new Date(paris+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-n);return d.toISOString().slice(0,10);};
const id=()=>crypto.randomUUID();
const ids={expense:id(),plant:id(),task:id(),shared:id(),mine:id(),theirs:id(),plan:id(),personal:id(),milk:id()};
const household={household:{first:'Alex',second:'Camille',version:1},devices:[],activity:[],sequence:0,
 items:[{id:ids.milk,kind:'shopping',title:'Lait d’avoine',quantity:'2 L',done:false,weekStart:monday,owner:1,version:1},{id:id(),kind:'shopping',title:'Pain',quantity:'',done:true,weekStart:monday,owner:0,version:2},{id:id(),kind:'shopping',title:'Ancienne semaine',quantity:'',done:false,weekStart:'2020-01-06',owner:0,version:1},{id:ids.task,kind:'task',title:'Sortir les poubelles',quantity:'',assignee:1,due:paris,priority:1,done:false,owner:0,version:1,note:'note interne'}],
 entries:[{id:ids.expense,kind:'expense',title:'Restaurant',cents:4250,member:1,category:'Sorties',date:paris,note:'note privée de la dépense',owner:1,version:1}],
 plants:[{id:ids.plant,name:'Fifi',species:'Monstera',location:'Salon',note:'',waterEvery:3,lightEvery:0,feedEvery:0,lastWater:daysAgo(5),lastLight:daysAgo(5),lastFeed:daysAgo(5),reminders:true,remindBoth:true,owner:1,version:1,careLog:[]}],
 appointments:[{id:ids.shared,title:'Dîner chez nos amis',category:'party',visibility:'shared',person:-1,status:'scheduled',date:paris,time:'20:00',bookBy:'',location:'Lyon',note:'code de la porte 1234',owner:1,version:1},
  {id:ids.mine,title:'Surprise d’anniversaire',category:'personal',visibility:'private',person:0,status:'scheduled',date:paris,time:'',bookBy:'',location:'',note:'cadeau secret',owner:0,version:1},
  {id:ids.theirs,title:'Rendez-vous privé',category:'medical',visibility:'private',person:1,status:'scheduled',date:paris,time:'',bookBy:'',location:'',note:'',owner:1,version:1}],
 personalRecipes:[{id:ids.personal,title:'Gratin de Camille',minutes:45,servings:4,group:'Végétarien',archived:false,owner:1,version:1}],
 mealPlans:[{id:ids.plan,version:1,owner:0,weekStart:monday,slots:[{day:0,meal:'dinner',recipeId:'shakshuka'},{day:1,meal:'lunch',recipeId:ids.personal}]}]};
const records=[];let member=0,stateVersion=1;const pushes=[];
globalThis.fetch=async(url,init={})=>{const u=new URL(url);assert.equal(u.hostname,'db.test','Unit tests never call real services');const method=init.method||'GET';
 if(u.pathname.endsWith('nd_sessions'))return Response.json([{member}]);
 if(u.pathname.endsWith('rpc/nd_openai_key_get'))return Response.json(null);
 if(u.pathname.endsWith('nd_state')){
  if(method==='PATCH'){if(u.searchParams.get('version')!=='eq.'+stateVersion)return Response.json([]);const p=JSON.parse(init.body);Object.assign(household,structuredClone(p.data));stateVersion=p.version;return Response.json([{version:stateVersion}]);}
  if(u.searchParams.get('select')==='chatCards:data->chatCards')return Response.json([{chatCards:household.chatCards??null}]);
  return Response.json([{version:stateVersion,data:structuredClone(household)}]);
 }
 if(u.pathname.endsWith('rpc/nd_chat_read')){const p=JSON.parse(init.body);return Response.json({messages:records.filter(r=>!r.hiddenFor?.includes(p.p_actor)).map(r=>({id:r.id,member:r.member,text:r.removedFor?.includes(p.p_actor)||r.deleted?'':r.text,deleted:r.deleted?'everyone':r.removedFor?.includes(p.p_actor)?'me':null,version:r.version,created_at:r.created_at,edited_at:null,editable_until:r.member===p.p_actor&&!r.deleted?new Date(Date.now()+60000).toISOString():null})),hasMore:false});}
 if(u.pathname.endsWith('rpc/nd_chat_change')){const p=JSON.parse(init.body),m=records.find(r=>r.id===p.p_id);
  if(p.p_action==='clear'){for(const r of records.filter(r=>r.member===p.p_actor)){if(p.p_scope==='everyone'){r.deleted=true;r.text='';}(r.hiddenFor??=[]).push(p.p_actor);}return Response.json({ok:true,cleanup:[]});}
  if(!m)return Response.json({status:404,error:'Introuvable'});
  if(p.p_action==='delete'&&p.p_scope==='me'){(m.removedFor??=[]).push(p.p_actor);return Response.json({ok:true,cleanup:[]});}
  if(m.member!==p.p_actor)return Response.json({status:403,error:'Interdit'});if(m.version!==p.p_version)return Response.json({status:409,error:'Version'});
  if(p.p_action==='edit'){m.text=p.p_text;m.version++;}else{m.text='';m.deleted=true;m.version++;}return Response.json({ok:true,cleanup:[]});}
 if(u.pathname.endsWith('nd_messages')){const mid=u.searchParams.get('id')?.slice(3);if(method==='GET')return Response.json(mid?records.filter(r=>r.id===mid):[]);const p=JSON.parse(init.body);if(records.some(r=>r.id===p.id))return Response.json([]);const row={...p,created_at:new Date().toISOString(),version:1};records.push(row);return Response.json([row]);}
 throw Error('Unexpected request '+u.pathname);
};
const {handler}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const chat=async(payload)=>{const r=await handler(new Request('https://edge.test/?route=chat',{method:payload?'POST':'GET',headers:{Origin:'https://sabir-art.github.io','Content-Type':'application/json','x-house-session':'a'.repeat(64)},...(payload?{body:JSON.stringify(payload)}:{})}));return {status:r.status,body:await r.json()};};
const send=(extra)=>chat({action:'send',id:id(),...extra});
const read=async()=>(await chat()).body.messages;

// Shopping list: current week only, items left to buy, spoofed author ignored.
let r=await send({card:{kind:'shopping'},text:'Tu peux passer au marché ?',member:1});assert.equal(r.status,200,JSON.stringify(r.body));
let m=records.at(-1);assert.equal(m.member,0);assert(m.text.startsWith('🛒 Liste de courses : 1 article à acheter'));assert(m.text.endsWith('Tu peux passer au marché ?'));
let card=(await read()).find(x=>x.id===m.id).card;assert.equal(card.kind,'shopping');assert.equal(card.ref,monday);assert.deepEqual(card.data.items,[{title:'Lait d’avoine',quantity:'2 L'}]);assert.equal(card.data.bought,1);assert.equal(card.note,'Tu peux passer au marché ?');
assert.equal((await read()).find(x=>x.id===m.id).editable_until,null,'Card messages are never editable');
assert.equal((await chat({action:'edit',id:m.id,text:'Autre chose',version:1})).status,400,'Server refuses to edit a card message');assert(m.text.startsWith('🛒'));
assert.equal((await send({card:{kind:'shopping',weekStart:'2026-10-21'}})).status,400,'A shopping week starts on Monday');
assert.equal((await send({card:{kind:'shopping',weekStart:'2030-01-07'}})).status,400,'An empty week cannot be shared');

// Expense, plant, mission, recipe and menu snapshots keep only what the card shows.
r=await send({card:{kind:'expense',id:ids.expense},text:'On était bien 💛'});assert.equal(r.status,200);card=household.chatCards[records.at(-1).id];
assert.deepEqual(card.data,{title:'Restaurant',cents:4250,payer:1,category:'Sorties',date:paris,kind:'expense'});assert(!JSON.stringify(card).includes('note privée'));
r=await send({card:{kind:'plant',id:ids.plant},text:'Regarde, elle a soif, tu peux l’arroser ?'});assert.equal(r.status,200);card=household.chatCards[records.at(-1).id];
assert.equal(card.data.name,'Fifi');assert.equal(card.data.mood,'thirsty');assert.deepEqual(card.data.due,['water']);assert.equal(card.data.overdue,2);assert(records.at(-1).text.startsWith('🌱 Fifi a soif !'));
r=await send({card:{kind:'task',id:ids.task}});assert.equal(r.status,200);card=household.chatCards[records.at(-1).id];assert.deepEqual(card.data,{title:'Sortir les poubelles',assignee:1,due:paris,done:false,priority:1});
assert.equal((await send({card:{kind:'task',id:ids.milk}})).status,404,'A shopping item is not a mission');
r=await send({card:{kind:'recipe',id:'shakshuka'}});assert.equal(r.status,200);assert.equal(household.chatCards[records.at(-1).id].data.title,'Chakchouka aux œufs');
r=await send({card:{kind:'recipe',id:ids.personal}});assert.equal(r.status,200);assert.deepEqual(household.chatCards[records.at(-1).id].data,{title:'Gratin de Camille',minutes:45,servings:4,group:'Végétarien'});
assert.equal((await send({card:{kind:'recipe',id:'pork-ribs'}})).status,404);
r=await send({card:{kind:'menu',id:ids.plan}});assert.equal(r.status,200);assert.deepEqual(household.chatCards[records.at(-1).id].data.slots.map(s=>s.title),['Chakchouka aux œufs','Gratin de Camille']);
assert.equal((await send({card:{kind:'expense',id:id()}})).status,404,'Unknown references are refused');
console.log('PASS: shopping, expense, plant, mission, recipe and menu cards validated server-side with minimal snapshots, non-editable and author forced by the session.');

// Privacy: private appointments never travel through the chat, whoever owns them.
r=await send({card:{kind:'appointment',id:ids.theirs}});assert.equal(r.status,404,'The partner’s private event is invisible to the sender');
r=await send({card:{kind:'appointment',id:ids.mine}});assert.equal(r.status,403,'Even the author cannot post a private event in the shared chat');
assert(!records.some(x=>/Surprise|Rendez-vous privé/.test(x.text)));assert(!JSON.stringify(household.chatCards).includes('cadeau secret'));
r=await send({card:{kind:'appointment',id:ids.shared}});assert.equal(r.status,200);card=household.chatCards[records.at(-1).id];
assert.equal(card.data.title,'Dîner chez nos amis');assert.equal(card.data.location,'Lyon');assert(!JSON.stringify(card).includes('1234'),'Event notes stay out of the card');
// Malformed or mixed payloads are refused before any state change.
const before=JSON.stringify(household.chatCards);
for(const bad of [{card:{kind:'plant',id:ids.plant},voiceId:id()},{card:{kind:'plant',id:ids.plant},attachmentId:id()},{card:{kind:'plant',id:ids.plant},text:'x'.repeat(281)},{card:{kind:'secret',id:ids.plant}},{card:{kind:'plant',id:ids.plant,owner:1}},{card:{kind:'appointment',id:'not-a-uuid'}},{sticker:'bisou',text:'coucou'},{sticker:'inconnu'},{sticker:'bisou',card:{kind:'shopping'}}])assert.equal((await send(bad)).status,400,JSON.stringify(bad));
assert.equal(JSON.stringify(household.chatCards),before);
console.log('PASS: private appointments refused (partner’s and own), notes excluded, mixed, unknown or oversized payloads refused without state changes.');

// Stickers: small typed payload, idempotent retries, partner cannot take over an id.
const stickerId=id();r=await chat({action:'send',id:stickerId,sticker:'bisou'});assert.equal(r.status,200);assert.equal(records.at(-1).text,'💞 Sticker « bisou ! »');
assert.equal((await chat({action:'send',id:stickerId,sticker:'calin'})).status,200);assert.equal(household.chatCards[stickerId].ref,'bisou','A retry never rewrites a sent sticker');
let msg=(await read()).find(x=>x.id===stickerId);assert.equal(msg.sticker,'bisou');assert.equal(msg.card,undefined);assert.equal(msg.editable_until,null);
member=1;assert.equal((await chat({action:'send',id:stickerId,sticker:'merci'})).status,403,'The partner cannot reuse a message id');
msg=(await read()).find(x=>x.id===stickerId);assert.equal(msg.sticker,'bisou','The partner receives the sticker');
const shoppingMessage=records[0].id;assert.equal((await read()).find(x=>x.id===shoppingMessage).card.kind,'shopping','The partner receives the card');
// Deleting for me hides the card for this account only; deleting for both forgets the snapshot.
assert.equal((await chat({action:'delete',id:shoppingMessage,scope:'me'})).status,200);assert.equal((await read()).find(x=>x.id===shoppingMessage).card,undefined);
member=0;assert((await read()).find(x=>x.id===shoppingMessage).card,'Still visible to the author');
assert.equal((await chat({action:'delete',id:shoppingMessage,scope:'everyone',version:1})).status,200);assert.equal((await read()).find(x=>x.id===shoppingMessage).card,undefined);assert.equal(household.chatCards[shoppingMessage],undefined);
member=1;const partnerSticker=id();assert.equal((await chat({action:'send',id:partnerSticker,sticker:'merci'})).status,200);
member=0;assert.equal((await chat({action:'clear',scope:'everyone'})).status,200);assert(Object.values(household.chatCards).every(c=>c.member===1),'Clearing removes only the actor’s snapshots');assert.equal(household.chatCards[partnerSticker].ref,'merci');
console.log('PASS: couple stickers as typed payloads, idempotent retries, id ownership, delete for me/everyone and own-only clear forget card snapshots.');

// Pure helpers: bounded storage and visibility rules.
const helpers=await build({entryPoints:['supabase/functions/house-api/chat-cards.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins});
const cards=await import('data:text/javascript;base64,'+Buffer.from(helpers.outputFiles[0].text).toString('base64'));
const s={};for(let i=0;i<230;i++)cards.storeChatCard(s,'c'+i,{member:i%2,kind:'task',ref:'x',data:{},at:new Date(1e12+i*1000).toISOString()});for(let i=0;i<10;i++)cards.storeChatCard(s,'s'+i,{member:0,kind:'sticker',ref:'bisou',at:new Date(1e12+i).toISOString()});
assert.equal(Object.keys(s.chatCards).length,210);assert(!s.chatCards.c0&&s.chatCards.c229&&s.chatCards.s0,'Oldest cards are dropped first; stickers have their own budget');
assert.throws(()=>cards.storeChatCard(s,'c229',{member:0,kind:'task',ref:'y',data:{},at:new Date().toISOString()}),/moitié/);
const shown=cards.attachChatCards([{id:'c228',member:0,deleted:null,editable_until:'x'},{id:'c229',member:0},{id:'c227',member:1,deleted:'me'}],s.chatCards);
assert.equal(shown[0].card.kind,'task');assert.equal(shown[0].editable_until,null);assert.equal(shown[1].card,undefined,'A record never attaches to another author’s message');assert.equal(shown[2].card,undefined);
// Client and server share the same sticker catalogue; each sticker renders with French alt text.
const ui=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup as render} from 'react-dom/server';import {CoupleSticker,coupleStickers} from './app/couple-stickers';import {EmojiPicker} from './app/chat-emoji';import {HouseCardMessage} from './app/chat-house-cards';
const h=React.createElement,noop=()=>{};export const ids=coupleStickers.map(s=>s.id);export const stickers=coupleStickers.map(s=>render(h(CoupleSticker,{id:s.id})));export const picker=render(h(EmojiPicker,{onChoose:noop,onClose:noop,onSticker:noop,initialTab:'stickers'}));export const plain=render(h(EmojiPicker,{onChoose:noop,onClose:noop}));
export const cards=[['plant',{name:'Fifi',species:'Monstera',mood:'thirsty',due:['water'],overdue:2,waterDue:'2026-10-17'}],['shopping',{weekStart:'2026-10-19',toBuy:14,bought:2,items:[{title:'Lait',quantity:'2 L'}]}],['expense',{title:'Restaurant',cents:4250,payer:1,category:'Sorties',date:'2026-10-19',kind:'expense'}],['task',{title:'Poubelles',assignee:-1,due:'',done:false,priority:0}],['appointment',{title:'Dîner',date:'2026-10-24',time:'20:00',location:'Lyon'}],['recipe',{title:'Chakchouka',minutes:25}],['menu',{weekStart:'2026-10-19',slots:[{day:0,meal:'dinner',title:'Chakchouka'}]}]].map(([kind,data])=>render(h(HouseCardMessage,{card:{kind,ref:'r',data,note:'Regarde !'},names:['Alex','Camille'],onOpen:noop})));`,loader:'tsx',resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',packages:'external',jsx:'automatic',write:false});
const mod={exports:{}};new Function('require','module','exports',ui.outputFiles[0].text)(require,mod,mod.exports);const v=mod.exports;
assert.deepEqual(v.ids,[...cards.chatStickerIds],'Client and server sticker ids match');assert(v.ids.length>=16);
for(const html of v.stickers){assert(/role="img" aria-label="Sticker Nous deux : [^"]+\. [A-ZÉ][^"]+\."/.test(html),html.slice(0,200));assert(html.includes('aria-hidden="true"'));assert(!html.includes('NaN'));}
assert(v.picker.includes('Nos stickers'));assert(v.picker.includes('aria-pressed="true">Nos stickers'));assert.equal((v.picker.match(/Envoyer le sticker/g)||[]).length,v.ids.length);assert(!v.plain.includes('Nos stickers'),'Stickers are hidden while editing a message');
const [plant,shopping,expense,task,appointment,recipe,menu]=v.cards;
assert(plant.includes('a soif !')&&plant.includes('Voir le jardin')&&plant.includes('« Regarde ! »'));assert(shopping.includes('14 articles')&&shopping.includes('+ 13 autres')&&shopping.includes('Ouvrir les courses'));
assert(expense.includes('42,50')&&expense.includes('Payé par Camille'));assert(task.includes('L’un de nous')&&task.includes('Voir nos missions'));assert(appointment.includes('Voir dans l’agenda')&&appointment.includes('20:00'));assert(recipe.includes('25 min'));assert(menu.includes('soir'));
for(const html of v.cards){assert(!html.includes('NaN'));assert(!html.includes('undefined'));}
console.log('PASS: bounded card storage, author-bound attachment, shared sticker catalogue with French alt text, picker tabs and pastel cards with open buttons.');
