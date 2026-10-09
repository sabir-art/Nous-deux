import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,readdir} from 'node:fs/promises';
import {realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
const require=createRequire(realpathSync('node_modules/wrangler/package.json'));
const {build}=require('esbuild');const {Miniflare}=require('miniflare');
const setupToken='test-only-bootstrap-not-a-production-secret';
const compiled=await build({stdin:{contents:`import {AsyncLocalStorage} from 'node:async_hooks';import * as access from './app/api/access/route';import * as home from './app/api/household/route';import * as calls from './app/api/calls/route';import * as notifications from './app/api/notifications/route';const ctx=new AsyncLocalStorage();globalThis.__ctx=ctx;export default {fetch(r){return ctx.run(r.headers,()=>{const p=new URL(r.url).pathname;const handler=p==='/api/access'?access:p==='/api/calls'?calls:p==='/api/notifications'?notifications:home;return r.method==='GET'?handler.GET():handler.POST(r);});}}`,resolveDir:process.cwd(),loader:'ts'},bundle:true,format:'esm',platform:'neutral',external:['cloudflare:workers','node:async_hooks'],write:false,plugins:[{name:'next-headers',setup(b){b.onResolve({filter:/^next\/headers$/},()=>({path:'headers',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const headers=async()=>globalThis.__ctx.getStore();'}));}}]});
const mf=new Miniflare({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'auth-test'},bindings:{HOUSEHOLD_OWNER_ID:'existing-owner',HOUSE_SETUP_HASH:createHash('sha256').update(setupToken).digest('hex')}});
try{
 const db=await mf.getD1Database('DB');for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())for(const sql of (await readFile('drizzle/'+file,'utf8')).split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))await db.prepare(sql).run();
 await db.prepare("INSERT INTO households VALUES ('existing-owner','Alex','Camille','Notre maison',0,1)").run();
 const request=(path,body,cookie='',extra={})=>mf.dispatchFetch('https://unit.test'+path,{method:body?'POST':'GET',headers:{origin:'https://unit.test','Content-Type':'application/json',cookie,...extra},...(body?{body:JSON.stringify(body)}:{})});
 for(const p of ['/api/household','/api/calls','/api/notifications']){
  assert.equal((await request(p)).status,401);
  assert.equal((await request(p,null,'',{'oai-authenticated-user-id':'existing-owner','oai-authenticated-user-email':'fake@example.test'})).status,401);
 }
 assert.equal((await request('/api/access',{action:'setup',setupToken:'bad',password:'a-long-test-password'})).status,403);
 assert.equal((await request('/api/access',{action:'setup',setupToken,password:'short'})).status,400);
 assert.equal((await request('/api/access',{action:'setup',setupToken,password:'a-long-test-password'},'',{origin:'https://evil.test'})).status,403);
 let r=await request('/api/access',{action:'setup',setupToken,password:'a-long-test-password'});assert.equal(r.status,200);const c1=r.headers.get('set-cookie');assert.match(c1,/HttpOnly; Secure; SameSite=Strict/);const first=c1.split(';')[0];
 assert.equal((await request('/api/access',{action:'setup',setupToken,password:'a-long-test-password'})).status,409);
 assert.equal((await request('/api/access',{action:'login',password:'wrong-long-password'})).status,401);
 r=await request('/api/access',{action:'login',password:'a-long-test-password'});assert.equal(r.status,200);const second=r.headers.get('set-cookie').split(';')[0];assert.notEqual(first,second);
 for(const c of [first,second]){r=await request('/api/household',null,c);assert.equal(r.status,200);assert.equal((await r.json()).household.name,'Notre maison');}
 const payload={action:'item',payload:{id:crypto.randomUUID(),kind:'shopping',title:'Pain',quantity:'1',assignee:-1,due:'',priority:0,done:false,version:0}};
 // Existing validation uses "shopping" or "task"; verify cross-device writes.
 r=await request('/api/household',payload,first);assert.equal(r.status,200,await r.text());
 r=await request('/api/household',null,second);assert.equal((await r.json()).items[0].title,'Pain');
 assert.equal((await request('/api/access',{action:'logout'},first)).status,200);assert.equal((await request('/api/household',null,first)).status,401);assert.equal((await request('/api/household',null,second)).status,200);
 await db.prepare('UPDATE house_sessions SET expires_at = 0').run();assert.equal((await request('/api/household',null,second)).status,401);
 for(let i=0;i<16;i++)r=await request('/api/access',{action:'login',password:'wrong-long-password'},'',{'cf-connecting-ip':'192.0.2.42'});assert.equal(r.status,429);
 console.log('PASS: private APIs, spoofed identity rejection, bootstrap, two devices, shared writes, logout, expiry and persistent throttling.');
}finally{await mf.dispose();}
