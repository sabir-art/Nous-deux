import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync,readFileSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const bundle=await build({entryPoints:['supabase/functions/house-api/model.ts','supabase/functions/house-api/gifts.ts'],bundle:true,platform:'node',format:'esm',write:false,outdir:'out',plugins:[{name:'npm-prefix',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));}}]});
const load=name=>import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles.find(f=>f.path.endsWith(name)).text).toString('base64'));
const {householdMutation}=await load('model.js'),{visibleGifts}=await load('gifts.js');
const s={household:null,entries:[],items:[],appointments:[],activity:[],devices:[],call:null,sequence:0};
const secret={id:crypto.randomUUID(),version:0,title:'Montre',recipient:0,note:'',link:'',price:12000,secret:true,bought:false};
const shared={id:crypto.randomUUID(),version:0,title:'Week-end à la mer',recipient:-1,secret:false};
// Idées cadeaux is off by default: nothing can be noted until it is switched on.
assert.throws(()=>householdMutation(s,{action:'gift',payload:secret},1),e=>e.status===400);
// It is personal: Abdellah (0) switching it on does not switch it on for Laura (1).
assert.equal(householdMutation(s,{action:'gifts-mode',payload:{enabled:true}},0),null);assert.deepEqual(s.giftsMode,{0:true});
assert.throws(()=>householdMutation(s,{action:'gift',payload:secret},1),e=>e.status===400);
assert.equal(householdMutation(s,{action:'gifts-mode',payload:{enabled:true}},1),null);assert.deepEqual(s.giftsMode,{0:true,1:true});
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
// A gift can be for one of the household's children, never for an unknown one.
const kid=crypto.randomUUID();const forKid={id:crypto.randomUUID(),version:0,title:'Draisienne',recipient:-1,child:kid,secret:false};
assert.throws(()=>householdMutation(s,{action:'gift',payload:forKid},0),e=>e.status===400);
s.children=[{id:kid,name:'Enfant'}];householdMutation(s,{action:'gift',payload:forKid},0);assert.equal(s.gifts.at(-1).child,kid);
assert.throws(()=>householdMutation(s,{action:'gift',payload:{...forKid,id:crypto.randomUUID(),recipient:1}},0),e=>e.status===400);
householdMutation(s,{action:'gift',payload:{...forKid,child:undefined,version:1}},0);assert.equal(s.gifts.at(-1).child,undefined);
// Someone outside the household is a simple name, never mixed with a child or a partner.
const friend={id:crypto.randomUUID(),version:0,title:'Un bon pour un massage',recipient:-1,other:'Sophie',secret:false};
householdMutation(s,{action:'gift',payload:friend},1);assert.equal(s.gifts.at(-1).other,'Sophie');
assert.throws(()=>householdMutation(s,{action:'gift',payload:{...friend,id:crypto.randomUUID(),recipient:0}},1),e=>e.status===400);
assert.throws(()=>householdMutation(s,{action:'gift',payload:{...friend,id:crypto.randomUUID(),child:kid}},1),e=>e.status===400);
assert.throws(()=>householdMutation(s,{action:'gift',payload:{...friend,id:crypto.randomUUID(),other:'  '}},1));
// The interface follows each person's own switch everywhere: page, home tile and the + menu.
const app=readFileSync('app/house-app.tsx','utf8');
assert.ok(app.includes('const gifts=giftsMode?data?.gifts||[]:[]')&&app.includes("if(tab==='gifts'&&data&&!data.giftsMode)setTab('settings')")&&app.includes("...(giftsMode?[['gifts','Un cadeau',Gift]]")&&readFileSync('app/design-overviews.tsx','utf8').includes('{counts.giftsMode&&<CategoryTile title="Idées cadeaux"'));
console.log('gifts ok');
