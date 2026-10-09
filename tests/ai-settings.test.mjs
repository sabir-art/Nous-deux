import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync,readFileSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const b=await build({entryPoints:['supabase/functions/house-api/index.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'deps',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));b.onResolve({filter:/^npm:@block65/},()=>({path:'push',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export function buildPushPayload(){throw Error("No push in test")}'}));}}]});
let actor=0,key='',version=1,hits=0,writes=0,providerStatus=200,modelChecks=0;const pending=[];const state={household:{first:'A',second:'B',version:1},items:[],entries:[],appointments:[],devices:[],activity:[],sequence:0};const password='test-password-only',candidate='sk-'+'t'.repeat(32),salt='test-salt';const enc=new TextEncoder(),material=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);const password_hash=Buffer.from(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},material,256)).toString('hex');
globalThis.Deno={env:{get:n=>n==='SUPABASE_URL'?'https://db.test':n==='SUPABASE_SERVICE_ROLE_KEY'?'server-only':undefined},serve:()=>{}};globalThis.EdgeRuntime={waitUntil:p=>pending.push(p)};
globalThis.fetch=async(url,init={})=>{const u=new URL(url),body=init.body?JSON.parse(init.body):{};
 if(u.hostname==='api.openai.com'){assert.equal(init.headers.Authorization,'Bearer '+candidate);if(u.pathname.startsWith('/v1/models/')){modelChecks++;return new Response('private provider detail',{status:providerStatus});}assert.equal(u.pathname,'/v1/responses');return Response.json({error:{code:'insufficient_quota'}},{status:429});}
 assert.equal(u.hostname,'db.test','No real services in tests');
 if(u.pathname.endsWith('nd_sessions'))return Response.json([{member:actor}]);
 if(u.pathname.endsWith('nd_members'))return Response.json([{password_hash,salt}]);
 if(u.pathname.endsWith('nd_rate_hit'))return Response.json(++hits);
 if(u.pathname.endsWith('nd_openai_key_get'))return Response.json(key||null);
 if(u.pathname.endsWith('nd_openai_key_set')){key=body.api_key;writes++;return new Response(null,{status:204});}
 if(u.pathname.endsWith('nd_state')){if(init.method==='PATCH'){assert.equal(u.searchParams.get('version'),'eq.'+version);Object.assign(state,body.data);version=body.version;}return Response.json([{version,data:state}]);}
 throw Error('Unexpected mock path');
};
const {handler}=await import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));
const req=(payload,auth=true)=>new Request('https://edge.test/?route=ai-settings',{method:payload?'POST':'GET',headers:{'Content-Type':'application/json',...(auth?{'x-house-session':'a'.repeat(64)}:{})},...(payload?{body:JSON.stringify(payload)}:{})});
assert.equal((await handler(req(undefined,false))).status,401);assert.equal((await (await handler(req())).json()).configured,false);
actor=1;assert.equal((await handler(req({key:candidate,password,actor:0}))).status,403);assert.equal(modelChecks,0);assert.equal(writes,0);
actor=0;assert.equal((await handler(req({key:candidate,password:'wrong-password'}))).status,403);assert.equal(modelChecks,0);
providerStatus=401;const invalid=await handler(req({key:candidate,password}));assert.equal(invalid.status,400);assert(!JSON.stringify(await invalid.json()).includes('private provider'));assert.equal(writes,0);
providerStatus=200;const connected=await handler(req({key:candidate,password}));assert.equal(connected.status,200);const projection=await connected.json();assert(projection.configured);assert.equal(writes,1);assert(!JSON.stringify(projection).includes(candidate));assert(!JSON.stringify(state).includes(candidate));await Promise.all(pending);
actor=1;const partner=await(await handler(req())).json();assert(partner.configured);assert(!partner.canConfigure);assert(!JSON.stringify(partner).includes(candidate));
actor=0;hits=5;assert.equal((await handler(req({key:candidate,password}))).status,429);assert.equal(writes,1);
const sql=readFileSync('supabase/sql/shared-ai-vault.sql','utf8');assert(sql.includes('security invoker'));assert(sql.includes('from public, anon, authenticated'));assert(!sql.includes(candidate));
console.log('PASS: shared server-only AI configuration, authentication, payer-only changes, password reauthentication, throttling, provider validation, no secret projection/storage in household, and client RPC privileges denied.');
