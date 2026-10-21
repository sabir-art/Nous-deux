import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const bundle=await build({entryPoints:['supabase/functions/house-api/model.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'npm-prefix',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));}}]});
const {householdMutation,callMutation,deviceMutation}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const communication=await build({entryPoints:['supabase/functions/house-api/communication.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'npm-prefix',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));}}]});
const {pushesPartner}=await import('data:text/javascript;base64,'+Buffer.from(communication.outputFiles[0].text).toString('base64'));
const s={household:null,entries:[],items:[],appointments:[],activity:[],devices:[],call:null,sequence:0};
householdMutation(s,{action:'household',payload:{first:'Alex',second:'Camille',name:'Test',budget:0,version:0}},0);
const id=crypto.randomUUID();const entry={id,kind:'expense',title:'Courses',cents:12000,member:0,category:'Courses',date:'2026-10-09',note:'',version:0};
householdMutation(s,{action:'entry',payload:entry},0);assert.equal(s.entries[0].version,1);assert.equal(s.activity.length,1);
assert.throws(()=>householdMutation(s,{action:'entry',payload:entry},0),e=>e.status===409);
householdMutation(s,{action:'entry',payload:{...entry,cents:14000,version:1}},0);assert.equal(s.entries[0].cents,14000);
assert.throws(()=>householdMutation(s,{action:'entry',payload:{...entry,cents:-1}},0));
const fullId=crypto.randomUUID();const full={...entry,id:fullId,split:'full'};const findFull=()=>s.entries.find(e=>e.id===fullId);
householdMutation(s,{action:'entry',payload:full},0);assert.equal(findFull().split,'full');
householdMutation(s,{action:'entry',payload:{...full,version:1,split:'half'}},0);assert.equal(findFull().split,undefined);
assert.throws(()=>householdMutation(s,{action:'entry',payload:{...full,version:2,split:'all'}},0));
const settleId=crypto.randomUUID();householdMutation(s,{action:'entry',payload:{...entry,id:settleId,kind:'settlement',title:'Remboursement',split:'full'}},0);assert.equal(s.entries.find(e=>e.id===settleId).split,undefined);
const aid=crypto.randomUUID();const ap={id:aid,title:'Dentiste',category:'medical',person:0,status:'to_book',date:'',time:'',bookBy:'',location:'',note:'',version:0};householdMutation(s,{action:'appointment',payload:ap},1);householdMutation(s,{action:'appointment',payload:{...ap,status:'scheduled',date:'2026-10-20',time:'10:00',version:1}},1);assert.equal(s.appointments[0].status,'scheduled');
const callId=crypto.randomUUID(),one=crypto.randomUUID(),two=crypto.randomUUID(),third=crypto.randomUUID(),offer='v=0\r\nm=audio 123 RTP/AVP 0\r\n';
callMutation(s,{action:'start',id:callId,session:one,member:0,offer});assert.throws(()=>callMutation(s,{action:'start',id:crypto.randomUUID(),session:third,member:1,offer}),e=>e.status===409);
callMutation(s,{action:'answer',id:callId,session:two,member:1,answer:offer});assert.throws(()=>callMutation(s,{action:'answer',id:callId,session:third,member:1,answer:offer}),e=>e.status===409);
assert.throws(()=>callMutation(s,{action:'end',id:callId,session:third,member:1}),e=>e.status===403);callMutation(s,{action:'end',id:callId,session:two,member:1});assert.equal(s.call.offer,'');
assert.throws(()=>deviceMutation(s,{action:'subscribe',deviceId:crypto.randomUUID(),member:0,preferences:{shopping:true,tasks:true,expenses:true,calendar:true,calls:true},subscription:{endpoint:'http://127.0.0.1/private',keys:{p256dh:'x'.repeat(87),auth:'x'.repeat(22)}}}));
console.log('PASS: expense validation, stale writes, appointment planning, call participants, answer races and push endpoint restrictions.');
// Access control: visibility is shared, writes belong to the authenticated author.
assert.throws(()=>householdMutation(s,{action:'entry',payload:{...entry,version:2,member:1,owner:1}},1),e=>e.status===403);
assert.throws(()=>householdMutation(s,{action:'delete-entry',payload:{id,version:2}},1),e=>e.status===403);
// Either person may record what the other paid; the author alone can then change it.
const forPartner=crypto.randomUUID();householdMutation(s,{action:'entry',payload:{...entry,id:forPartner,version:0,member:1,owner:1}},0);
assert.equal(s.entries.find(e=>e.id===forPartner).member,1);assert.equal(s.entries.find(e=>e.id===forPartner).owner,0);
assert.throws(()=>householdMutation(s,{action:'entry',payload:{...entry,id:forPartner,version:1,member:1}},1),e=>e.status===403);
const customId=crypto.randomUUID();householdMutation(s,{action:'entry',payload:{...entry,id:customId,version:0,split:'custom',owed:3000}},0);assert.equal(s.entries.find(e=>e.id===customId).owed,3000);
assert.throws(()=>householdMutation(s,{action:'entry',payload:{...entry,id:crypto.randomUUID(),version:0,split:'custom',owed:99999}},0));
assert.throws(()=>householdMutation(s,{action:'entry',payload:{...entry,id:crypto.randomUUID(),version:0,split:'custom'}},0));
householdMutation(s,{action:'entry',payload:{...entry,id:customId,version:1,split:'half',owed:3000}},0);assert.equal(s.entries.find(e=>e.id===customId).owed,undefined);
const rentId=crypto.randomUUID();householdMutation(s,{action:'entry',payload:{...entry,id:rentId,version:0,title:'Loyer',category:'Maison',recurrence:'monthly',repeatUntil:'2027-06-30'}},0);
assert.equal(s.entries.find(e=>e.id===rentId).recurrence,'monthly');assert.equal(s.entries.find(e=>e.id===rentId).repeatUntil,'2027-06-30');
householdMutation(s,{action:'entry',payload:{...entry,id:rentId,version:1,recurrence:'none',repeatUntil:'2027-06-30'}},0);assert.equal(s.entries.find(e=>e.id===rentId).recurrence,undefined);assert.equal(s.entries.find(e=>e.id===rentId).repeatUntil,undefined);
assert.throws(()=>householdMutation(s,{action:'entry',payload:{...entry,id:crypto.randomUUID(),version:0,recurrence:'custom'}},0));
assert.throws(()=>householdMutation(s,{action:'entry',payload:{...entry,id:crypto.randomUUID(),version:0,recurrence:'monthly',repeatUntil:'2026-01-01'}},0));
const settleRepeat=crypto.randomUUID();householdMutation(s,{action:'entry',payload:{...entry,id:settleRepeat,version:0,kind:'settlement',title:'Remboursement',recurrence:'monthly'}},0);assert.equal(s.entries.find(e=>e.id===settleRepeat).recurrence,undefined);
const task={id:crypto.randomUUID(),kind:'task',title:'Test auteur',quantity:'',assignee:1,due:'',priority:0,done:false,version:0,owner:1};
householdMutation(s,{action:'item',payload:task},0);assert.equal(s.items[0].owner,0);
assert.throws(()=>householdMutation(s,{action:'item',payload:{...task,version:1,done:true}},1),e=>e.status===403);
assert.throws(()=>householdMutation(s,{action:'delete-item',payload:{id:task.id,version:1}},1),e=>e.status===403);
householdMutation(s,{action:'item',payload:{...task,version:1,done:true}},0);assert.equal(s.items[0].done,true);
s.items[0].owner=null;assert.throws(()=>householdMutation(s,{action:'delete-item',payload:{id:task.id,version:2}},0),e=>e.status===403);
assert.throws(()=>householdMutation(s,{action:'delete-appointment',payload:{id:aid,version:2}},0),e=>e.status===403);
assert.throws(()=>householdMutation(s,{action:'household',payload:{...s.household,second:'Usurpe'}},0),e=>e.status===403);
console.log('PASS: cross-account updates/deletes, forged payer/owner, legacy records and partner profile changes are denied.');
const {visibleAppointments}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const privateId=crypto.randomUUID(),privateEvent={...ap,id:privateId,status:'scheduled',date:'2026-10-10',endDate:'2026-10-15',recurrence:'yearly',visibility:'private',version:0};
let before=s.activity.length;assert.equal(householdMutation(s,{action:'appointment',payload:privateEvent},0),null);assert.equal(s.activity.length,before);
assert(visibleAppointments(s,0).some(a=>a.id===privateId));assert(!visibleAppointments(s,1).some(a=>a.id===privateId));
assert.throws(()=>householdMutation(s,{action:'appointment',payload:{...privateEvent,version:1,visibility:'shared'}},1),e=>e.status===403);
householdMutation(s,{action:'appointment',payload:{...privateEvent,version:1,visibility:'shared'}},0);assert(visibleAppointments(s,1).some(a=>a.id===privateId));assert(s.activity.some(a=>a.appointmentId===privateId));
householdMutation(s,{action:'appointment',payload:{...privateEvent,version:2,visibility:'private'}},0);assert(!s.activity.some(a=>a.appointmentId===privateId));assert(!visibleAppointments(s,1).some(a=>a.id===privateId));
assert.equal(householdMutation(s,{action:'delete-appointment',payload:{id:privateId,version:3}},0),null);
assert.throws(()=>householdMutation(s,{action:'appointment',payload:{...privateEvent,endDate:'2026-10-01'}},0));
console.log('PASS: private events excluded from partner data, activity and notification intents; sharing transitions and date validation.');
// Either member may record a purchase; server-derived attribution is immutable by the partner.
const shop={...task,id:crypto.randomUUID(),kind:'shopping',title:'Bananes',weekStart:'2026-10-05',done:false,version:0};
householdMutation(s,{action:'item',payload:shop},0);
let purchased=s.items.find(i=>i.id===shop.id);
householdMutation(s,{action:'shopping-check',payload:{id:shop.id,version:1,done:true,purchasedBy:0}},1);
assert.equal(purchased.purchasedBy,1);assert.equal(purchased.owner,0);assert.equal(purchased.done,true);
assert.throws(()=>householdMutation(s,{action:'shopping-check',payload:{id:shop.id,version:1,done:true}},0),e=>e.status===409);
assert.throws(()=>householdMutation(s,{action:'shopping-check',payload:{id:shop.id,version:2,done:false}},0),e=>e.status===403);
assert.throws(()=>householdMutation(s,{action:'item',payload:{...shop,version:2,done:false}},0),e=>e.status===400);
assert.throws(()=>householdMutation(s,{action:'item',payload:{...shop,kind:'task',version:2}},0),e=>e.status===400);
householdMutation(s,{action:'item',payload:{...shop,version:2,done:true,purchasedBy:0}},0);
purchased=s.items.find(i=>i.id===shop.id);assert.equal(purchased.purchasedBy,1);
householdMutation(s,{action:'shopping-check',payload:{id:shop.id,version:3,done:false}},1);assert.equal(purchased.purchasedBy,null);assert.equal(purchased.done,false);
const templateId=crypto.randomUUID();householdMutation(s,{action:'template-create',payload:{id:templateId,title:'Les essentiels',weekStart:'2026-10-05'}},0);
// A list type can also be written directly, without adding anything to the week.
{const before=s.items.length,id=crypto.randomUUID();householdMutation(s,{action:'template-create',payload:{id,title:'Dimanche',items:[{title:'Pain'},{title:'Lait',quantity:'2 L'}]}},1);assert.equal(s.items.length,before);assert.deepEqual(s.templates.find(t=>t.id===id).items,[{title:'Pain',quantity:''},{title:'Lait',quantity:'2 L'}]);assert.throws(()=>householdMutation(s,{action:'template-create',payload:{id:crypto.randomUUID(),title:'Vide',items:[]}},1));assert.throws(()=>householdMutation(s,{action:'template-create',payload:{id:crypto.randomUUID(),title:'Les deux',weekStart:'2026-10-05',items:[{title:'Pain'}]}},1));s.templates=s.templates.filter(t=>t.id!==id);}
assert.equal(s.templates[0].items[0].title,'Bananes');assert.equal(s.templates[0].owner,0);
const operationId=crypto.randomUUID(),beforeApply=s.items.length;
householdMutation(s,{action:'template-apply',payload:{id:templateId,operationId,weekStart:'2026-10-12',owner:0}},1);
assert.equal(s.items.length,beforeApply+1);assert.equal(s.items.at(-1).owner,1);assert.equal(s.items.at(-1).done,false);assert.equal(s.items.at(-1).weekStart,'2026-10-12');
householdMutation(s,{action:'template-apply',payload:{id:templateId,operationId,weekStart:'2026-10-12'}},1);assert.equal(s.items.length,beforeApply+1);
assert.throws(()=>householdMutation(s,{action:'template-delete',payload:{id:templateId}},1),e=>e.status===403);
assert.throws(()=>householdMutation(s,{action:'template-apply',payload:{id:templateId,operationId:crypto.randomUUID(),weekStart:'2026-10-13'}},1),e=>e.status===400);
householdMutation(s,{action:'template-delete',payload:{id:templateId}},0);assert.equal(s.templates.length,0);assert.equal(s.items.length,beforeApply+1);
const {authorizeChat,weekMonday}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
assert.equal(weekMonday('2027-01-01'),'2026-12-28');assert.equal(weekMonday('2026-10-11'),'2026-10-05');
assert.throws(()=>authorizeChat({member:0,version:2},1,2),e=>e.status===403);
assert.throws(()=>authorizeChat({member:0,version:2},0,1),e=>e.status===409);
assert.doesNotThrow(()=>authorizeChat({member:0,version:2},0,2));
{// Shopping never pushes by itself: « J'ai fini la liste » sends one notice, at most once every 2 hours per member.
const q=structuredClone(s);q.items=q.items.filter(i=>i.kind!=='shopping');q.shoppingPending={0:{updated:true}};q.shoppingFinished={};const week=weekMonday(new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Paris'}).format(new Date()));
const add=title=>householdMutation(q,{action:'item',payload:{id:crypto.randomUUID(),kind:'shopping',title,quantity:'',assignee:-1,due:'',priority:0,done:false,weekStart:week,version:0}},0);
const finish=(actor,weekStart=week)=>householdMutation(q,{action:'shopping-finished',payload:{weekStart}},actor);
assert.throws(()=>finish(0),e=>e.status===400,'nothing to buy yet');
assert.equal(pushesPartner('item'),false);assert.equal(pushesPartner('shopping-check'),false);assert.equal(add('Pain')?.category,'shopping');add('Lait');
assert.equal(householdMutation(q,{action:'shopping-done',payload:{}},0),null,'old pages: accepted, no push');assert.equal(q.shoppingPending[0],undefined);
assert.throws(()=>finish(0,'2026-10-13'),e=>e.status===400,'a Monday is required');
const note=finish(0);assert.equal(pushesPartner('shopping-finished'),true);assert.equal(note.category,'shopping');assert.equal(note.message,'a fini la liste de courses : 2 articles à acheter.');assert.equal(q.activity[0].message,note.message);
assert.throws(()=>finish(0),e=>e.status===429,'anti-spam');assert.doesNotThrow(()=>finish(1),'each member has their own limit');
q.shoppingFinished[0]=new Date(Date.now()-2*3600000-1000).toISOString();assert.equal(finish(0).category,'shopping');
for(const action of ['item','entry','appointment','delete-appointment','task-check','plant','plant-care','template-apply','shopping-batch','shopping-check','shopping-done'])assert.equal(pushesPartner(action),false,action);
for(const action of ['idea','idea-response'])assert.equal(pushesPartner(action),true,action);}
{// A birthday says whose it is (family, friends…); other events never carry that field.
const q=structuredClone(s);const b={id:crypto.randomUUID(),title:'Anniversaire de Sophie',category:'birthday',circle:'friends',person:-1,status:'scheduled',date:'2026-11-03',time:'',bookBy:'',location:'',note:'',visibility:'shared',recurrence:'yearly',version:0};
householdMutation(q,{action:'appointment',payload:{...b,recurrence:'none'}},0);assert.equal(q.appointments.find(a=>a.id===b.id).circle,'friends');assert.equal(q.appointments.find(a=>a.id===b.id).recurrence,'yearly');
householdMutation(q,{action:'appointment',payload:{...b,category:'party',version:1}},0);assert.equal(q.appointments.find(a=>a.id===b.id).circle,undefined);
assert.throws(()=>householdMutation(q,{action:'appointment',payload:{...b,id:crypto.randomUUID(),circle:'collegues'}},0));}
console.log('PASS: cross-member shopping checks, one « J’ai fini la liste » push (anti-spam), sober partner pushes, buyer integrity, status bypasses, weekly template copies, retries and author-only chat changes.');
{// A vet appointment names an existing pet; deleting the pet keeps the appointment without the link.
const q=structuredClone(s);q.petsMode=true;const pid=crypto.randomUUID();
householdMutation(q,{action:'pet',payload:{id:pid,version:0,name:'Biscuit',kind:'dog',breed:'',tone:'beurre',note:'',every:{food:1,walk:1,litter:0,groom:7,health:90},last:{food:'2026-10-01',walk:'2026-10-01',litter:'2026-10-01',groom:'2026-10-01',health:'2026-10-01'}}},0);
const vet={id:crypto.randomUUID(),title:'Vétérinaire · Biscuit',category:'medical',pet:pid,person:-1,status:'scheduled',date:'2026-10-24',time:'10:00',bookBy:'',location:'',note:'',visibility:'shared',version:0};
householdMutation(q,{action:'appointment',payload:vet},1);assert.equal(q.appointments.find(a=>a.id===vet.id).pet,pid);
assert.throws(()=>householdMutation(q,{action:'appointment',payload:{...vet,id:crypto.randomUUID(),pet:crypto.randomUUID()}},1),e=>e.status===400);
householdMutation(q,{action:'delete-pet',payload:{id:pid,version:1}},0);const kept=q.appointments.find(a=>a.id===vet.id);assert.equal(kept.pet,undefined);assert.equal(kept.version,2);}
{// A couple date is always ours: shared, for both of us, back every year.
const q=structuredClone(s);const c={id:crypto.randomUUID(),title:'Notre mariage',category:'couple',person:1,status:'scheduled',date:'2021-06-12',time:'',bookBy:'',location:'',note:'',visibility:'private',recurrence:'none',circle:'friends',version:0};
householdMutation(q,{action:'appointment',payload:c},0);const saved=q.appointments.find(a=>a.id===c.id);
assert.equal(saved.person,-1);assert.equal(saved.visibility,'shared');assert.equal(saved.recurrence,'yearly');assert.equal(saved.circle,undefined);
householdMutation(q,{action:'appointment',payload:{...c,version:1,countdown:true}},0);assert.equal(q.appointments.find(a=>a.id===c.id).countdown,true);
householdMutation(q,{action:'appointment',payload:{...c,version:2,category:'party',countdown:true}},0);assert.equal(q.appointments.find(a=>a.id===c.id).countdown,undefined);}
console.log('PASS: cross-member shopping checks, buyer integrity, status bypasses, weekly template copies, retries and author-only chat changes.');
{// The agenda reminders switch: a page cached before it keeps the device's own choice; the new page changes it.
const id=crypto.randomUUID(),old={shopping:true,tasks:true,expenses:true,calendar:true,calls:true,ideas:true,plants:true,chat:true};
const q={devices:[{deviceId:id,member:0,preferences:{...old,reminders:false},subscription:{}}]};
deviceMutation(q,{action:'preferences',deviceId:id,member:0,preferences:old});assert.equal(q.devices[0].preferences.reminders,false);
deviceMutation(q,{action:'preferences',deviceId:id,member:0,preferences:{...old,reminders:true}});assert.equal(q.devices[0].preferences.reminders,true);
assert.throws(()=>deviceMutation(q,{action:'preferences',deviceId:id,member:0,preferences:{...old,reminders:'oui'}}));
console.log('PASS: agenda reminder preference kept for pages cached before the switch.');}
