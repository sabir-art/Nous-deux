import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
import {createHash,generateKeyPairSync,verify} from 'node:crypto';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
// Android notifications (FCM HTTP v1) with fixtures only: a service account generated for this test, a fake Google
// token endpoint and a fake FCM. No database, no real push, no real notification.
const plugins=[{name:'test-dependencies',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));b.onResolve({filter:/^npm:@block65/},()=>({path:'push',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export async function buildPushPayload(m,sub){return {method:"POST",headers:{},body:m.data};}'}));}}];
const load=async entry=>{const out=await build({entryPoints:[entry],bundle:true,platform:'node',format:'esm',write:false,plugins});return import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'));};

const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const account={type:'service_account',project_id:'nous-deux-test',client_email:'push@nous-deux-test.iam.gserviceaccount.com',private_key:privateKey.export({type:'pkcs8',format:'pem'})};
let env={SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'test-service-key',FCM_SERVICE_ACCOUNT:JSON.stringify(account)};
globalThis.Deno={env:{get:n=>env[n]},serve:()=>{}};
const RealDate=Date;let fixed=RealDate.parse('2026-10-21T10:00:00Z');
globalThis.Date=class extends RealDate{constructor(...a){super(...(a.length?a:[fixed]));}static now(){return fixed;}};

// Pure part: the FCM message mirrors the Web Push one (title, body, page, call, lifetime) and picks the channel.
const fcm=await load('supabase/functions/house-api/fcm.ts');
assert.equal(fcm.serviceAccount(undefined),null);assert.equal(fcm.serviceAccount('{"project_id":"x"}'),null,'incomplete account refused');
assert.deepEqual(fcm.serviceAccount(JSON.stringify(account)),{project_id:account.project_id,client_email:account.client_email,private_key:account.private_key});
const call=fcm.fcmMessage('tok',{title:'Alex vous appelle',body:'Ouvrez Nous deux pour répondre.',category:'calls',callId:'0b5c8b3e-8a6f-4c0a-9a43-3f6f6f0f1a2b',expiresAt:1761040890000,tag:'nousdeux-call-x',icon:'https://db.test/photo'}).message;
assert.equal(call.android.notification.channel_id,'appels');assert.equal(call.android.ttl,'90s');assert.equal(call.android.priority,'HIGH');
assert.deepEqual(call.data,{view:'calls',category:'calls',callId:'0b5c8b3e-8a6f-4c0a-9a43-3f6f6f0f1a2b',expiresAt:'1761040890000'});assert.equal(call.android.notification.tag,'nousdeux-call-x');
assert(Object.values(call.data).every(v=>typeof v==='string'),'FCM data values are strings');
assert.equal(fcm.fcmMessage('tok',{category:'chat',title:'Alex',body:'💬 Un nouveau message'}).message.android.notification.channel_id,'messages');
assert.equal(fcm.fcmMessage('tok',{category:'reminders',view:'calendar'}).message.android.notification.channel_id,'rappels');
assert.equal(fcm.fcmMessage('tok',{category:'plants'}).message.android.notification.channel_id,'rappels');
const test=fcm.fcmMessage('tok',{title:'🔔 Essai réussi',category:'test',view:'notifications'}).message;assert.equal(test.data.view,'notifications');assert.equal(test.android.ttl,'600s');
assert.deepEqual(fcm.fcmMessage('tok',{}).message.notification,{title:'Nous deux',body:'Une nouveauté dans votre maison.'});

// The whole API with fixtures.
const credential='c'.repeat(64),token=name=>('fcmtoken-'+name+':APA91b').padEnd(140,'x');
const sub=id=>({endpoint:'https://web.push.apple.com/'+id,keys:{p256dh:'x',auth:'y'}});
const web0={deviceId:crypto.randomUUID(),member:0,preferences:{},subscription:sub('alexweb')};
const app0={deviceId:crypto.randomUUID(),member:0,preferences:{},fcm:{token:token('alex')}};
const app1={deviceId:crypto.randomUUID(),member:1,preferences:{},fcm:{token:token('camille')}};
const quiet1={deviceId:crypto.randomUUID(),member:1,preferences:{reminders:false},fcm:{token:token('camillequiet')}};
let row={version:1,data:{household:{first:'Alex',second:'Camille',version:1},items:[],entries:[],activity:[],devices:[web0,app0,app1,quiet1],sequence:0,
 appointments:[{id:crypto.randomUUID(),title:'Dentiste',category:'medical',person:0,owner:0,visibility:'shared',status:'scheduled',date:'2026-10-22',time:'10:00',recurrence:'none'},
  {id:crypto.randomUUID(),title:'Secret de Camille',category:'personal',person:1,owner:1,visibility:'private',status:'scheduled',date:'2026-10-22',time:'',recurrence:'none'}]}};
let fcmSent=[],webSent=[],tokenCalls=0,fcmAnswers={},writes=0,rateHits=0,tokenAnswer=null;
const b64=s=>Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/'),'base64');
globalThis.fetch=async(url,init={})=>{
 const u=new URL(url);
 if(u.hostname==='oauth2.googleapis.com'){
  tokenCalls++;if(tokenAnswer)return new Response('{"error":"invalid_grant"}',{status:tokenAnswer});
  const form=new URLSearchParams(init.body);assert.equal(form.get('grant_type'),'urn:ietf:params:oauth:grant-type:jwt-bearer');
  const [h,c,s]=form.get('assertion').split('.');assert(verify('RSA-SHA256',Buffer.from(h+'.'+c),publicKey,b64(s)),'assertion signed with the service account key');
  const claims=JSON.parse(b64(c).toString());assert.equal(claims.iss,account.client_email);assert.equal(claims.scope,'https://www.googleapis.com/auth/firebase.messaging');assert.equal(claims.aud,'https://oauth2.googleapis.com/token');
  assert(!init.body.includes('PRIVATE'),'the private key itself never leaves');
  return Response.json({access_token:'test-access-'+tokenCalls,expires_in:3600});
 }
 if(u.hostname==='fcm.googleapis.com'){
  assert.equal(u.pathname,'/v1/projects/nous-deux-test/messages:send');assert.match(init.headers.Authorization,/^Bearer test-access-\d+$/);
  const m=JSON.parse(init.body).message;fcmSent.push(m);const a=fcmAnswers[m.token];
  return a?new Response(a.body||'',{status:a.status}):Response.json({name:'projects/nous-deux-test/messages/1'});
 }
 if(u.hostname==='web.push.apple.com'){webSent.push({to:u.pathname.slice(1),...JSON.parse(init.body)});return new Response(null,{status:201});}
 if(u.pathname.endsWith('rpc/nd_rate_hit'))return Response.json(++rateHits);
 assert.equal(u.hostname,'db.test','Unit tests never call real services');
 if(u.pathname.endsWith('/nd_config'))return Response.json([{data:{plantReminderHash:createHash('sha256').update(credential).digest('hex'),vapid:{publicKey:'p',privateKey:'k'}}}]);
 if(u.pathname.endsWith('rpc/nd_openai_key_get'))return Response.json(null);
 if(u.pathname.endsWith('/nd_sessions'))return Response.json([{token_hash:'h',member:0}]);
 if(u.pathname.endsWith('/nd_state')&&(init.method||'GET')==='GET')return Response.json([structuredClone(row)]);
 if(u.pathname.endsWith('/nd_state')&&init.method==='PATCH'){if(u.searchParams.get('version')!=='eq.'+row.version)return Response.json([]);row=JSON.parse(init.body);writes++;return Response.json([row]);}
 throw new Error('Unexpected request '+u.pathname);
};
const {handler}=await load('supabase/functions/house-api/index.ts');
const session={'Content-Type':'application/json','x-house-session':'a'.repeat(64),origin:'https://localhost'};
const post=(route,payload)=>handler(new Request('https://edge.test/?route='+route,{method:'POST',headers:session,body:JSON.stringify(payload)}));
const devices=()=>row.data.devices;

// Registering the Android app: one record per token, never both kinds, a malformed token refused.
const phone=crypto.randomUUID(),prefs={shopping:true,tasks:true,expenses:true,calendar:true,calls:true,ideas:true,plants:true,chat:true,reminders:true,pets:true};
let r=await post('notifications',{action:'subscribe',deviceId:phone,member:0,preferences:prefs,fcm:{token:token('alexnew')}});assert.equal(r.status,200);assert.deepEqual(await r.json(),{ok:true,enabled:true});
assert.deepEqual(devices().find(d=>d.deviceId===phone),{deviceId:phone,member:0,preferences:prefs,fcm:{token:token('alexnew')}});
assert.equal((await post('notifications',{action:'subscribe',deviceId:crypto.randomUUID(),member:0,preferences:prefs,fcm:{token:'bad token!'}})).status,400);
assert.equal((await post('notifications',{action:'subscribe',deviceId:crypto.randomUUID(),member:0,preferences:prefs,fcm:{token:token('x')},subscription:sub('x')})).status,400,'one kind only');
const again=crypto.randomUUID();assert.equal((await post('notifications',{action:'subscribe',deviceId:again,member:0,preferences:prefs,fcm:{token:token('alexnew')}})).status,200);
assert.equal(devices().filter(d=>d.fcm?.token===token('alexnew')).length,1,'same token after a new login: one record');assert(!devices().some(d=>d.deviceId===phone));
// Opening the app hands back the token: unchanged → no write; renewed by Firebase → replaced in place.
let w=writes;assert.deepEqual(await (await post('notifications',{action:'refresh',deviceId:again,fcm:{token:token('alexnew')}})).json(),{ok:true,enabled:true});assert.equal(writes,w,'nothing new: no write');
assert.equal((await post('notifications',{action:'refresh',deviceId:again,fcm:{token:token('alexrenewed')}})).status,200);
assert.deepEqual(devices().find(d=>d.deviceId===again),{deviceId:again,member:0,preferences:prefs,fcm:{token:token('alexrenewed')}});assert.equal(devices().filter(d=>d.member===0&&d.fcm).length,2);
assert.deepEqual(await (await post('notifications',{action:'refresh',deviceId:crypto.randomUUID(),fcm:{token:token('unknown')}})).json(),{ok:true,enabled:false},'refresh never creates a device');
assert.equal((await post('notifications',{action:'preferences',deviceId:again,member:0,preferences:{...prefs,shopping:false}})).status,200);
// What « Vérifier mes notifications » learns: the app service and a fingerprint, never the token.
let info=await (await handler(new Request('https://edge.test/?route=notifications&device='+again,{headers:session}))).json();
assert.equal(info.subscription.service,'app');assert.equal(info.subscription.hash,createHash('sha256').update('fcm:'+token('alexrenewed')).digest('hex').slice(0,16));assert(!JSON.stringify(info).includes('fcmtoken'),'never the token itself');

// Partner notification: « J'ai fini la liste » reaches Camille's phones (both apps), never Alex's own devices.
assert.equal((await post('household',{action:'item',payload:{id:crypto.randomUUID(),kind:'shopping',title:'Pain',quantity:'',assignee:-1,due:'',priority:0,done:false,weekStart:'2026-10-19',version:0}})).status,200);
assert.equal(fcmSent.length+webSent.length,0,'no push per article');
assert.equal((await post('household',{action:'shopping-finished',payload:{weekStart:'2026-10-19'}})).status,200);
assert.deepEqual(fcmSent.map(m=>m.token).sort(),[token('camille'),token('camillequiet')].sort(),'the partner only');assert.equal(webSent.length,0);
const shop=fcmSent[0];assert.deepEqual(shop.notification,{title:'🛒 La liste de courses est prête',body:'Alex a fini la liste de courses : 1 article à acheter.'});
assert.deepEqual(shop.data,{view:'shopping',category:'shopping'});assert.equal(shop.android.notification.channel_id,'messages');assert.equal(shop.android.notification.tag,'nousdeux-shopping-finished');
assert.equal(tokenCalls,1,'one access token for both sends');

// Scheduler at 19:00 Paris: eve reminders to every device by the same rules, web and app alike;
// Camille's « reminders off » phone gets nothing; Alex never sees Camille's private event.
fcmSent=[];webSent=[];fixed=RealDate.parse('2026-10-21T17:00:00Z');
const run=async()=>{const res=await handler(new Request('https://edge.test/?route=plant-reminders',{method:'POST',headers:{'Content-Type':'application/json','x-plant-reminder':credential},body:'{}'}));return res.json();};
let sched=await run();assert.equal(sched.sent,sched.attempted);
const alexApp=fcmSent.filter(m=>m.token.startsWith('fcmtoken-alex'));assert.equal(alexApp.length,2,'both of Alex’s app devices');
assert(alexApp.every(m=>m.notification.title==='📅 Demain dans notre agenda'&&m.notification.body==='Demain à 10 h : Dentiste'&&m.data.view==='calendar'&&m.android.notification.channel_id==='rappels'));
assert.deepEqual(webSent.map(p=>[p.to,p.body,p.url]),[['alexweb','Demain à 10 h : Dentiste','/Nous-deux/?view=calendar']],'Web Push unchanged');
assert(![...fcmSent,...webSent].some(m=>JSON.stringify(m).includes('Secret')&&!JSON.stringify(m).includes('camille')),'never a private event of the partner');
assert.equal(fcmSent.filter(m=>m.token===token('camillequiet')).length,0,'device preference respected');
assert.equal(fcmSent.filter(m=>m.token===token('camille')).length,1);
fcmSent=[];webSent=[];assert.deepEqual(await run(),{ok:true,skipped:true},'no duplicate');assert.equal(fcmSent.length,0);
// A failed app push is retried at the next run, like a failed Web Push.
fcmSent=[];row.data.reminderLog={};fcmAnswers={[token('camille')]:{status:503}};fixed=RealDate.parse('2026-10-21T17:00:00Z');
await run();assert.equal(fcmSent.filter(m=>m.token===token('camille')).length,1);fcmAnswers={};fcmSent=[];fixed=RealDate.parse('2026-10-21T17:30:00Z');
await run();assert.equal(fcmSent.filter(m=>m.token===token('camille')).length,1,'retried after a failure');

// « M'envoyer une notification d'essai »: Alex's own devices only; a token FCM no longer knows is removed,
// a refused one is kept for diagnosis; the result names the Android app.
fixed=RealDate.parse('2026-10-21T10:00:00Z');fcmSent=[];webSent=[];
fcmAnswers={[token('alex')]:{status:404,body:JSON.stringify({error:{code:404,status:'NOT_FOUND',details:[{'@type':'type.googleapis.com/google.firebase.fcm.v1.FcmError',errorCode:'UNREGISTERED'}]}})}};
r=await post('notification-test',{deviceId:again});assert.equal(r.status,200);const res=await r.json();
assert.equal(res.devices,3);assert.equal(res.sent,2);assert(fcmSent.every(m=>m.token.startsWith('fcmtoken-alex'))&&webSent.every(p=>p.to==='alexweb'),'never the partner');
assert.deepEqual(res.results.map(x=>[x.service,x.ok,x.status,x.removed,x.reason||'',x.current]).sort(),[['app',false,404,true,'UNREGISTERED',false],['app',true,200,false,'',true],['apple',true,201,false,'',false]].sort());
assert(!devices().some(d=>d.deviceId===app0.deviceId),'unregistered token removed');assert(devices().some(d=>d.deviceId===app1.deviceId),'partner untouched');
assert(fcmSent.every(m=>m.data.view==='notifications'&&m.notification.title==='🔔 Essai réussi'&&m.android.notification.channel_id==='messages'));
fcmAnswers={[token('alexrenewed')]:{status:403,body:JSON.stringify({error:{status:'PERMISSION_DENIED'}})}};
r=await post('notification-test',{deviceId:again});const refused=(await r.json()).results.find(x=>x.service==='app');assert.deepEqual([refused.ok,refused.status,refused.removed,refused.reason],[false,403,false,'PERMISSION_DENIED']);assert(devices().some(d=>d.deviceId===again),'kept for diagnosis');
fcmAnswers={};
// Without the secret, or with Google refusing the account, the app push fails cleanly ('config') and web push still goes.
env={...env,FCM_SERVICE_ACCOUNT:undefined};fcmSent=[];webSent=[];
r=await post('notification-test',{deviceId:again});const noKey=await r.json();assert.equal(fcmSent.length,0);assert.equal(noKey.results.find(x=>x.service==='app').error,'config');assert.equal(webSent.length,1);
for(let i=0;i<2;i++)assert.equal((await post('notification-test',{deviceId:again})).status,200);
assert.equal((await post('notification-test',{deviceId:again})).status,429,'still five tests an hour');

// The site's devices are registered exactly as before.
const browser=crypto.randomUUID();assert.equal((await post('notifications',{action:'subscribe',deviceId:browser,member:0,preferences:prefs,subscription:{endpoint:'https://web.push.apple.com/alexsafari',keys:{p256dh:'A'.repeat(87),auth:'B'.repeat(22)}}})).status,200);
assert.deepEqual(Object.keys(devices().find(d=>d.deviceId===browser)),['deviceId','member','preferences','subscription']);
console.log('PASS: Android devices register their FCM token (one record per token, refresh, preferences, fingerprint only); every notification goes through FCM HTTP v1 with the same rules as Web Push (partner only, device preferences, no private event, no duplicate, retry on failure), the right channel and page; unregistered tokens are removed; a missing secret fails cleanly; Web Push unchanged; nothing leaves the test.');
