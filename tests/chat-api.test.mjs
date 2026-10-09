import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const bundle=await build({entryPoints:['supabase/functions/house-api/index.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'test-dependencies',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));b.onResolve({filter:/^npm:@block65/},()=>({path:'push',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export function buildPushPayload(){throw Error("No pushes permitted in tests")}'}));}}]});
globalThis.Deno={env:{get:n=>n==='SUPABASE_URL'?'https://db.test':n==='SUPABASE_SERVICE_ROLE_KEY'?'test-service-key':undefined},serve:()=>{}};
const records=[];const photos=[];let member=0;const household={household:{first:'Alex',second:'Camille',version:1},items:[],entries:[],appointments:[],activity:[],devices:[],sequence:0};const queries=[];let stateVersion=1;
globalThis.fetch=async(url,init={})=>{const u=new URL(url);assert.equal(u.hostname,'db.test','Unit tests never call real services');queries.push(u);const method=init.method||'GET';if(u.pathname.endsWith('nd_sessions'))return Response.json([{member}]);if(u.pathname.endsWith('nd_state')){if(method==='PATCH'){if(u.searchParams.get('version')!=='eq.'+stateVersion)return Response.json([]);const p=JSON.parse(init.body);Object.assign(household,p.data);stateVersion=p.version;}return Response.json([{version:stateVersion,data:household}]);}if(u.pathname.endsWith('nd_photos')){const id=u.searchParams.get('id')?.slice(3);if(method==='GET')return Response.json(id?photos.filter(p=>p.id===id):photos.filter(p=>String(p.owner)===u.searchParams.get('owner')?.slice(3)));const p=JSON.parse(init.body);if(!photos.some(x=>x.id===p.id))photos.push(p);return Response.json([]);}assert(u.pathname.endsWith('nd_messages'));const id=u.searchParams.get('id')?.slice(3);if(method==='GET')return Response.json(id?records.filter(r=>r.id===id):records.toReversed());if(method==='POST'){const p=JSON.parse(init.body);if(!records.some(r=>r.id===p.id))records.push({...p,created_at:new Date().toISOString(),version:1,edited_at:null});return Response.json([]);}const found=records.find(r=>r.id===id&&String(r.member)===u.searchParams.get('member')?.slice(3)&&String(r.version)===u.searchParams.get('version')?.slice(3));if(!found)return Response.json([]);if(method==='PATCH')Object.assign(found,JSON.parse(init.body));else if(method==='DELETE')records.splice(records.indexOf(found),1);return Response.json([found]);};
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

function homeReq(payload){return new Request('https://edge.test/?route=household',{method:payload?'POST':'GET',headers:{'Content-Type':'application/json','x-house-session':'a'.repeat(64)},...(payload?{body:JSON.stringify(payload)}:{})});}
household.items=[];member=0;
assert.equal((await handler(homeReq({action:'profile-photo',payload:{photoId,member:1}}))).status,200);
assert.equal(household.profiles[0],photoId);assert.equal(household.profiles[1],undefined);
member=1;assert.equal((await handler(photoReq(undefined,photoId))).status,200,'Partner can see a linked profile photo');
assert.equal((await handler(homeReq({action:'profile-photo',payload:{photoId}}))).status,403,'Partner cannot assign another owner’s photo');
member=0;assert.equal((await handler(homeReq({action:'profile-photo',payload:{photoId:null}}))).status,200);
member=1;assert.equal((await handler(photoReq(undefined,photoId))).status,403,'Removed profile photo is no longer shared');
const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const before=(await (await handler(homeReq())).json()).meals;
member=0;assert.equal((await handler(homeReq({action:'meal-vote',payload:{date,recipeId:'shakshuka',like:true,actor:1}}))).status,200);
member=1;const unseen=await (await handler(homeReq())).json();assert.deepEqual(unseen.meals,before);assert.equal(unseen.mealRounds,undefined);assert.equal(unseen.activity,undefined);
assert.equal((await handler(homeReq({action:'meal-vote',payload:{date,recipeId:'shakshuka',like:true}}))).status,200);
const matched=await (await handler(homeReq())).json();assert.equal(matched.meals.matches.length,1);assert.deepEqual(Object.keys(matched.meals).sort(),['date','matches','myVotes']);
assert.equal((await handler(homeReq({action:'meal-vote',payload:{date,recipeId:'pork',like:true}}))).status,400);
console.log('PASS: real handler projects only own meal votes and mutual matches; profile photo ownership, sharing and unlink protection.');

