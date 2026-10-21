import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
// The scheduler route with fixtures only: no database, no push service, no real notification.
const bundle=await build({entryPoints:['supabase/functions/house-api/index.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'test-dependencies',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));b.onResolve({filter:/^npm:@block65/},()=>({path:'push',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export async function buildPushPayload(m,sub){return {method:"POST",headers:{},body:m.data};}'}));}}]});
globalThis.Deno={env:{get:n=>n==='SUPABASE_URL'?'https://db.test':n==='SUPABASE_SERVICE_ROLE_KEY'?'test-service-key':undefined},serve:()=>{}};
const RealDate=Date;let fixed=RealDate.parse('2026-10-21T17:00:00Z');
globalThis.Date=class extends RealDate{constructor(...a){super(...(a.length?a:[fixed]));}static now(){return fixed;}};
const credential='c'.repeat(64),sub=id=>({endpoint:'https://web.push.apple.com/'+id,keys:{p256dh:'x',auth:'y'}});
const d0={deviceId:crypto.randomUUID(),member:0,preferences:{},subscription:sub('alex')},d1={deviceId:crypto.randomUUID(),member:1,preferences:{},subscription:sub('camille')};
let row={version:1,data:{household:{first:'Alex',second:'Camille',version:1},items:[{id:'t',kind:'task',title:'Appeler le plombier',assignee:0,due:'2026-10-22',done:false}],entries:[],activity:[],devices:[d0,d1],sequence:0,
 appointments:[{id:crypto.randomUUID(),title:'Dentiste',category:'medical',person:0,owner:0,visibility:'shared',status:'scheduled',date:'2026-10-22',time:'10:00',recurrence:'none'},{id:crypto.randomUUID(),title:'Secret de Camille',category:'personal',person:1,owner:1,visibility:'private',status:'scheduled',date:'2026-10-22',time:'',recurrence:'none'}]}};
let pushes=[],failing=new Set(),writes=0;
globalThis.fetch=async(url,init={})=>{
 const u=new URL(url);
 if(u.hostname==='web.push.apple.com'){pushes.push({to:u.pathname.slice(1),...JSON.parse(init.body)});return new Response('',{status:failing.has(u.pathname.slice(1))?500:201});}
 assert.equal(u.hostname,'db.test','Unit tests never call real services');
 if(u.pathname.endsWith('/nd_config'))return Response.json([{data:{plantReminderHash:createHash('sha256').update(credential).digest('hex'),vapid:{publicKey:'p',privateKey:'k'}}}]);
 if(u.pathname.endsWith('rpc/nd_openai_key_get'))return Response.json(null);
 if(u.pathname.endsWith('/nd_sessions'))return Response.json([{token_hash:'h',member:0}]);
 if(u.pathname.endsWith('/nd_state')&&(init.method||'GET')==='GET')return Response.json([structuredClone(row)]);
 if(u.pathname.endsWith('/nd_state')&&init.method==='PATCH'){if(u.searchParams.get('version')!=='eq.'+row.version)return Response.json([]);row=JSON.parse(init.body);writes++;return Response.json([row]);}
 throw new Error('Unexpected request '+u.pathname);
};
const {handler}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const run=async(iso,key=credential)=>{fixed=RealDate.parse(iso);const r=await handler(new Request('https://edge.test/?route=plant-reminders',{method:'POST',headers:{'Content-Type':'application/json','x-plant-reminder':key},body:'{}'}));return {status:r.status,body:await r.json()};};
assert.equal((await run('2026-10-21T17:00:00Z','d'.repeat(64))).status,401,'scheduler secret required');
// 18:00 in Paris: nothing due, nothing written.
assert.deepEqual((await run('2026-10-21T16:00:00Z')).body,{ok:true,skipped:true});assert.equal(writes,0);assert.equal(pushes.length,0);
// 19:00: the eve reminder; Camille's phone fails and gets it again at 19:30, Alex does not.
failing.add('camille');
assert.deepEqual((await run('2026-10-21T17:00:00Z')).body,{ok:true,attempted:2,sent:1});
const alex=pushes.find(p=>p.to==='alex');assert.equal(alex.title,'📅 Demain dans notre agenda');assert.equal(alex.body,'Demain à 10 h : Dentiste');assert.equal(alex.url,'/Nous-deux/?view=calendar');
assert(!pushes.some(p=>p.to==='alex'&&p.body.includes('Secret')),'never a private event of the partner');
failing.clear();pushes=[];
assert.deepEqual((await run('2026-10-21T17:30:00Z')).body,{ok:true,attempted:1,sent:1});assert.deepEqual(pushes.map(p=>[p.to,p.body]),[['camille','Demain, 2 rendez-vous :\nSecret de Camille\n10 h · Dentiste (Alex)']]);
pushes=[];assert.deepEqual((await run('2026-10-21T17:30:00Z')).body,{ok:true,skipped:true},'no duplicate');
// 08:00: agenda and missions, separate notifications; missions open the missions page.
await run('2026-10-22T06:00:00Z');const missions=pushes.find(p=>p.title==='✅ Les missions du jour');assert.equal(missions.to,'alex');assert.equal(missions.body,'Aujourd’hui : Appeler le plombier');assert.equal(missions.url,'/Nous-deux/?view=tasks');
assert.equal(pushes.filter(p=>p.title==='☀️ Aujourd’hui dans notre agenda').length,2);
// 09:00: one hour before the dentist, for both; the plant reminders of 09:00 still run in the same call.
pushes=[];await run('2026-10-22T07:00:00Z');assert.deepEqual(pushes.map(p=>p.body).sort(),['Dans 1 h · 10 h · Dentiste','Dans 1 h · 10 h · Dentiste (Alex)']);
assert(row.data.plantReminderDays,'plant reminders still claimed at 09:00');
// Partner pushes stay sober: adding an article rings nobody, « J'ai fini la liste » rings the partner once.
fixed=RealDate.parse('2026-10-21T10:00:00Z');pushes=[];
const house=payload=>handler(new Request('https://edge.test/?route=household',{method:'POST',headers:{'Content-Type':'application/json','x-house-session':'a'.repeat(64)},body:JSON.stringify(payload)}));
assert.equal((await house({action:'item',payload:{id:crypto.randomUUID(),kind:'shopping',title:'Pain',quantity:'',assignee:-1,due:'',priority:0,done:false,weekStart:'2026-10-19',version:0}})).status,200);assert.equal(pushes.length,0,'no push per article');
assert.equal((await house({action:'shopping-finished',payload:{weekStart:'2026-10-19'}})).status,200);
assert.deepEqual(pushes.map(p=>[p.to,p.title,p.body,p.url]),[['camille','🛒 La liste de courses est prête','Alex a fini la liste de courses : 1 article à acheter.','/Nous-deux/?view=shopping']]);
assert.equal((await house({action:'shopping-finished',payload:{weekStart:'2026-10-19'}})).status,429);assert.equal(pushes.length,1);
console.log('PASS: scheduler route sends eve, morning, mission and 1-hour reminders through the existing plant-reminders cron, skips writes when idle, retries failed pushes only and never duplicates; one partner push for « J’ai fini la liste », none per article.');
