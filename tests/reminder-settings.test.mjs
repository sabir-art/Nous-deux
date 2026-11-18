import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const bundle=async(entry,loader)=>{const b=await build({entryPoints:[entry],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'npm',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));}}]});return import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));};
const server=await bundle('supabase/functions/house-api/reminder-settings.ts');
const client=await bundle('lib/reminder-settings.ts');
const {claimReminders,delayLabel}=await bundle('supabase/functions/house-api/reminders.ts');
const {claimPlantReminders,deviceMutation}=await bundle('supabase/functions/house-api/model.ts');
const {preferenceInput,defaultPreferences,pushTargets,pushService}=await bundle('supabase/functions/house-api/communication.ts');
const clientPrefs=await bundle('lib/communication.ts');

// The client copy shows exactly the server's defaults, ranges and choices.
for(const k of ['defaultReminderTimes','reminderRanges','soonChoices'])assert.deepEqual(client[k],server[k],k+' identical on both sides');
assert.deepEqual(clientPrefs.defaultPreferences,defaultPreferences);
assert.deepEqual(server.defaultReminderTimes,{eve:'19:00',morning:'08:00',soon:60,plants:'08:00',pets:'08:00'},'plants at 08:00 by default (was 09:00)');
assert.deepEqual(client.halfHours([8*60,9*60]),[{value:'08:00',label:'8 h'},{value:'08:30',label:'8 h 30'},{value:'09:00',label:'9 h'}]);
assert.equal(client.soonLabel(90),'1 h 30 avant');assert.equal(client.soonLabel(30),'30 min avant');assert.equal(delayLabel(120),'2 h');

// Validation: half hours only, inside each range, known delays, no extra field; per member, partner untouched.
const s={reminderTimes:{1:{eve:'20:30'}}};
const good={eve:'21:00',morning:'07:30',soon:90,plants:'18:00',pets:'07:00'};
assert.deepEqual(server.reminderTimesMutation(s,good,0),good);assert.deepEqual(s.reminderTimes[1],{eve:'20:30'},'the partner keeps their times');
for(const bad of [{...good,eve:'21:15'},{...good,eve:'12:00'},{...good,morning:'23:00'},{...good,soon:45},{...good,plants:'5:00'},{...good,extra:1},{eve:'19:00'}])assert.throws(()=>server.reminderTimesMutation(s,bad,0),undefined,JSON.stringify(bad));
assert.deepEqual(s.reminderTimes[0],good,'a refused change keeps the saved times');
// Damaged stored values fall back field by field.
assert.deepEqual(server.reminderTimesFor({reminderTimes:{0:{eve:'25:00',morning:'06:30',soon:7,plants:'x'}}},0),{eve:'19:00',morning:'06:30',soon:60,plants:'08:00',pets:'08:00'});
assert.deepEqual(server.reminderTimesFor({},1),server.defaultReminderTimes);

// Agenda reminders at each person's own times. Alex: eve 21:00, morning 07:30, 90 min before a health appointment.
const ev=(extra)=>({id:crypto.randomUUID(),title:'Test',category:'other',person:-1,status:'scheduled',date:'2026-10-22',time:'',visibility:'shared',owner:0,recurrence:'none',...extra});
const d0={deviceId:crypto.randomUUID(),member:0,preferences:{}},d1={deviceId:crypto.randomUUID(),member:1,preferences:{}};
const house={household:{first:'Alex',second:'Camille'},devices:[d0,d1],items:[{id:'t',kind:'task',title:'Sortir les poubelles',assignee:-1,due:'2026-10-22',done:false}],appointments:[ev({title:'Dentiste',category:'medical',time:'10:00'}),ev({title:'Cinéma',category:'party',time:'20:00'})],reminderTimes:{0:good}};
const at=iso=>claimReminders(house,new Date(iso)).map(r=>[r.device.member,r.kind,r.body]);
assert.deepEqual(at('2026-10-21T17:00:00Z'),[[1,'eve','Demain, 2 rendez-vous :\n10 h · Dentiste\n20 h · Cinéma']],'19:00: only Camille (default)');
assert.deepEqual(at('2026-10-21T19:00:00Z'),[[0,'eve','Demain, 2 rendez-vous :\n10 h · Dentiste\n20 h · Cinéma']],'21:00: Alex');
assert.deepEqual(at('2026-10-21T19:30:00Z'),[],'never twice');
assert.deepEqual(at('2026-10-22T05:30:00Z'),[[0,'morning','Aujourd’hui, 2 rendez-vous :\n10 h · Dentiste\n20 h · Cinéma'],[0,'missions','Aujourd’hui : Sortir les poubelles']],'07:30: Alex, with the missions');
assert.deepEqual(at('2026-10-22T06:00:00Z'),[[1,'morning','Aujourd’hui, 2 rendez-vous :\n10 h · Dentiste\n20 h · Cinéma'],[1,'missions','Aujourd’hui : Sortir les poubelles']],'08:00: Camille (default)');
assert.deepEqual(at('2026-10-22T06:30:00Z'),[[0,'soon','Dans 1 h 30 · 10 h · Dentiste']],'08:30: 90 min before for Alex');
assert.deepEqual(at('2026-10-22T07:00:00Z'),[[1,'soon','Dans 1 h · 10 h · Dentiste']],'09:00: 1 h before for Camille');