function routeReq(route,payload,auth=true){return new Request('https://edge.test/?route='+route,{method:payload?'POST':'GET',headers:{'Content-Type':'application/json',...(auth?{'x-house-session':'a'.repeat(64)}:{})},...(payload?{body:JSON.stringify(payload)}:{})});}
assert.equal((await handler(routeReq('meals',undefined,false))).status,401);
assert.equal((await handler(routeReq('recipes',undefined,false))).status,401);
member=0;const direct=await (await handler(routeReq('meals',{date,recipeId:'greek-salad',like:true,actor:1}))).json();
assert.equal(direct.myVotes['greek-salad'],true);
// The fast endpoint accepts only server-known recipes.
assert.equal((await handler(routeReq('meals',{date,recipeId:'shakshuka',like:true,actor:1}))).status,200);
assert.equal((await handler(routeReq('meals',{date,recipeId:'invented',like:true}))).status,400);
const own=await (await handler(routeReq('meals'))).json();assert.deepEqual(Object.keys(own).sort(),['date','matches','myVotes']);
member=1;const other=await (await handler(routeReq('meals'))).json();assert(!Object.hasOwn(other.myVotes,'greek-salad'));
const library=await (await handler(routeReq('recipes'))).json();assert.equal(library.discovery.configured,false);assert.equal(library.discovery.status,'unconfigured');assert.deepEqual(library.recipes,[]);assert(!JSON.stringify(library).includes('test-service-key'));
assert.equal((await handler(routeReq('recipes',{action:'toggle',enabled:false}))).status,200);assert.equal(household.recipeDiscovery.enabled,false);
assert.equal((await handler(routeReq('recipes',{action:'toggle',enabled:'yes'}))).status,400);
assert.equal((await handler(routeReq('recipes',{action:'discover'}))).status,200,'Missing key causes no external API request');
console.log('PASS: fast meal endpoint authorization and own projection; authenticated recipe library, safe missing-secret status and discovery pause.');

// Personal recipes reuse authenticated private photo storage and custom member sessions.
member=0;const personalId=crypto.randomUUID();const personal={id:personalId,version:0,title:'Le gratin maison',group:'Végétarien',minutes:40,servings:3,ingredients:['3 pommes de terre'],steps:['Cuire les pommes de terre.'],photoId,calories:350,nutrients:'Protéines : 12 g',porkFree:true,owner:1};
assert.equal((await handler(routeReq('recipes',{action:'recipe-save',payload:personal},false))).status,401);
assert.equal((await handler(routeReq('recipes',{action:'recipe-save',payload:personal}))).status,200);
assert.equal(household.personalRecipes[0].owner,0);
member=1;assert.equal((await handler(photoReq(undefined,photoId))).status,200,'A recipe photo is shared only once linked');
const shared=await(await handler(routeReq('recipes'))).json();assert.equal(shared.recipes[0].calories,350);assert.equal(shared.recipes[0].servings,3);assert.equal(shared.member,1);
assert.equal((await handler(routeReq('recipes',{action:'recipe-save',payload:{...personal,version:1}}))).status,403);
assert.equal((await handler(routeReq('recipes',{action:'recipe-save',payload:{...personal,id:crypto.randomUUID()}}))).status,403,'Cannot use another author’s photo on a new recipe');
assert.equal((await handler(routeReq('recipes',{action:'recipe-archive',payload:{id:personalId,version:1}}))).status,403);
assert.equal((await handler(routeReq('meals',{date,recipeId:personalId,like:true}))).status,200);
member=0;assert.equal((await handler(routeReq('meals',{date,recipeId:personalId,like:true}))).status,200);
const personalMatch=await(await handler(routeReq('meals'))).json();assert(personalMatch.matches.some(m=>m.recipeId===personalId));
const weekPlan={id:crypto.randomUUID(),version:0,weekStart:'2026-10-05',slots:[{day:0,meal:'dinner',recipeId:personalId}]};
assert.equal((await handler(routeReq('recipes',{action:'plan-save',payload:weekPlan}))).status,200);
member=1;assert.equal((await handler(routeReq('recipes',{action:'plan-save',payload:{...weekPlan,version:1}}))).status,403);
member=0;assert.equal((await handler(routeReq('recipes',{action:'recipe-archive',payload:{id:personalId,version:1}}))).status,200);
assert.equal((await handler(routeReq('meals',{date,recipeId:personalId,like:true}))).status,400,'Archived recipes cannot enter new rounds');
const retained=await(await handler(routeReq('recipes'))).json();assert.equal(retained.plans[0].slots[0].recipeId,personalId);assert(retained.recipes[0].archived);
console.log('PASS: real API recipe persistence, authenticated nutrition/photo sharing, photo reattachment denial, personal-recipe matches, plan author protection and historical recipe retention.');
