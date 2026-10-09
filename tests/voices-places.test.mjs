import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync,readFileSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const plugin={name:'isolated',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));b.onResolve({filter:/^npm:@block65/},()=>({path:'push',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export function buildPushPayload(){throw Error("Never send notifications in tests")}'}));}};
const bundle=await build({entryPoints:['supabase/functions/house-api/index.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[plugin]});
globalThis.Deno={env:{get:n=>n==='SUPABASE_URL'?'https://db.test':n==='SUPABASE_SERVICE_ROLE_KEY'?'test-server-key':undefined},serve:()=>{}};
let actor=0,version=1,storageFails=false,storageUploads=0,placeQueries=0;
const voices=[],messages=[],objects=new Set(),household={household:{},items:[],entries:[],appointments:[],devices:[],activity:[],sequence:0};
const photon={features:[{geometry:{type:'Point',coordinates:[2.354,48.872]},properties:{name:'Petit Bao',street:'Rue du Faubourg Saint-Denis',city:'Paris',postcode:'75010',country:'France',osm_type:'N',osm_id:4013618082}},{geometry:{type:'Point',coordinates:[999,999]},properties:{name:'Bad',osm_type:'N',osm_id:123}}]};
globalThis.fetch=async(url,init={})=>{
 const u=new URL(url),method=init.method||'GET';
 if(u.hostname==='photon.komoot.io'){placeQueries++;assert.equal(u.pathname,'/api/');assert.equal(u.searchParams.get('osm_tag'),'amenity:restaurant');return Response.json(photon);}
 assert.equal(u.hostname,'db.test','No live credentials, real messages or notifications in tests');
 if(u.pathname.includes('/storage/v1/')){
  assert.equal(init.headers.apikey,'test-server-key');if(storageFails)return new Response('',{status:503});
  if(u.pathname.includes('/object/sign/')){assert.equal(JSON.parse(init.body).expiresIn,600);return Response.json({signedURL:u.pathname.slice('/storage/v1'.length)+'?token=temporary'});}
  if(method==='DELETE'){for(const p of JSON.parse(init.body).prefixes)objects.delete(p);return Response.json([]);}
  storageUploads++;assert(init.body instanceof Uint8Array);objects.add(u.pathname.slice('/storage/v1/object/nous-deux-voices/'.length));return Response.json({});
 }
 if(u.pathname.endsWith('/nd_sessions'))return Response.json([{member:actor}]);
 if(u.pathname.endsWith('/rpc/nd_rate_hit'))return Response.json(1);
 if(u.pathname.endsWith('/nd_state')){if(method==='PATCH'){if(u.searchParams.get('version')!=='eq.'+version)return Response.json([]);const p=JSON.parse(init.body);Object.assign(household,p.data);version=p.version;}return Response.json([{version,data:household}]);}
 const list=u.pathname.endsWith('/nd_voices')?voices:u.pathname.endsWith('/nd_messages')?messages:null;assert(list,'Unexpected '+u.pathname);
 const filtered=()=>list.filter(row=>['id','owner','member','version','voice_id'].every(k=>!u.searchParams.has(k)||String(row[k])===u.searchParams.get(k).slice(3)));
 if(method==='GET')return Response.json(filtered());
 if(method==='POST'){const p=JSON.parse(init.body);if(!list.some(x=>x.id===p.id))list.push({...p,version:1,created_at:new Date().toISOString()});return Response.json([]);}
 const rows=filtered();if(method==='PATCH')for(const r of rows)Object.assign(r,JSON.parse(init.body));else if(method==='DELETE')for(const r of rows)list.splice(list.indexOf(r),1);return Response.json(rows);
};
const {handler}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const token='a'.repeat(64);
function request(route,body,auth=true){return new Request('https://edge.test/?route='+route,{method:body?'POST':'GET',headers:{Origin:'https://sabir-art.github.io','Content-Type':'application/json',...(auth?{'x-house-session':token}:{})},...(body?{body:JSON.stringify(body)}:{})});}
const webm=new Uint8Array([0x1a,0x45,0xdf,0xa3,...new Array(64).fill(0)]),id=crypto.randomUUID();
function upload(voice=id,{duration=1200,body=webm,mime='audio/webm;codecs=opus',auth=true}={}){return new Request('https://edge.test/?route=voice-upload&id='+voice+'&duration='+duration,{method:'POST',headers:{'Content-Type':mime,...(auth?{'x-house-session':token}:{})},body});}
assert.equal((await handler(upload(id,{auth:false}))).status,401);
assert.equal((await handler(request('voices&id='+id,undefined,false))).status,401);
assert.equal((await handler(upload(id,{duration:180001}))).status,400);
assert.equal((await handler(upload(id,{body:new Uint8Array(8388609)}))).status,413);
assert.equal((await handler(upload(id,{body:new TextEncoder().encode('<html>wrong audio</html>')}))).status,415);
assert.equal((await handler(upload(id,{mime:'text/html'}))).status,415);
storageFails=true;assert.equal((await handler(upload())).status,503);assert.equal(voices.length,1);assert.equal(voices[0].ready,false);
storageFails=false;assert.equal((await handler(upload())).status,200);assert.equal(voices[0].ready,true);assert.equal(storageUploads,1);
assert.equal((await handler(upload())).status,200);assert.equal(storageUploads,1,'Idempotent retries do not rewrite ready files');
assert.equal((await handler(upload(id,{duration:1300}))).status,409,'Do not mutate immutable voice metadata');
actor=1;assert.equal((await handler(upload())).status,409,'Other member cannot claim the same voice');
assert.equal((await handler(request('voices&id='+id))).status,403,'Partner cannot listen to a draft');
assert.equal((await handler(request('chat',{action:'send',id:crypto.randomUUID(),voiceId:id}))).status,403,'Partner cannot attach my voice');
actor=0;const message=crypto.randomUUID();assert.equal((await handler(request('chat',{action:'send',id:message,voiceId:id}))).status,200);
assert.equal(messages[0].voice_duration,1200);assert.equal(messages[0].text,'');
assert.equal((await handler(request('chat',{action:'send',id:message,voiceId:id}))).status,200);assert.equal(messages.length,1);
assert.equal((await handler(request('chat',{action:'send',id:crypto.randomUUID(),voiceId:id}))).status,409);
assert.equal((await handler(request('chat',{action:'send',id:crypto.randomUUID(),voiceId:id,text:'Both'}))).status,400);
assert.equal((await handler(request('chat',{action:'edit',id:message,version:1,text:'Cannot edit voice'}))).status,400);
assert.equal((await handler(request('voices',{action:'discard',id}))).status,409,'Cannot delete linked attachment directly');
actor=1;const listen=await(await handler(request('voices&id='+id))).json();assert(listen.url.startsWith('https://db.test/storage/v1/object/sign/nous-deux-voices/0/'));assert(!listen.url.includes('test-server-key'));
assert.equal((await handler(request('chat',{action:'delete',id:message,version:1}))).status,403);
actor=0;assert.equal((await handler(request('chat',{action:'delete',id:message,version:1}))).status,200);assert.equal(messages.length,0);assert.equal(voices.length,0);assert.equal(objects.size,0);
const mp4=new Uint8Array([0,0,0,20,102,116,121,112,77,52,65,32,...new Array(20).fill(0)]),mp4id=crypto.randomUUID();assert.equal((await handler(upload(mp4id,{body:mp4,mime:'audio/mp4'}))).status,200);assert.equal(voices[0].mime,'audio/mp4');assert.equal((await handler(request('voices',{action:'discard',id:mp4id}))).status,200);assert.equal(voices.length,0);
assert.equal((await handler(request('place-search&q=Paris&restaurants=1',undefined,false))).status,401);assert.equal(placeQueries,0);
assert.equal((await handler(request('place-search&q=ab&restaurants=1'))).status,400);
let places=await(await handler(request('place-search&q=Petit%20Bao%20Paris&restaurants=1'))).json();assert.equal(places.places.length,1);assert(places.places[0].address.includes('Paris'));assert.equal(places.places[0].sourceId,'N4013618082');assert.equal(placeQueries,1);
await handler(request('place-search&q=Petit%20Bao%20Paris&restaurants=1'));assert.equal(placeQueries,1,'Provider results cached');
const favorite=crypto.randomUUID(),place=places.places[0];assert.equal((await handler(request('places',{action:'save',id:favorite,version:0,place,owner:1}))).status,200);assert.equal(household.favoritePlaces[0].owner,0);
await handler(request('places',{action:'save',id:favorite,version:0,place}));assert.equal(household.favoritePlaces.length,1);
actor=1;assert.equal((await(await handler(request('places'))).json()).places.length,1);assert.equal((await handler(request('places',{action:'remove',id:favorite,version:1}))).status,403);
await handler(request('places',{action:'save',id:crypto.randomUUID(),version:0,place}));assert.equal(household.favoritePlaces.length,1,'Same restaurant is not duplicated across members');
actor=0;const idea=crypto.randomUUID();const payload={id:idea,version:0,title:'Resto à deux',category:'restaurant',date:'',time:'',description:'On y va ?',location:'En terrasse',place};assert.equal((await handler(request('household',{action:'idea',payload}))).status,200);assert.deepEqual(household.ideas[0].place,place);
await handler(request('places',{action:'remove',id:favorite,version:1}));assert.equal(household.favoritePlaces.length,0);assert.deepEqual(household.ideas[0].place,place,'Invitation keeps its place snapshot');
assert.equal((await handler(request('places',{action:'save',id:crypto.randomUUID(),version:0,place:{...place,lat:999}}))).status,400);
assert.equal((await handler(request('places',{action:'save',id:crypto.randomUUID(),version:0,place:{name:'Notre table',address:'12 rue Exemple, Paris',lat:null,lon:null,source:'manual'}}))).status,200);
const sql=readFileSync('supabase/sql/chat-voices.sql','utf8');assert(sql.includes('enable row level security'));assert(sql.includes('revoke all on public.nd_voices from public, anon, authenticated'));assert(sql.includes("'nous-deux-voices','nous-deux-voices',false"));
console.log('PASS: private voice upload/read/delete, binary/size/duration validation, interrupted uploads, retries, actor spoofing, draft privacy, immutable attachments and Safari MP4.');
console.log('PASS: authenticated place search, provider cache and validation, shared favorites, author-only removal, duplicate prevention, manual address and persistent invitation snapshot.');
