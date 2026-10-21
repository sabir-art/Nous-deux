import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync,readFileSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const bundle=await build({entryPoints:['supabase/functions/house-api/model.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'npm-prefix',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));}}]});
const {householdMutation}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const s={household:null,entries:[],items:[],appointments:[],activity:[],devices:[],call:null,sequence:0};
householdMutation(s,{action:'household',payload:{first:'Alex',second:'Camille',name:'Test',budget:0,version:0}},0);
const activity=s.activity.length;
const kid={id:crypto.randomUUID(),version:0,name:'Lina',birthDate:'2024-03-02',tone:'rose',school:'Crèche',health:'',contacts:'',notes:'',needs:'',renewals:[]};
// Family features are opt-in: no profile until a parent turns them on.
assert.throws(()=>householdMutation(s,{action:'child',payload:kid},1),e=>e.status===400);
assert.equal(householdMutation(s,{action:'family-mode',payload:{enabled:true}},1),null);assert.equal(s.familyMode,true);
// A profile is optional, shared by both parents and silent (no push, no activity line).
assert.equal(householdMutation(s,{action:'child',payload:kid},1),null);assert.equal(s.children[0].owner,1);assert.equal(s.activity.length,activity);
const renewal={id:crypto.randomUUID(),title:'Chaussures',size:'Pointure 24',status:'now'};
householdMutation(s,{action:'child',payload:{...kid,version:1,sizes:'24 mois, pointure 22',renewals:[renewal]}},0);assert.equal(s.children[0].sizes,'24 mois, pointure 22');assert.equal(s.children[0].version,2);assert.equal(s.children[0].owner,1);assert.equal(s.children[0].renewals[0].status,'now');
assert.throws(()=>householdMutation(s,{action:'child',payload:{...kid,version:1}},0),e=>e.status===409);
assert.throws(()=>householdMutation(s,{action:'child',payload:{...kid,id:crypto.randomUUID(),birthDate:'2999-01-01'}},0),e=>e.status===400);
assert.throws(()=>householdMutation(s,{action:'child',payload:{...kid,id:crypto.randomUUID(),renewals:[renewal,renewal]}},0),e=>e.status===400);
// Appointments and expenses may name an existing child only.
const ap={id:crypto.randomUUID(),title:'Pédiatre',category:'medical',person:-1,child:kid.id,status:'scheduled',date:'2026-11-02',time:'',bookBy:'',location:'',note:'',visibility:'shared',version:0};
householdMutation(s,{action:'appointment',payload:ap},0);assert.equal(s.appointments[0].child,kid.id);
assert.throws(()=>householdMutation(s,{action:'appointment',payload:{...ap,id:crypto.randomUUID(),child:crypto.randomUUID()}},0),e=>e.status===400);
const ex={id:crypto.randomUUID(),kind:'expense',title:'Couches',cents:2400,member:0,category:'Enfants',child:kid.id,date:'2026-10-09',note:'',version:0};
householdMutation(s,{action:'entry',payload:ex},0);assert.equal(s.entries[0].child,kid.id);assert.equal(s.entries[0].category,'Enfants');
// A task about the child can be given to a parent; the parent it is given to can tick it, nobody else can edit it.
const task={id:crypto.randomUUID(),kind:'task',title:'Acheter des couches',quantity:'',assignee:0,due:'',priority:0,done:false,child:kid.id,version:0};
householdMutation(s,{action:'item',payload:task},1);assert.equal(s.items[0].child,kid.id);
assert.throws(()=>householdMutation(s,{action:'item',payload:{...task,version:1,title:'Piège'}},0),e=>e.status===403);
assert.equal(householdMutation(s,{action:'task-check',payload:{id:task.id,version:1,done:true}},0)?.category,'tasks');assert.equal(s.items[0].done,true);assert.equal(s.items[0].owner,1);
assert.throws(()=>householdMutation(s,{action:'item',payload:{...task,id:crypto.randomUUID(),child:crypto.randomUUID()}},1),e=>e.status===400);
const bread={id:crypto.randomUUID(),kind:'shopping',title:'Pain',quantity:'',assignee:-1,due:'',priority:0,done:false,child:kid.id,version:0};
householdMutation(s,{action:'item',payload:bread},1);assert.equal(s.items[1].child,undefined);
// Family space hidden: profiles stay, and editing a record keeps its link to the hidden child.
householdMutation(s,{action:'family-mode',payload:{enabled:false}},0);assert.equal(s.children.length,1);
householdMutation(s,{action:'appointment',payload:{...ap,version:1,title:'Pédiatre (rappel)'}},0);assert.equal(s.appointments[0].child,kid.id);
householdMutation(s,{action:'family-mode',payload:{enabled:true}},0);
// The interface follows the mode itself, not the number of profiles, and never drops a hidden child on save.
const app=readFileSync('app/house-app.tsx','utf8'),agenda=readFileSync('app/house-calendar.tsx','utf8');
assert.ok(!app.includes('family={kids.length>0}')&&app.includes('<HouseShopping family={familyMode}')&&app.includes('<BudgetOverview family={familyMode}'));
assert.ok(app.includes("!kids.length&&item?.child")&&app.includes("||!family)?entry.child")&&agenda.includes("{child:appointment.child}"));
// Each parent picks an agenda colour, never the partner's nor « nous deux ».
assert.throws(()=>householdMutation(s,{action:'agenda-color',payload:{tone:'peche'}},0),e=>e.status===400);
assert.throws(()=>householdMutation(s,{action:'agenda-color',payload:{tone:'rose'}},1),e=>e.status===400);
householdMutation(s,{action:'agenda-color',payload:{tone:'ciel'}},0);assert.equal(s.colors[0],'ciel');
householdMutation(s,{action:'agenda-color',payload:{tone:'lavande'}},1);assert.equal(s.colors[1],'lavande');
assert.throws(()=>householdMutation(s,{action:'agenda-color',payload:{tone:'lavande'}},0),e=>e.status===400);
// Only the parent who created the profile deletes it; links are then removed, records kept.
assert.throws(()=>householdMutation(s,{action:'delete-child',payload:{id:kid.id,version:2}},0),e=>e.status===403);
householdMutation(s,{action:'delete-child',payload:{id:kid.id,version:2}},1);
assert.equal(s.children.length,0);assert.equal(s.appointments[0].child,undefined);assert.equal(s.entries[0].child,undefined);assert.equal(s.items[0].child,undefined);assert.equal(s.entries.length,1);
// « Ses besoins du moment » takes what used to be « À savoir »: up to 1400 characters, notes still accepted (older screens).
const kid2={...kid,id:crypto.randomUUID(),version:0,notes:'Doudou lapin',needs:'Sieste à 13 h'};
householdMutation(s,{action:'family-mode',payload:{enabled:true}},0);householdMutation(s,{action:'child',payload:kid2},0);
householdMutation(s,{action:'child',payload:{...kid2,version:1,needs:'x'.repeat(1400),notes:''}},1);assert.equal(s.children.at(-1).needs.length,1400);assert.equal(s.children.at(-1).notes,'');
assert.throws(()=>householdMutation(s,{action:'child',payload:{...kid2,version:2,needs:'x'.repeat(1401)}},1));
const libBundle=await build({stdin:{contents:"export {childNeeds} from './lib/domain.ts';export {missionEvents,inAgendaOf,childKind,editableCategories} from './lib/calendar.ts';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',write:false});
const lib=await import('data:text/javascript;base64,'+Buffer.from(libBundle.outputFiles[0].text).toString('base64'));
assert.equal(lib.childNeeds({needs:'Sieste à 13 h',notes:'Doudou lapin'}),'Sieste à 13 h\nDoudou lapin');assert.equal(lib.childNeeds({needs:'Sieste, Doudou lapin',notes:'Doudou lapin'}),'Sieste, Doudou lapin');assert.equal(lib.childNeeds({needs:'',notes:'Doudou'}),'Doudou');
assert.equal(lib.childKind('medical'),'sante');assert.equal(lib.childKind('study'),'ecole');assert.equal(lib.childKind('sport'),'activite');assert.equal(lib.childKind('other'),'autre');
assert.ok(!lib.editableCategories.some(([id])=>id==='mission'));
// Dated missions are computed agenda events (never stored), at the assignee's or the child's colour, ticked when done.
const mk=(o)=>({id:crypto.randomUUID(),kind:'task',title:'Préparer le sac',quantity:'',assignee:1,due:'2026-10-02',priority:0,done:false,owner:0,version:1,createdAt:'',...o});
const events=lib.missionEvents([mk({child:kid2.id}),mk({assignee:-1,done:true}),mk({due:''}),{...mk({}),kind:'shopping'}]);
assert.equal(events.length,2);assert.equal(events[0].category,'mission');assert.equal(events[0].child,kid2.id);assert.equal(events[0].person,1);assert.equal(events[0].date,'2026-10-02');assert.equal(events[1].status,'done');assert.equal(events[1].person,-1);
assert.ok(lib.inAgendaOf(events[0],'1')&&!lib.inAgendaOf(events[0],'0')&&lib.inAgendaOf(events[0],'child:'+kid2.id));
assert.ok(lib.inAgendaOf(events[1],'0')&&lib.inAgendaOf(events[1],'1')&&lib.inAgendaOf(events[1],'-1'));
assert.equal(s.appointments.some(a=>a.category==='mission'),false);
assert.ok(app.includes('missionEvents(tasks)')&&app.includes('a?.taskId'));
// Turning family mode off hides profiles without deleting them.
householdMutation(s,{action:'family-mode',payload:{enabled:false}},0);assert.equal(s.familyMode,false);
console.log('PASS: optional child profiles, shared edits, version checks, child links on appointments and expenses, tasks given to a parent, opt-in family mode (hidden links kept), agenda colours, cleanup on delete, needs folding « À savoir », dated missions in the agenda.');
