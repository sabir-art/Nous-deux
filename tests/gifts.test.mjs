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
// Idées cadeaux no longer needs a switch: both of us can note ideas straight away.
// An older page may still send the former personal switch; it is accepted and changes nothing.
assert.equal(householdMutation(s,{action:'gifts-mode',payload:{enabled:false}},0),null);
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
// An idea can hang from a birthday of the agenda, only one the author can see.
const sophie={id:crypto.randomUUID(),title:'Anniversaire de Sophie',category:'birthday',visibility:'shared',owner:1};
const secretBirthday={id:crypto.randomUUID(),title:'Anniversaire de Paul',category:'birthday',visibility:'private',owner:1};
const dinner={id:crypto.randomUUID(),title:'Dîner',category:'party',visibility:'shared',owner:0};
s.appointments.push(sophie,secretBirthday,dinner);
const forSophie={id:crypto.randomUUID(),version:0,title:'Un foulard',recipient:-1,other:'Sophie',birthday:sophie.id,secret:false};
householdMutation(s,{action:'gift',payload:forSophie},0);assert.equal(s.gifts.at(-1).birthday,sophie.id);
for(const birthday of ['inconnu',dinner.id,secretBirthday.id])assert.throws(()=>householdMutation(s,{action:'gift',payload:{...forSophie,id:crypto.randomUUID(),birthday}},0),e=>e.status===400);
// Laura links a shared idea to her private birthday: Abdellah gets the idea, never the link to what he cannot see.
const forPaul={id:crypto.randomUUID(),version:0,title:'Un vinyle',recipient:-1,other:'Paul',birthday:secretBirthday.id,secret:false};
householdMutation(s,{action:'gift',payload:forPaul},1);
assert.equal(visibleGifts(s,1).find(g=>g.id===forPaul.id).birthday,secretBirthday.id);
assert.equal(visibleGifts(s,0).find(g=>g.id===forPaul.id).birthday,undefined);assert.equal(s.gifts.find(g=>g.id===forPaul.id).birthday,secretBirthday.id);
// A deleted birthday leaves the idea in place, without the link; removing the link on edit is kept.
s.appointments=s.appointments.filter(a=>a.id!==sophie.id);
const kept=visibleGifts(s,0).find(g=>g.id===forSophie.id);assert.equal(kept.title,'Un foulard');assert.equal(kept.birthday,undefined);
householdMutation(s,{action:'gift',payload:{...forSophie,birthday:undefined,version:1}},0);assert.equal(s.gifts.find(g=>g.id===forSophie.id).birthday,undefined);
// Secrets stay secret with a birthday too.
const secretForSophie={...forSophie,id:crypto.randomUUID(),version:0,birthday:undefined,secret:true};householdMutation(s,{action:'gift',payload:secretForSophie},0);
assert.ok(!visibleGifts(s,1).some(g=>g.id===secretForSophie.id));
// The interface: no home tile, no switch in Notre espace, the ideas live with the agenda's birthdays.
const app=readFileSync('app/house-app.tsx','utf8'),calendar=readFileSync('app/house-calendar.tsx','utf8'),page=readFileSync('app/house-gifts.tsx','utf8');
assert.ok(!app.includes('giftsMode')&&!app.includes("'gifts-mode'")&&!readFileSync('app/design-overviews.tsx','utf8').includes('Idées cadeaux'));
assert.ok(app.includes('<PersonGifts ')&&calendar.includes('className="gift-shortcut"')&&calendar.includes('gifts.onFor(a)'));
// A new idea starts with the person of the current filter, and the add button never depends on the list being empty.
assert.ok(page.includes("const preset:GiftPreset|undefined=filter==='all'?undefined:{who:filter};")&&/<button className="primary wide gift-add"/.test(page));
// Saving asks again whether the idea stays secret, putting the current choice first.
assert.ok(page.includes('On la garde secrète ?')&&page.includes("name=\"secret\" value={value}"));
// Each author has a bin on their own idea cards (with a confirmation); the server keeps the author-only check.
assert.ok(page.includes("save('delete-gift',{id:g.id,version:g.version},'Idée supprimée.')")&&page.includes('className="icon-button gift-delete"')&&/window\.confirm\(`Supprimer l’idée/.test(page));
console.log('gifts ok');
