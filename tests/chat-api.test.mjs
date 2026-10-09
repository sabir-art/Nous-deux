import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const bundle=await build({entryPoints:['supabase/functions/house-api/index.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'test-dependencies',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));b.onResolve({filter:/^npm:@block65/},()=>({path:'push',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export function buildPushPayload(){throw Error("No pushes permitted in tests")}'}));}}]});
globalThis.Deno={env:{get:n=>n==='SUPABASE_URL'?'https://db.test':n==='SUPABASE_SERVICE_ROLE_KEY'?'test-service-key':undefined},serve:()=>{}};
const records=[];const photos=[];let member=0;const household={household:{first:'Alex',second:'Camille',version:1},items:[],entries:[],appointments:[],activity:[],devices:[],sequence:0};const queries=[];
globalThis.fetch=async(url,init={})=>{const u=new URL(url);assert.equal(u.hostname,'db.test','Unit tests never call real services');queries.push(u);const method=init.method||'GET';if(u.pathname.endsWith('nd_sessions'))return Response.json([{member}]);if(u.pathname.endsWith('nd_state'))return Response.json([{version:1,data:household}]);if(u.pathname.endsWith('nd_photos')){const id=u.searchParams.get('id')?.slice(3);if(method==='GET')return Response.json(id?photos.filter(p=>p.id===id):photos.filter(p=>String(p.owner)===u.searchParams.get('owner')?.slice(3)));const p=JSON.parse(init.body);if(!photos.some(x=>x.id===p.id))photos.push(p);return Response.json([]);}assert(u.pathname.endsWith('nd_messages'));const id=u.searchParams.get('id')?.slice(3);if(method==='GET')return Response.json(id?records.filter(r=>r.id===id):records.toReversed());if(method==='POST'){const p=JSON.parse(init.body);if(!records.some(r=>r.id===p.id))records.push({...p,created_at:new Date().toISOString(),version:1,edited_at:null});return Response.json([]);}const found=records.find(r=>r.id===id&&String(r.member)===u.searchParams.get('member')?.slice(3)&&String(r.version)===u.searchParams.get('version')?.slice(3));if(!found)return Response.json([]);if(method==='PATCH')Object.assign(found,JSON.parse(init.body));else if(method==='DELETE')records.splice(records.indexOf(found),1);return Response.json([found]);};
const {handler}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
function req(payload,query='',authenticated=true){return new Request('https://edge.test/?route=chat'+query,{method:payload?'POST':'GET',headers:{Origin:'https://sabir-art.github.io','Content-Type':'application/json',...(authenticated?{'x-house-session':'a'.repeat(64)}:{})},...(payload?{body:JSON.stringify(payload)}:{})});}
assert.equal((await handler(req(undefined,'',false))).status,401);
assert.equal((await handler(new Request('https://edge.test/?route=chat',{headers:{Origin:'https://evil.test'}}))).status,403);
const id=crypto.randomUUID();assert.equal((await handler(req({action:'send',id,text:'Bonjour',member:1}))).status,200);assert.equal(records[0].member,0);
await handler(req({action:'send',id,text:'Second envoi'}));assert.equal(records.length,1);assert.equal(records[0].text,'Bonjour');
assert.equal((await handler(req({action:'send',id:crypto.randomUUID(),text:' '}))).status,400);
assert.equal((await handler(req({action:'send',id:crypto.randomUUID(),text:'x'.repeat(2001)}))).status,400);
assert.equal((await handler(req({action:'edit',id,text:'Bonjour !',version:1}))).status,200);assert.equal(records[0].version,2);
assert.equal((await handler(req({action:'edit',id,text:'Ancienne version',version:1}))).status,409);
records[0].member=1;assert.equal((await handler(req({action:'edit',id,text:'Faux message',version:2,member:1}))).status,403);assert.equal((await handler(req({action:'delete',id,version:2}))).status,403);
assert.equal((await handler(req(undefined,'&before=2026-10-09T10%3A00%3A00.123456%2B00%3A00&beforeId='+id))).status,200);assert(queries.at(-1).searchParams.get('or').includes('id.lt.'+id));
assert.equal((await handler(req(undefined,'&before=bad&beforeId='+id))).status,400);
records[0].member=0;assert.equal((await handler(req({action:'delete',id,version:2}))).status,200);assert.equal(records.length,0);
console.log('PASS: authenticated chat API, actor spoofing, idempotent send, message validation, ownership, stale versions and cursor validation.');

function photoReq(payload,id,auth=true){return new Request('https://edge.test/?route=photos'+(id?'&id='+id:''),{method:payload?'POST':'GET',headers:{'Content-Type':'application/json',...(auth?{'x-house-session':'a'.repeat(64)}:{})},...(payload?{body:JSON.stringify(payload)}:{})});}
const photoId=crypto.randomUUID(),data='data:image/jpeg;base64,/9j/2Q==';
assert.equal((await handler(photoReq({id:photoId,data,owner:1}))).status,200);assert.equal(photos[0].owner,0);
assert.equal((await handler(photoReq(undefined,photoId,false))).status,401);
assert.equal((await handler(photoReq({id:crypto.randomUUID(),data:'data:image/svg+xml;base64,PHN2Zz4='}))).status,400);
assert.equal((await handler(photoReq({id:crypto.randomUUID(),data:'data:image/jpeg;base64,/9j/AAAA'}))).status,400);
member=1;assert.equal((await handler(photoReq(undefined,photoId))).status,403,'Unlinked draft photos stay private');
assert.equal((await handler(photoReq({id:photoId,data}))).status,403);
household.items.push({kind:'shopping',photoId});assert.equal((await handler(photoReq(undefined,photoId))).status,200,'A linked shopping photo is visible to the partner');
const forgedItem=new Request('https://edge.test/?route=household',{method:'POST',headers:{'Content-Type':'application/json','x-house-session':'a'.repeat(64)},body:JSON.stringify({action:'item',payload:{id:crypto.randomUUID(),photoId}})});
assert.equal((await handler(forgedItem)).status,403,'The partner cannot reattach a photo as their own');
assert.equal((await handler(new Request('https://edge.test/?route=plant-reminders',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}))).status,401);
console.log('PASS: authenticated photo upload, owner enforcement, shared linked photos, private drafts, format validation and scheduler access denial.');
