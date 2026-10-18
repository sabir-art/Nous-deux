import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const bundle=await build({entryPoints:['supabase/functions/house-api/model.ts','supabase/functions/house-api/gifts.ts'],bundle:true,platform:'node',format:'esm',write:false,outdir:'out',plugins:[{name:'npm-prefix',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));}}]});
const load=name=>import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles.find(f=>f.path.endsWith(name)).text).toString('base64'));
const {householdMutation}=await load('model.js'),{visibleGifts}=await load('gifts.js');
const s={household:null,entries:[],items:[],appointments:[],activity:[],devices:[],call:null,sequence:0};
const secret={id:crypto.randomUUID(),version:0,title:'Montre',recipient:0,note:'',link:'',price:12000,secret:true,bought:false};
const shared={id:crypto.randomUUID(),version:0,title:'Week-end à la mer',recipient:-1,secret:false};
// Laura (1) notes a secret idea for Abdellah (0) and a shared one; no push, no activity.
assert.equal(householdMutation(s,{action:'gift',payload:secret},1),null);
assert.equal(householdMutation(s,{action:'gift',payload:shared},1),null);
assert.equal(s.activity.length,0);assert.equal(s.gifts.length,2);assert.equal(s.gifts[0].owner,1);assert.equal(s.gifts[0].version,1);
// The partner never receives the secret; its author does.
assert.deepEqual(visibleGifts(s,0).map(g=>g.title),['Week-end à la mer']);
assert.deepEqual(visibleGifts(s,1).map(g=>g.title),['Montre','Week-end à la mer']);
// The partner cannot touch or even detect the secret one, nor edit someone else's shared idea.
assert.throws(()=>householdMutation(s,{action:'gift',payload:{...secret,version:1,title:'Piège'}},0),e=>e.status===404);
assert.throws(()=>householdMutation(s,{action:'delete-gift',payload:{id:secret.id,version:1}},0),e=>e.status===404);
assert.throws(()=>householdMutation(s,{action:'gift',payload:{...shared,version:1,bought:true}},0),e=>e.status===403);
// The author can mark it bought, with version checks; stale versions are refused.
householdMutation(s,{action:'gift',payload:{...secret,version:1,bought:true}},1);assert.equal(s.gifts[0].bought,true);assert.equal(s.gifts[0].version,2);
assert.throws(()=>householdMutation(s,{action:'gift',payload:{...secret,version:1}},1),e=>e.status===409);
assert.throws(()=>householdMutation(s,{action:'gift',payload:{...secret,id:crypto.randomUUID(),link:'javascript:alert(1)'}},1));
householdMutation(s,{action:'delete-gift',payload:{id:secret.id,version:2}},1);assert.equal(s.gifts.length,1);
console.log('gifts ok');
