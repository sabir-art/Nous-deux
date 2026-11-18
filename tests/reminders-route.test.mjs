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
let pushes=[],failing=new Set(),writes=0,answers={},rateHits=0,headersSeen=[];
globalThis.fetch=async(url,init={})=>{
 const u=new URL(url);
 if(u.hostname==='web.push.apple.com'||u.hostname==='fcm.googleapis.com'){const to=u.pathname.split('/').pop();headersSeen.push(init.headers);pushes.push({to,...JSON.parse(init.body)});const a=answers[to];return a?new Response(a.body||'',{status:a.status}):new Response('',{status:failing.has(to)?500:201});}
 if(u.pathname.endsWith('rpc/nd_rate_hit'))return Response.json(++rateHits);
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

// Plants now at 08:00 by default (no longer 09:00): a due plant is reminded in the 08:00 run.
row.data.plants=[{id:'p',owner:0,remindBoth:false,reminders:true,waterEvery:3,lightEvery:0,feedEvery:0,lastWater:'2026-10-01',lastLight:'2026-10-01',lastFeed:'2026-10-01'}];row.data.plantReminderDays={};
pushes=[];await run('2026-10-23T06:00:00Z');assert.deepEqual(pushes.filter(p=>p.category==='plants').map(p=>p.to),['alex'],'plants at 08:00');
pushes=[];await run('2026-10-23T07:00:00Z');assert.equal(pushes.filter(p=>p.category==='plants').length,0,'not again at 09:00');
assert.equal(headersSeen.some(h=>Object.keys(h).some(k=>k.toLowerCase()==='content-length')),false,'Content-Length left to the runtime');

// « Mes heures de rappel » through the notifications route: own times only, validated.
const notif=(payload,route='notifications')=>handler(new Request('https://edge.test/?route='+route,{method:'POST',headers:{'Content-Type':'application/json','x-house-session':'a'.repeat(64)},body:JSON.stringify(payload)}));
const times={eve:'20:00',morning:'07:00',soon:30,plants:'19:30',pets:'08:30'};
let r=await notif({action:'reminder-times',times});assert.equal(r.status,200);assert.deepEqual((await r.json()).times,times);assert.deepEqual(row.data.reminderTimes,{0:times},'stored for the signed-in person only');
assert.equal((await notif({action:'reminder-times',times:{...times,eve:'20:10'}})).status,400);assert.deepEqual(row.data.reminderTimes[0],times);
const get=await handler(new Request('https://edge.test/?route=notifications&device='+d0.deviceId,{headers:{'x-house-session':'a'.repeat(64)}}));const info=await get.json();
assert.deepEqual(info.times,times);assert.equal(info.enabled,true);assert.equal(info.devices,1);assert.equal(info.subscription.service,'apple');assert.match(info.subscription.hash,/^[a-f0-9]{16}$/);assert(!JSON.stringify(info).includes('web.push.apple.com/alex'),'never the push address itself');
assert.deepEqual(info.subscription.hash,createHash('sha256').update(d0.subscription.endpoint).digest('hex').slice(0,16),'same fingerprint as the browser computes');

// « M'envoyer une notification d'essai »: only the signed-in person's devices, readable result, 5 per hour.
const extra={deviceId:crypto.randomUUID(),member:0,preferences:{},subscription:{endpoint:'https://fcm.googleapis.com/fcm/send/alexpixel',keys:{p256dh:'x',auth:'y'}}};
const dead={deviceId:crypto.randomUUID(),member:0,preferences:{},subscription:{endpoint:'https://web.push.apple.com/alexold',keys:{p256dh:'x',auth:'y'}}};
row.data.devices.push(extra,dead,{...d0,deviceId:crypto.randomUUID()});
answers={alexpixel:{status:403,body:'{"reason":"BadJwtToken"}'},alexold:{status:410}};pushes=[];
r=await notif({deviceId:d0.deviceId},'notification-test');assert.equal(r.status,200);const test=await r.json();
assert.equal(test.devices,3,'a duplicated push address counts once');assert.equal(test.sent,1);
assert.deepEqual(pushes.map(p=>p.to).sort(),['alex','alexold','alexpixel'],'never the partner');
assert(pushes.every(p=>p.url==='/Nous-deux/?view=notifications'&&p.title==='🔔 Essai réussi'));
assert.deepEqual(test.results.map(x=>[x.service,x.ok,x.status,x.removed,x.reason||'',x.current]).sort(),[['apple',false,410,true,'',false],['apple',true,201,false,'',true],['google',false,403,false,'BadJwtToken',false]].sort());
assert(!row.data.devices.some(d=>d.deviceId===dead.deviceId),'expired subscription removed');assert(row.data.devices.some(d=>d.deviceId===extra.deviceId),'refused one kept for diagnosis');
answers={};
for(let i=0;i<4;i++)assert.equal((await notif({deviceId:d0.deviceId},'notification-test')).status,200);
r=await notif({deviceId:d0.deviceId},'notification-test');assert.equal(r.status,429);assert.match((await r.json()).error,/Cinq essais par heure/);
assert.equal((await handler(new Request('https://edge.test/?route=notification-test',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}))).status,401,'session required');

// Opening the app hands back the subscription: unchanged → no write; renewed address → updated in place.
const w0=writes;r=await notif({action:'refresh',deviceId:d0.deviceId,subscription:{endpoint:d0.subscription.endpoint,keys:{p256dh:'A'.repeat(87),auth:'B'.repeat(22)}}});assert.equal(r.status,200);
r=await notif({action:'refresh',deviceId:d0.deviceId,subscription:{endpoint:'https://web.push.apple.com/alexnew',keys:{p256dh:'A'.repeat(87),auth:'B'.repeat(22)}}});assert.deepEqual(await r.json(),{ok:true,enabled:true});
assert.equal(row.data.devices.find(d=>d.deviceId===d0.deviceId).subscription.endpoint,'https://web.push.apple.com/alexnew');assert(writes>w0);
const w1=writes;r=await notif({action:'refresh',deviceId:d0.deviceId,subscription:{endpoint:'https://web.push.apple.com/alexnew',keys:{p256dh:'A'.repeat(87),auth:'B'.repeat(22)}}});assert.equal(writes,w1,'nothing new: no write');
console.log('PASS: scheduler route sends eve, morning, mission and 1-hour reminders through the existing plant-reminders cron, skips writes when idle, retries failed pushes only and never duplicates; one partner push for « J’ai fini la liste », none per article; plants at 08:00; own reminder times; test notification to own devices only with readable results, expired subscription removed, 5 per hour; subscription refresh without needless writes.');
