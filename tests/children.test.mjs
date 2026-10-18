import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const bundle=await build({entryPoints:['supabase/functions/house-api/model.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'npm-prefix',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));}}]});
const {householdMutation}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const s={household:null,entries:[],items:[],appointments:[],activity:[],devices:[],call:null,sequence:0};
householdMutation(s,{action:'household',payload:{first:'Alex',second:'Camille',name:'Test',budget:0,version:0}},0);
const activity=s.activity.length;
const kid={id:crypto.randomUUID(),version:0,name:'Lina',birthDate:'2024-03-02',tone:'rose',school:'Crèche',health:'',contacts:'',notes:'',needs:'',renewals:[]};
// A profile is optional, shared by both parents and silent (no push, no activity line).
assert.equal(householdMutation(s,{action:'child',payload:kid},1),null);assert.equal(s.children[0].owner,1);assert.equal(s.activity.length,activity);
const renewal={id:crypto.randomUUID(),title:'Chaussures',size:'Pointure 24',status:'now'};
householdMutation(s,{action:'child',payload:{...kid,version:1,renewals:[renewal]}},0);assert.equal(s.children[0].version,2);assert.equal(s.children[0].owner,1);assert.equal(s.children[0].renewals[0].status,'now');
assert.throws(()=>householdMutation(s,{action:'child',payload:{...kid,version:1}},0),e=>e.status===409);
assert.throws(()=>householdMutation(s,{action:'child',payload:{...kid,id:crypto.randomUUID(),birthDate:'2999-01-01'}},0),e=>e.status===400);
assert.throws(()=>householdMutation(s,{action:'child',payload:{...kid,id:crypto.randomUUID(),renewals:[renewal,renewal]}},0),e=>e.status===400);
// Appointments and expenses may name an existing child only.
const ap={id:crypto.randomUUID(),title:'Pédiatre',category:'medical',person:-1,child:kid.id,status:'scheduled',date:'2026-11-02',time:'',bookBy:'',location:'',note:'',visibility:'shared',version:0};
householdMutation(s,{action:'appointment',payload:ap},0);assert.equal(s.appointments[0].child,kid.id);
assert.throws(()=>householdMutation(s,{action:'appointment',payload:{...ap,id:crypto.randomUUID(),child:crypto.randomUUID()}},0),e=>e.status===400);
const ex={id:crypto.randomUUID(),kind:'expense',title:'Couches',cents:2400,member:0,category:'Enfants',child:kid.id,date:'2026-10-09',note:'',version:0};
householdMutation(s,{action:'entry',payload:ex},0);assert.equal(s.entries[0].child,kid.id);assert.equal(s.entries[0].category,'Enfants');
// Only the parent who created the profile deletes it; links are then removed, records kept.
assert.throws(()=>householdMutation(s,{action:'delete-child',payload:{id:kid.id,version:2}},0),e=>e.status===403);
householdMutation(s,{action:'delete-child',payload:{id:kid.id,version:2}},1);
assert.equal(s.children.length,0);assert.equal(s.appointments[0].child,undefined);assert.equal(s.entries[0].child,undefined);assert.equal(s.entries.length,1);
console.log('PASS: optional child profiles, shared edits, version checks, child links on appointments and expenses, cleanup on delete.');
