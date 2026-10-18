import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const bundle=await build({entryPoints:['supabase/functions/house-api/pets.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'npm-prefix',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));}}]});
const {petMutation,petCare}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const s={},now='2026-10-18T08:00:00Z',today='2026-10-18';
const every={food:1,walk:1,litter:0,groom:7,health:90},last={food:'2026-10-17',walk:'2026-10-17',litter:'2026-10-17',groom:'2026-10-17',health:'2026-10-17'};
const pet={id:crypto.randomUUID(),version:0,name:'Biscuit',kind:'dog',breed:'',tone:'beurre',note:'',every,last};
// Creation by Laura (1); no push for pets.
assert.equal(petMutation(s,'pet',pet,1,now,today),null);assert.equal(s.pets[0].owner,1);assert.equal(s.pets[0].version,1);
assert.deepEqual(petCare(s.pets[0],today).map(c=>c.kind),['food','walk','groom','health']);
assert.equal(petCare(s.pets[0],today).find(c=>c.kind==='food').overdue,0);
// Either person can note a care, once per day and kind, with a version check; disabled cares are refused.
petMutation(s,'pet-care',{id:pet.id,version:1,kind:'walk'},0,now,today);assert.equal(s.pets[0].last.walk,today);assert.equal(s.pets[0].careLog[0].actor,0);
assert.throws(()=>petMutation(s,'pet-care',{id:pet.id,version:2,kind:'walk'},1,now,today),e=>e.status===409);
assert.throws(()=>petMutation(s,'pet-care',{id:pet.id,version:1,kind:'food'},1,now,today),e=>e.status===409);
assert.throws(()=>petMutation(s,'pet-care',{id:pet.id,version:2,kind:'litter'},1,now,today),e=>e.status===400);
// Only the author edits or deletes; editing cannot rewrite past care dates.
assert.throws(()=>petMutation(s,'pet',{...pet,version:2,name:'Piège'},0,now,today),e=>e.status===403);
assert.throws(()=>petMutation(s,'delete-pet',{id:pet.id,version:2},0,now,today),e=>e.status===403);
petMutation(s,'pet',{...pet,version:2,name:'Biscuit II',last:{...last,walk:'2020-01-01'}},1,now,today);assert.equal(s.pets[0].name,'Biscuit II');assert.equal(s.pets[0].last.walk,today);assert.equal(s.pets[0].careLog.length,1);
assert.throws(()=>petMutation(s,'pet',{...pet,id:crypto.randomUUID(),last:{...last,food:'2099-01-01'}},1,now,today),e=>e.status===400);
assert.throws(()=>petMutation(s,'pet',{...pet,id:crypto.randomUUID(),kind:'hamster'},1,now,today));
petMutation(s,'delete-pet',{id:pet.id,version:3},1,now,today);assert.equal(s.pets.length,0);
console.log('pets ok');
