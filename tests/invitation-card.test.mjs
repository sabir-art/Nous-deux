// Invitation shared in the chat: typed reference checked by house-api, minimal snapshot, no leak, envelope rendering.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,realpathSync} from 'node:fs';
const require=createRequire(import.meta.url),{build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const plugins=[{name:'test-dependencies',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));b.onResolve({filter:/^npm:@block65/},()=>({path:'push',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export function buildPushPayload(){throw Error("No pushes permitted in tests")}'}));}}];
const bundle=await build({entryPoints:['supabase/functions/house-api/index.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins});
globalThis.Deno={env:{get:n=>n==='SUPABASE_URL'?'https://db.test':n==='SUPABASE_SERVICE_ROLE_KEY'?'test-service-key':undefined},serve:()=>{}};
const id=()=>crypto.randomUUID();
const ids={dinner:id(),declined:id(),secretTheirs:id(),secretMine:id(),hidden:id()};
const idea=(extra)=>({title:'Un resto italien',category:'restaurant',description:'Cette petite trattoria dont on parle depuis des mois',date:'2026-10-24',time:'20:00',location:'Table en terrasse',place:{name:'Da Mario',address:'12 rue des Lilas, Lyon'},version:1,status:'pending',responseNote:'',createdAt:'2026-10-19T10:00:00.000Z',...extra});
const household={household:{first:'Alex',second:'Camille',version:1},devices:[],activity:[],sequence:0,items:[],entries:[],appointments:[],
 ideas:[idea({id:ids.dinner,owner:0}),idea({id:ids.declined,owner:1,title:'Balade en forêt',category:'outing',date:'',time:'',status:'declined',responseNote:'pas ce week-end'}),
  idea({id:ids.secretTheirs,owner:1,title:'Week-end surprise à Rome',category:'surprise',secret:true}),idea({id:ids.secretMine,owner:0,title:'Bague cachée',category:'surprise',private:true}),idea({id:ids.hidden,owner:1,title:'Idée privée',visibility:'private'})]};
const records=[];let member=0,stateVersion=1;
globalThis.fetch=async(url,init={})=>{const u=new URL(url);assert.equal(u.hostname,'db.test','Unit tests never call real services');const method=init.method||'GET';
 if(u.pathname.endsWith('nd_sessions'))return Response.json([{member}]);
 if(u.pathname.endsWith('rpc/nd_openai_key_get'))return Response.json(null);
 if(u.pathname.endsWith('nd_state')){
  if(method==='PATCH'){if(u.searchParams.get('version')!=='eq.'+stateVersion)return Response.json([]);const p=JSON.parse(init.body);Object.assign(household,structuredClone(p.data));stateVersion=p.version;return Response.json([{version:stateVersion}]);}
  if(u.searchParams.get('select')==='chatCards:data->chatCards')return Response.json([{chatCards:household.chatCards??null}]);
  return Response.json([{version:stateVersion,data:structuredClone(household)}]);
 }
 if(u.pathname.endsWith('rpc/nd_chat_read')){const p=JSON.parse(init.body);return Response.json({messages:records.map(r=>({id:r.id,member:r.member,text:r.text,deleted:null,version:r.version,created_at:r.created_at,edited_at:null,editable_until:r.member===p.p_actor?new Date(Date.now()+60000).toISOString():null})),hasMore:false});}
 if(u.pathname.endsWith('nd_messages')){const mid=u.searchParams.get('id')?.slice(3);if(method==='GET')return Response.json(mid?records.filter(r=>r.id===mid):[]);const p=JSON.parse(init.body);if(records.some(r=>r.id===p.id))return Response.json([]);const row={...p,created_at:new Date().toISOString(),version:1};records.push(row);return Response.json([row]);}
 throw Error('Unexpected request '+u.pathname);
};
const {handler}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const chat=async(payload)=>{const r=await handler(new Request('https://edge.test/?route=chat',{method:payload?'POST':'GET',headers:{Origin:'https://sabir-art.github.io','Content-Type':'application/json','x-house-session':'a'.repeat(64)},...(payload?{body:JSON.stringify(payload)}:{})}));return {status:r.status,body:await r.json()};};
const send=(extra)=>chat({action:'send',id:id(),...extra});

// The partner shares Alex's invitation: the server rereads the idea and keeps only what the envelope shows.
member=1;let r=await send({card:{kind:'invitation',id:ids.dinner},text:'On y va vendredi ?',member:0});assert.equal(r.status,200,JSON.stringify(r.body));
let m=records.at(-1);assert.equal(m.member,1,'Author comes from the session, never from the payload');
assert.equal(m.text,'💌 Invitation : Un resto italien · 24 oct.\nOn y va vendredi ?');
let card=household.chatCards[m.id];assert.equal(card.kind,'invitation');assert.equal(card.ref,ids.dinner);
assert.deepEqual(card.data,{title:'Un resto italien',category:'restaurant',owner:0,date:'2026-10-24',time:'20:00',status:'pending'});
for(const secret of ['trattoria','Terrasse','terrasse','Da Mario','Lilas'])assert(!JSON.stringify(card).includes(secret),'Description, location and place stay out of the snapshot: '+secret);
member=0;const seen=(await chat()).body.messages.find(x=>x.id===m.id);assert.equal(seen.card.kind,'invitation');assert.equal(seen.card.note,'On y va vendredi ?');assert.equal(seen.editable_until,null,'An invitation card is not editable');
assert.equal((await chat({action:'edit',id:m.id,text:'Autre',version:1})).status,400);
// Undated or declined invitations travel too, without inventing a date or the response note.
r=await send({card:{kind:'invitation',id:ids.declined}});assert.equal(r.status,200);card=household.chatCards[records.at(-1).id];
assert.deepEqual(card.data,{title:'Balade en forêt',category:'outing',owner:1,date:'',time:'',status:'declined'});assert(!JSON.stringify(card).includes('week-end'));assert.equal(records.at(-1).text,'💌 Invitation : Balade en forêt');
console.log('PASS: invitation cards are validated by house-api with the sender’s rights and keep a minimal snapshot.');

// Missing, malformed or secret ideas are refused before anything is stored.
const before=JSON.stringify(household.chatCards),count=records.length;
assert.equal((await send({card:{kind:'invitation',id:id()}})).status,404,'An unknown idea is refused');
assert.equal((await send({card:{kind:'invitation',id:ids.secretTheirs}})).status,404,'The partner’s secret idea is indistinguishable from a missing one');
assert.equal((await send({card:{kind:'invitation',id:ids.hidden}})).status,404,'A private idea of the partner stays invisible');
assert.equal((await send({card:{kind:'invitation',id:ids.secretMine}})).status,403,'Even its author cannot post a secret idea in the chat');
for(const bad of [{card:{kind:'invitation'}},{card:{kind:'invitation',id:'pas-un-uuid'}},{card:{kind:'invitation',id:ids.dinner,title:'Faux titre'}},{card:{kind:'invitation',id:ids.dinner,owner:1}},{card:{kind:'invitation',id:ids.dinner},text:'x'.repeat(281)}])assert.equal((await send(bad)).status,400,JSON.stringify(bad));
assert.equal(JSON.stringify(household.chatCards),before);assert.equal(records.length,count);
assert(!records.some(x=>/Rome|Bague|Idée privée/.test(x.text)));assert(!JSON.stringify(household.chatCards).match(/Rome|Bague|Idée privée/));
// A deleted idea can no longer be shared.
household.ideas=household.ideas.filter(i=>i.id!==ids.declined);assert.equal((await send({card:{kind:'invitation',id:ids.declined}})).status,404);
console.log('PASS: unknown, malformed, deleted and secret ideas are refused without state changes or leaks.');

// Client: the envelope card, sealed for the partner until discovered, open for its sender, with a button to the idea.
const ui=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup as render} from 'react-dom/server';import {HouseCardMessage,shareChoices,openTarget} from './app/chat-house-cards';import {InvitationEnvelope,letterDate} from './app/invitation-envelope';
const h=React.createElement,noop=()=>{},card={kind:'invitation',ref:'${ids.dinner}',data:{title:'Un resto italien',category:'restaurant',owner:0,date:'2026-10-24',time:'20:00',status:'pending'},note:'On y va ?'};
export const mine=render(h(HouseCardMessage,{card,names:['Alex','Camille'],onOpen:noop,mine:true,messageId:'m1'}));
export const theirs=render(h(HouseCardMessage,{card,names:['Alex','Camille'],onOpen:noop,mine:false,messageId:'m2'}));
export const odd=render(h(HouseCardMessage,{card:{kind:'invitation',ref:'x',data:{}},names:['Alex','Camille'],mine:true,messageId:'m3'}));
export const modes=['open','closed','opening','closing'].map(mode=>render(h(InvitationEnvelope,{invite:card.data,names:['Alex','Camille'],mode})));
export const kinds=shareChoices.map(c=>c.kind);export const target=openTarget(card);export const undated=letterDate('');`,loader:'tsx',resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',packages:'external',jsx:'automatic',write:false});
const mod={exports:{}};new Function('require','module','exports',ui.outputFiles[0].text)(require,mod,mod.exports);const v=mod.exports;
assert(v.kinds.includes('invitation'),'The share picker offers an invitation');assert.deepEqual(v.target,{page:'ideas',ideaId:ids.dinner});
assert(v.mine.includes('Ouvrir l’invitation')&&v.mine.includes('Un resto italien')&&v.mine.includes('Alex vous invite')&&v.mine.includes('Pour Camille')&&v.mine.includes('« On y va ? »'));
assert(v.mine.includes('inv-env is-open'),'The sender sees the letter already out');
assert(v.theirs.includes('inv-env is-closed')&&v.theirs.includes('aria-label="Ouvrir l’enveloppe d’Alex"'),'The partner first gets a sealed envelope');assert(!v.theirs.includes('« On y va ? »'),'The note waits for the opening');
for(const html of [v.mine,v.theirs,v.odd,...v.modes]){assert(!html.includes('NaN'));assert(!html.includes('undefined'));}
assert(v.modes[0].includes('role="img"')&&v.modes[0].includes('aria-label="Invitation de Alex : Un resto italien'));assert.equal(v.undated,'Date à décider ensemble');
// Animations: short and switched off when the system asks for less motion.
const css=readFileSync('app/invitation-envelope.css','utf8');
for(const [,s] of css.matchAll(/animation:[^;}]*?(\d+(?:\.\d+)?)s/g))assert(Number(s)<2,'Animations last less than 2 s');
assert(/@media\(prefers-reduced-motion:reduce\)\{\.inv-env \*,\.inv-env-body,\.inv-sent\{animation:none!important\}/.test(css));
assert(!/dashed|dotted/.test(css),'No dashed lines on the new envelope');
assert(readFileSync('web/main.tsx','utf8').includes("import '../app/invitation-envelope.css';"));
console.log('PASS: envelope card sealed for the partner, open for the sender, open-idea button, accessible label and short reduced-motion-safe animations.');