// Pets: one grouped note of today's due cares, at each person's time, only with « Nos compagnons » on.
const today='2026-10-22',yesterday='2026-10-21',long='2026-09-01';
const pet=(name,every,last,log=[])=>({id:crypto.randomUUID(),owner:0,name,kind:'dog',breed:'',tone:'beurre',note:'',every:{food:0,walk:0,litter:0,groom:0,health:0,...every},last:{food:long,walk:long,litter:long,groom:long,health:long,...last},version:1,createdAt:'',careLog:log});
const pets={household:{first:'Alex',second:'Camille'},devices:[d0,d1,{deviceId:crypto.randomUUID(),member:1,preferences:{pets:false}}],items:[],appointments:[],petsMode:false,reminderTimes:{0:good},
 pets:[pet('Biscuit',{walk:1,food:1},{walk:yesterday,food:today}),pet('Moustache',{litter:2,groom:30},{litter:'2026-10-20',groom:'2026-10-10'}),pet('Noté',{walk:1},{walk:yesterday},[{kind:'walk',actor:1,date:today,at:''}])]};
const petsAt=iso=>claimReminders(pets,new Date(iso)).filter(r=>r.kind==='pets').map(r=>[r.device.member,r.title,r.body,r.view,r.category]);
assert.deepEqual(petsAt('2026-10-22T06:00:00Z'),[],'Nos compagnons off: nothing');
pets.petsMode=true;
assert.deepEqual(petsAt('2026-10-22T05:00:00Z'),[[0,'🐾 Les soins de nos compagnons','Aujourd’hui : Biscuit (promenade) et Moustache (litière)','pets','pets']],'07:00 for Alex');
assert.deepEqual(petsAt('2026-10-22T05:30:00Z'),[],'once a day');
assert.deepEqual(petsAt('2026-10-22T06:00:00Z').map(r=>r[0]),[1],'08:00 for Camille, not on her device with pets off');
pets.pets.forEach(p=>{p.last={...p.last,walk:today,litter:today};});
assert.deepEqual(claimReminders({...pets,reminderLog:{}},new Date('2026-10-23T06:00:00Z')).filter(r=>r.kind==='pets').map(r=>r.device.member),[1],'the next day at 08:00, Camille again (Alex is at 07:00)');
assert.deepEqual(claimReminders({...pets,pets:[pet('Calme',{groom:30},{groom:today})],reminderLog:{}},new Date('2026-10-22T06:00:00Z')).filter(r=>r.kind==='pets').length,0,'nothing due: no note');

// Plants: 08:00 by default, each person's own time, once a day.
const plantHouse={devices:[d0,d1],reminderTimes:{1:{plants:'18:30'}},plants:[{id:'p',owner:0,remindBoth:true,reminders:true,waterEvery:3,lightEvery:0,feedEvery:0,lastWater:'2026-10-01',lastLight:'2026-10-01',lastFeed:'2026-10-01'}]};
assert.deepEqual(claimPlantReminders(plantHouse,today,7*60+30).length,0,'07:30: not yet');
assert.deepEqual(claimPlantReminders(plantHouse,today,8*60).map(x=>x.device.member),[0],'08:00: Alex (default)');
assert.deepEqual(claimPlantReminders(plantHouse,today,8*60+30).length,0,'never twice');
assert.deepEqual(claimPlantReminders(plantHouse,today,18*60+30).map(x=>x.device.member),[1],'18:30: Camille');

// A pet switch from a page cached before it existed is kept; one record per push address.
assert.equal(preferenceInput.parse({shopping:true,tasks:true,expenses:true,calendar:true,calls:true}).pets,true,'pets on by default');
const sub=e=>({endpoint:'https://fcm.googleapis.com/fcm/send/'+e,keys:{p256dh:'A'.repeat(87),auth:'B'.repeat(22)}});
const devState={devices:[{deviceId:crypto.randomUUID(),member:0,preferences:{...defaultPreferences,pets:false},subscription:sub('same')}]};
const fresh=crypto.randomUUID();
deviceMutation(devState,{action:'preferences',deviceId:devState.devices[0].deviceId,member:0,preferences:{shopping:true,tasks:true,expenses:true,calendar:true,calls:true}});assert.equal(devState.devices[0].preferences.pets,false,'cached page keeps the pets switch');
deviceMutation(devState,{action:'subscribe',deviceId:fresh,member:1,preferences:defaultPreferences,subscription:sub('same')});
assert.deepEqual(devState.devices.map(d=>[d.deviceId,d.member]),[[fresh,1]],'same browser after a new login: the old record is replaced, not duplicated');
// refresh: a renewed push address or a new device id updates the known record; an unknown browser is not subscribed.
assert.deepEqual(deviceMutation(devState,{action:'refresh',deviceId:fresh,member:1,subscription:sub('renewed')}),{enabled:true});assert.equal(devState.devices[0].subscription.endpoint,sub('renewed').endpoint);
const relog=crypto.randomUUID();assert.deepEqual(deviceMutation(devState,{action:'refresh',deviceId:relog,member:1,subscription:sub('renewed')}),{enabled:true});assert.deepEqual(devState.devices.map(d=>d.deviceId),[relog]);
assert.deepEqual(deviceMutation(devState,{action:'refresh',deviceId:crypto.randomUUID(),member:1,subscription:sub('stranger')}),{enabled:false});assert.equal(devState.devices.length,1);
assert.deepEqual(pushTargets([{id:1,subscription:{endpoint:'a'}},{id:2,subscription:{endpoint:'b'}},{id:3,subscription:{endpoint:'a'}}]).map(d=>d.id),[2,3],'one push per address, newest record');
assert.equal(pushService('https://web.push.apple.com/x'),'apple');assert.equal(pushService('https://fcm.googleapis.com/fcm/send/x'),'google');assert.equal(pushService('nope'),'other');
console.log('PASS: per-person reminder times (half hours, ranges, partner untouched, damaged values fall back), client copy identical, agenda/mission/plant/pet reminders at each person\'s time, grouped pet cares, pets switch kept for cached pages, one device record per push address.');
