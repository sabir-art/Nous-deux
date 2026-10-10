// No live rooms, credentials, household data or push messages are used here.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const bundle=await build({stdin:{contents:`export * from './supabase/functions/house-api/daily-calls.ts';export * from './supabase/functions/house-api/daily-provider.ts';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const {handleDailyCalls,transition,callProjection,expiredState,ACTIVE,dailyProvider,roomSettings,tokenSettings,CALL_LIMIT_MS}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const a='a'.repeat(64),b='b'.repeat(64),other='c'.repeat(64),epoch=Date.UTC(2026,9,10),id=()=>crypto.randomUUID();
function fixture(){
 let time=epoch,notifications=0,tokens=0,roomFails=false,closeFails=false;const rows=[],closed=[];
 const clone=v=>structuredClone(v);
 async function db(path,method='GET',body){
  if(path==='rpc/nd_rate_hit')return 1;if(path==='rpc/nd_daily_usage')return 6;
  const u=new URL('https://db.test/'+path);assert.equal(u.pathname,'/nd_daily_calls');
  const match=r=>[...u.searchParams].every(([k,v])=>k==='order'||k==='limit'||v.startsWith('eq.')&&String(r[k])===v.slice(3)||v.startsWith('lte.')&&r[k]<=Number(v.slice(4))||v.startsWith('in.')&&v.slice(4,-1).split(',').includes(r[k]));
  if(method==='POST'){
   if(rows.some(r=>r.id===body.id||ACTIVE.includes(r.state)))throw Error('unique constraint');
   const row={callee_device:null,room_url:null,callee_seen:null,connected_at:null,ended_at:null,end_reason:null,version:0,notified:false,cleanup_pending:false,cleanup_after:0,...clone(body)};rows.push(row);return [clone(row)];
  }
  let selected=rows.filter(match);if(u.searchParams.has('order'))selected.sort((x,y)=>y.created_at-x.created_at);if(u.searchParams.has('limit'))selected=selected.slice(0,Number(u.searchParams.get('limit')));
  if(method==='PATCH')selected.forEach(r=>Object.assign(r,clone(body)));else assert.equal(method,'GET');return clone(selected);
 }
 const provider={room:async name=>{if(roomFails)throw Error('provider unavailable');return 'https://fixture.daily.co/'+name;},token:async()=>{tokens++;return 'temporary-token';},close:async name=>{closed.push(name);if(closeFails)throw Error('offline');}};
 const run=(actor,device,p)=>handleDailyCalls(p?'POST':'GET',new URL('https://edge.test'),p||{},{db,key:'server-only-fixture',actor,device,names:['Alex','Camille'],provider,now:()=>time,notify:async()=>{notifications++;}});
 return {rows,closed,run,db,get notifications(){return notifications;},get tokens(){return tokens;},set time(t){time=t;},set roomFails(v){roomFails=v;},set closeFails(v){closeFails=v;}};
}
const rejects=(promise,status)=>assert.rejects(promise,e=>e.status===status);
{
 const f=fixture(),call=id();const start=await f.run(0,a,{action:'start',id:call,mode:'audio'});
 assert.equal(start.call.state,'ringing');assert.equal(start.call.mine,true);assert.equal(f.notifications,1);
 await f.run(0,a,{action:'start',id:call,mode:'audio'});assert.equal(f.rows.length,1);assert.equal(f.notifications,1);
 const snapshot=await f.run(1,b);assert.equal(snapshot.call.mine,false);assert.equal(snapshot.estimatedMinutes,6);
 for(const field of ['caller_device','callee_device','room_url','room_name','token'])assert(!JSON.stringify(snapshot).includes(field));
 await rejects(f.run(1,b,{action:'join',id:call}),403);await rejects(f.run(0,other,{action:'join',id:call}),403);await rejects(f.run(0,a,{action:'accept',id:call}),403);
 const answers=await Promise.allSettled([f.run(1,b,{action:'accept',id:call}),f.run(1,other,{action:'accept',id:call})]);
 assert.equal(answers.filter(r=>r.status==='fulfilled').length,1,'Only one device answers');
 assert.equal(answers.find(r=>r.status==='rejected').reason.status,409);
 const owner=f.rows[0].callee_device;await f.run(1,owner,{action:'accept',id:call});
 f.time=epoch+2000;await f.run(0,a,{action:'heartbeat',id:call,connected:true});assert.equal(f.rows[0].connected_at,epoch+2000);
 f.time=epoch+7000;await f.run(1,owner,{action:'heartbeat',id:call,connected:true});assert.equal(f.rows[0].connected_at,epoch+2000,'Duration never restarts');
 await rejects(f.run(1,owner===b?other:b,{action:'end',id:call}),403);
 const end=await f.run(0,a,{action:'end',id:call});assert.equal(end.call,null);assert.equal(end.ended.endReason,'completed');assert.equal(f.closed.length,1);
 await f.run(0,a,{action:'end',id:call});await rejects(f.run(1,owner,{action:'join',id:call}),410);
 assert.equal((await f.run(0,a)).history.length,1);assert.equal(f.rows.length,1,'History is retained');
}
{
 const f=fixture();const starts=await Promise.allSettled([f.run(0,a,{action:'start',id:id(),mode:'video'}),f.run(1,b,{action:'start',id:id(),mode:'audio'})]);
 assert.equal(starts.filter(r=>r.status==='fulfilled').length,1);assert.equal(starts.find(r=>r.status==='rejected').reason.status,409);assert.equal(f.rows.length,1);
}
{
 const f=fixture(),call=id();await f.run(0,a,{action:'start',id:call,mode:'audio'});f.time=epoch+80000;
 await f.run(0,a,{action:'heartbeat',id:call});assert.equal(f.rows[0].expires_at,epoch+90000,'Ringing cannot be extended forever');
 f.time=epoch+91000;const view=await f.run(1,b);assert.equal(view.call,null);assert.equal(view.history[0].state,'missed');assert.equal(f.rows[0].cleanup_pending,false);
 await rejects(f.run(1,b,{action:'accept',id:call}),409);
}
{
 const f=fixture(),call=id();await f.run(0,a,{action:'start',id:call,mode:'audio'});await f.run(1,b,{action:'accept',id:call});
 f.time=epoch+20000;await f.run(0,a,{action:'heartbeat',id:call,connected:true});
 f.time=epoch+250000;await rejects(f.run(0,a,{action:'heartbeat',id:call,connected:true}),410);
 f.time=epoch+261000;assert.equal((await f.run(0,a)).history[0].state,'failed');
}
{
 const f=fixture(),call=id();f.roomFails=true;await assert.rejects(f.run(0,a,{action:'start',id:call,mode:'audio'}));assert.equal(f.rows[0].state,'failed');assert.equal(f.tokens,0);
 f.closeFails=true;await f.run(0,a);assert.equal(f.rows[0].cleanup_pending,true);
 f.closeFails=false;f.time=epoch+61000;await f.run(0,a);assert.equal(f.rows[0].cleanup_pending,false);
}
{
 const f=fixture(),call=id();await f.run(0,a,{action:'start',id:call,mode:'audio'});await f.run(1,b,{action:'decline',id:call});assert.equal(f.rows[0].state,'declined');assert.equal((await f.run(0,a)).history[0].state,'declined');
 const row=f.rows[0];assert.equal(expiredState({...row,state:'connected',expires_at:epoch+CALL_LIMIT_MS+1},epoch+CALL_LIMIT_MS),'ended');
 assert.throws(()=>transition(row,'join',2,a,epoch),e=>e.status===403);
 assert.equal(callProjection(row,0,other).mine,false);
}
{
 let touched=false;const opts={key:'',actor:0,device:a,names:[],db:async()=>{touched=true;},notify:async()=>{}};
 assert.equal((await handleDailyCalls('GET',new URL('https://edge.test'),{},opts)).configured,false);assert.equal(touched,false);
 await rejects(handleDailyCalls('POST',new URL('https://edge.test'),{},opts),503);
}
{
 const room=roomSettings('nd-test',epoch+CALL_LIMIT_MS),token=tokenSettings('nd-test',0,'Alex',false,epoch);
 assert.equal(room.privacy,'private');assert.equal(room.properties.max_participants,2);assert.equal(room.properties.eject_at_room_exp,true);assert.equal(room.properties.enable_recording,false);
 assert.equal(token.properties.exp-Math.floor(epoch/1000),180);assert.equal(token.properties.room_name,'nd-test');assert.equal(token.properties.is_owner,false);assert.equal(token.properties.permissions.canAdmin,false);assert.equal(token.properties.start_video_off,true);assert(!('eject_at_token_exp'in token.properties),'Room hard expiry must not be overridden');
 const requests=[];const p=dailyProvider('test-secret',async(url,init)=>{requests.push({url,init});assert.equal(init.headers.Authorization,'Bearer test-secret');assert.equal(init.redirect,'error');const body=init.body?JSON.parse(init.body):{};return Response.json(url.endsWith('meeting-tokens')?{token:'scoped-token'}:url.endsWith('/rooms')?{...body,url:'https://fixture.daily.co/'+body.name,config:body.properties}:{});});
 assert.equal(await p.room('nd-test',epoch+CALL_LIMIT_MS),'https://fixture.daily.co/nd-test');assert.equal(await p.token('nd-test',0,'Alex',true,epoch),'scoped-token');await p.close('nd-test');
 assert(JSON.parse(requests.at(-3).init.body).properties.exp>Date.now()/1000,'Daily requires expiry in the future');assert.deepEqual(requests.slice(-3).map(r=>r.init.method),['POST','POST','DELETE']);assert.equal(JSON.parse(requests.at(-2).init.body).ban,true);
 const hostile=dailyProvider('test-secret',async()=>new Response('credential details should not escape',{status:401}));await assert.rejects(hostile.token('room',0,'Alex',false,epoch),e=>e.status===502&&!e.message.includes('credential'));
 const canonicalDisabled=dailyProvider('test-secret',async()=>Response.json({name:'nd-test',privacy:'private',url:'https://fixture.daily.co/nd-test',config:{...room.properties,enable_recording:''}}));assert.equal(await canonicalDisabled.room('nd-test',epoch+CALL_LIMIT_MS),'https://fixture.daily.co/nd-test');
 const publicRoom=dailyProvider('test-secret',async()=>Response.json({name:'nd-test',privacy:'public',url:'https://fixture.daily.co/nd-test',config:room.properties}));await rejects(publicRoom.room('nd-test',epoch+CALL_LIMIT_MS),502);
 const failed=[];const flaky=dailyProvider('test-secret',async(url,init)=>{failed.push(init.method);return new Response('',{status:init.method==='POST'?503:200});});await assert.rejects(flaky.close('nd-test'));assert.deepEqual(failed,['POST','POST','DELETE'],'All revocation steps are attempted even after a network error');
}
{
 const f=fixture();let authenticated=true,actor=1;
 const edge=await build({entryPoints:['supabase/functions/house-api/index.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'edge-fixture',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));b.onResolve({filter:/^npm:@block65/},()=>({path:'push',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export function buildPushPayload(){throw Error("Never send a test push")}'}));}}]});
 globalThis.Deno={env:{get:n=>({SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'fixture-service',DAILY_API_KEY:'fixture-daily'})[n]},serve:()=>{}};
 globalThis.fetch=async(url,init={})=>{const u=new URL(url),body=init.body?JSON.parse(init.body):undefined;
  if(u.hostname==='api.daily.co'){assert.equal(init.headers.Authorization,'Bearer fixture-daily');return Response.json(u.pathname.endsWith('/rooms')?{...body,url:'https://fixture.daily.co/'+body.name,config:body.properties}:u.pathname.endsWith('meeting-tokens')?{token:'temporary-fixture'}:{});}
  assert.equal(u.hostname,'db.test');if(u.pathname.endsWith('/nd_sessions'))return Response.json(authenticated?[{member:actor}]:[]);
  if(u.pathname.endsWith('/nd_state'))return Response.json([{version:1,data:{household:{first:'Alex',second:'Camille'},devices:[],call:null}}]);
  return Response.json(await f.db(u.pathname.replace('/rest/v1/','')+u.search,init.method||'GET',body));
 };
 const {handler}=await import('data:text/javascript;base64,'+Buffer.from(edge.outputFiles[0].text).toString('base64'));
 const request=(body,token='a'.repeat(64),origin='https://sabir-art.github.io')=>new Request('https://edge.test/?route=daily-calls&session='+crypto.randomUUID(),{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json','x-house-session':token},...(body?{body:JSON.stringify(body)}:{})});
 assert.equal((await handler(request(undefined,''))).status,401);authenticated=false;assert.equal((await handler(request())) .status,401);authenticated=true;
 assert.equal((await handler(request(undefined,'a'.repeat(64),'https://evil.test'))).status,403);
 const result=await handler(request({action:'start',id:id(),session:crypto.randomUUID(),mode:'audio',member:0}));assert.equal(result.status,200);assert.equal(f.rows[0].caller,1,'Identity comes from authenticated session, never supplied member');
 const payload=await result.json();assert(payload.join.token);assert(!JSON.stringify(payload).includes('fixture-daily'));assert(!JSON.stringify(payload).includes('fixture-service'));assert(!JSON.stringify(payload).includes('caller_device'));
}
console.log('PASS: Daily private access, atomic invitations, device ownership, retries, call expiry, retained history, cleanup and secret isolation.');
