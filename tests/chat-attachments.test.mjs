import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync,readFileSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const bundle=await build({entryPoints:['supabase/functions/house-api/index.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'isolated',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));b.onResolve({filter:/^npm:@block65/},()=>({path:'push',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export function buildPushPayload(){throw Error("No real notifications in tests")}'}));}}]});
globalThis.Deno={env:{get:n=>n==='SUPABASE_URL'?'https://db.test':n==='SUPABASE_SERVICE_ROLE_KEY'?'server-only-test-key':undefined},serve:()=>{}};
let actor=0,storageFails=false,uploads=0;const files=[],messages=[],objects=new Set();
globalThis.fetch=async(url,init={})=>{
 const u=new URL(url),method=init.method||'GET';assert.equal(u.hostname,'db.test','Tests must never call production');
 if(u.pathname.includes('/storage/v1/')){
  assert.equal(init.headers.apikey,'server-only-test-key');if(storageFails)return new Response('',{status:503});
  if(u.pathname.includes('/object/sign/')){assert.equal(JSON.parse(init.body).expiresIn,600);return Response.json({signedURL:u.pathname.slice('/storage/v1'.length)+'?token=temporary'});}
  if(method==='DELETE'){for(const p of JSON.parse(init.body).prefixes)objects.delete(p);return Response.json([]);}
  uploads++;assert(init.body instanceof Uint8Array);objects.add(u.pathname.slice('/storage/v1/object/nous-deux-chat/'.length));return Response.json({});
 }
 if(u.pathname.endsWith('/nd_sessions'))return Response.json([{member:actor}]);
 if(u.pathname.endsWith('/rpc/nd_rate_hit'))return Response.json(1);
 const list=u.pathname.endsWith('/nd_attachments')?files:u.pathname.endsWith('/nd_messages')?messages:null;assert(list,'Unexpected '+u.pathname);
 const filtered=()=>list.filter(row=>['id','owner','member','version','attachment_id'].every(k=>!u.searchParams.has(k)||String(row[k])===u.searchParams.get(k).slice(3)));
 if(method==='GET')return Response.json(filtered());
 if(method==='POST'){const p=JSON.parse(init.body);if(!list.some(x=>x.id===p.id))list.push({...p,version:1,created_at:new Date().toISOString()});return Response.json([]);}
 const rows=filtered();if(method==='PATCH')for(const r of rows)Object.assign(r,JSON.parse(init.body));else if(method==='DELETE')for(const r of rows)list.splice(list.indexOf(r),1);return Response.json(rows);
};
const {handler}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const token='a'.repeat(64),pdf=new TextEncoder().encode('%PDF-1.7\n% A local test fixture\n%%EOF'),id=crypto.randomUUID();
function request(route,body,auth=true){return new Request('https://edge.test/?route='+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(auth?{'x-house-session':token}:{})},...(body?{body:JSON.stringify(body)}:{})});}
function upload(fileId=id,{name='Notre voyage.pdf',body=pdf,auth=true,extra={}}={}){return new Request('https://edge.test/?route=attachment-upload&id='+fileId+'&name='+encodeURIComponent(name),{method:'POST',headers:{'Content-Type':'application/octet-stream',...(auth?{'x-house-session':token}:{}),...extra},body});}
assert.equal((await handler(upload(id,{auth:false}))).status,401);
assert.equal((await handler(request('attachments&id='+id,undefined,false))).status,401);
assert.equal((await handler(upload(id,{extra:{'Content-Length':'31457281'}}))).status,413);
assert.equal((await handler(upload(id,{body:new Uint8Array(31457281)}))).status,413,'Streaming byte count enforces the same limit');
assert.equal((await handler(upload(id,{body:new TextEncoder().encode('<svg onload="alert(1)"></svg>'),name:'photo.svg'}))).status,415);
assert.equal((await handler(upload(id,{body:new TextEncoder().encode('<html>pretend PDF</html>')}))).status,415);
assert.equal((await handler(upload(id,{name:'program.exe'}))).status,415);
assert.equal((await handler(upload(id,{body:new Uint8Array()}))).status,413);
storageFails=true;assert.equal((await handler(upload())).status,503);assert.equal(files[0].ready,false);
storageFails=false;assert.equal((await handler(upload())).status,200);assert.equal(files[0].ready,true);assert.equal(files[0].mime,'application/pdf');assert.equal(files[0].owner,0);assert.equal(uploads,1);
assert.equal((await handler(upload())).status,200);assert.equal(uploads,1);
assert.equal((await handler(upload(id,{name:'Autre nom.pdf'}))).status,409,'Ready attachment metadata is immutable');
actor=1;assert.equal((await handler(upload())).status,409);assert.equal((await handler(request('attachments&id='+id))).status,403,'Unsent files remain private');
assert.equal((await handler(request('chat',{action:'send',id:crypto.randomUUID(),attachmentId:id}))).status,403);
actor=0;const message=crypto.randomUUID();assert.equal((await handler(request('chat',{action:'send',id:message,attachmentId:id,text:'Nos billets ✈️',member:1,attachment_name:'forged'}))).status,200);assert.equal(messages[0].member,0);assert.equal(messages[0].attachment_name,'Notre voyage.pdf');assert.equal(messages[0].attachment_bytes,pdf.length);assert.equal(messages[0].text,'Nos billets ✈️');
await handler(request('chat',{action:'send',id:message,attachmentId:id}));assert.equal(messages.length,1);
assert.equal((await handler(request('chat',{action:'send',id:crypto.randomUUID(),attachmentId:id}))).status,409);
assert.equal((await handler(request('chat',{action:'send',id:crypto.randomUUID(),attachmentId:id,voiceId:crypto.randomUUID()}))).status,400);
assert.equal((await handler(request('chat',{action:'edit',id:message,version:1,text:'Cannot replace file'}))).status,400);
assert.equal((await handler(request('attachments',{action:'discard',id}))).status,409);
actor=1;const signed=await(await handler(request('attachments&id='+id))).json();assert(signed.url.startsWith('https://db.test/storage/v1/object/sign/nous-deux-chat/0/'));assert.equal(new URL(signed.download).searchParams.get('download'),'Notre voyage.pdf');assert(!JSON.stringify(signed).includes('server-only-test-key'));
assert.equal((await handler(request('chat',{action:'delete',id:message,version:1}))).status,403);
actor=0;assert.equal((await handler(request('chat',{action:'delete',id:message,version:2}))).status,409);assert.equal((await handler(request('chat',{action:'delete',id:message,version:1}))).status,200);assert.equal(files.length,0);assert.equal(messages.length,0);assert.equal(objects.size,0);
actor=1;assert.equal((await handler(request('attachments&id='+id))).status,404);
actor=0;const formats=[['photo.jpg',new Uint8Array([255,216,255,224,0,16,0,0]),'image/jpeg'],['photo.png',new Uint8Array([137,80,78,71,13,10,26,10]),'image/png'],['photo.heic',new Uint8Array([0,0,0,24,102,116,121,112,104,101,105,99,0,0,0,0]),'image/heic'],['notes.txt',new TextEncoder().encode('Coucou 💕'),'text/plain'],['menu.docx',new Uint8Array([80,75,3,4,0,0]),'application/vnd.openxmlformats-officedocument.wordprocessingml.document']];
for(const [name,body,mime] of formats){const fileId=crypto.randomUUID();assert.equal((await handler(upload(fileId,{name,body}))).status,200);assert.equal(files.at(-1).mime,mime);assert.equal((await handler(request('attachments',{action:'discard',id:fileId}))).status,200);}
const largest=new Uint8Array(31457280);largest.set([255,216,255,224]);const largeId=crypto.randomUUID();assert.equal((await handler(upload(largeId,{name:'grande-photo.jpg',body:largest}))).status,200,'Exactly 30 MiB accepted');await handler(request('attachments',{action:'discard',id:largeId}));
const sql=readFileSync('supabase/sql/chat-attachments.sql','utf8');assert(sql.includes('enable row level security'));assert(sql.includes('revoke all on public.nd_attachments from public,anon,authenticated'));assert(sql.includes("'nous-deux-chat','nous-deux-chat',false,31457280"));assert(sql.includes('unique index if not exists nd_messages_attachment_id_idx'));
console.log('PASS: private file API, streaming 30 MiB limit, validated image/PDF/document formats, retries, draft privacy, spoofed metadata, caption/emoji persistence, owner-only deletion and expiring download links.');
