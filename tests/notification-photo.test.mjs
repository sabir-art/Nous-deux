import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const b=await build({entryPoints:['supabase/functions/house-api/notification-photo.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {notificationPhotoURL,serveNotificationPhoto}=await import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));
const photo=crypto.randomUUID(),secret='isolated-test-key',state={profiles:{0:photo}},db=async()=>[{data:'data:image/jpeg;base64,/9j/2Q=='}],getState=async()=>state;
const url=new URL(await notificationPhotoURL(state,0,'https://test.supabase.co',secret));assert(!url.href.includes(secret));assert.equal((await serveNotificationPhoto(url,secret,db,getState,{})).status,200);
for(const [key,value] of [['member','1'],['photo',crypto.randomUUID()],['expires','1'],['signature','0'.repeat(64)]]){const altered=new URL(url);altered.searchParams.set(key,value);assert.equal((await serveNotificationPhoto(altered,secret,db,getState,{})).status,404);}
assert.equal((await serveNotificationPhoto(url,'rotated-key',db,getState,{})).status,404);delete state.profiles[0];assert.equal((await serveNotificationPhoto(url,secret,db,getState,{})).status,404);assert.equal(await notificationPhotoURL(state,0,'https://test.supabase.co',secret),undefined);
console.log('PASS: narrowly signed photo URL, actor/photo/expiry/signature tampering, secret rotation and removed profile revocation.');
