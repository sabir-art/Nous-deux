import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const b=await build({entryPoints:['supabase/functions/house-api/reminders.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'npm',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));}}]});
const {claimReminders,releaseReminders,occursOn,parisClock,timeLabel,frenchList,LOG_LIMIT}=await import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));

// Europe/Paris clock, summer (UTC+2) and winter (UTC+1) time.
assert.deepEqual(parisClock(new Date('2026-10-21T17:00:00Z')),{date:'2026-10-21',minutes:19*60});
assert.deepEqual(parisClock(new Date('2026-12-10T07:00:00Z')),{date:'2026-12-10',minutes:8*60});
assert.deepEqual(parisClock(new Date('2026-10-21T22:30:00Z')),{date:'2026-10-22',minutes:30});
assert.equal(timeLabel('09:00'),'9 h');assert.equal(timeLabel('14:05'),'14 h 05');assert.equal(timeLabel(''),'');
assert.equal(frenchList(['A']),'A');assert.equal(frenchList(['A','B']),'A et B');assert.equal(frenchList(['A','B','C']),'A, B et C');assert.equal(frenchList(['A','B','C','D','E']),'A, B, C et 2 autres');

// Repetitions: same rules as the agenda (lib/calendar.ts).
const ev=(extra)=>({id:crypto.randomUUID(),title:'Test',category:'other',person:-1,status:'scheduled',date:'2026-10-08',time:'',visibility:'shared',owner:0,recurrence:'none',...extra});
assert(occursOn(ev({}),'2026-10-08'));assert(!occursOn(ev({}),'2026-10-15'));
assert(occursOn(ev({recurrence:'weekly'}),'2026-10-22'));assert(!occursOn(ev({recurrence:'weekly'}),'2026-10-23'));assert(!occursOn(ev({recurrence:'weekly'}),'2026-10-01'),'never before the first date');
assert(occursOn(ev({recurrence:'custom',intervalDays:3}),'2026-10-14'));assert(!occursOn(ev({recurrence:'custom',intervalDays:3}),'2026-10-15'));
assert(occursOn(ev({date:'2026-01-31',recurrence:'monthly'}),'2026-02-28'),'short month clamps');assert(occursOn(ev({date:'2026-01-31',recurrence:'monthly'}),'2026-04-30'));assert(!occursOn(ev({date:'2026-01-31',recurrence:'monthly'}),'2026-04-29'));
assert(occursOn(ev({date:'2024-02-29',recurrence:'yearly'}),'2026-02-28'));assert(occursOn(ev({date:'2024-02-29',recurrence:'yearly'}),'2028-02-29'));assert(!occursOn(ev({date:'2024-02-29',recurrence:'yearly'}),'2028-02-28'));
assert(!occursOn(ev({recurrence:'weekly',repeatUntil:'2026-10-20'}),'2026-10-22'),'repetition ended');
assert(!occursOn(ev({status:'done'}),'2026-10-08'));assert(!occursOn(ev({status:'to_book',date:''}),''));

// A household: Alex (0) and Camille (1), both with a phone; Alex also has a tablet with agenda reminders off.
const d0={deviceId:crypto.randomUUID(),member:0,preferences:{reminders:true,tasks:true}},d1={deviceId:crypto.randomUUID(),member:1,preferences:{}},off={deviceId:crypto.randomUUID(),member:0,preferences:{reminders:false,tasks:false}};
const dentist=ev({title:'Dentiste',category:'medical',person:0,owner:0,date:'2026-10-22',time:'10:00'});
const secret=ev({title:'Surprise pour Alex',category:'personal',person:1,owner:1,visibility:'private',date:'2026-10-22',time:'18:00'});
const mine=ev({title:'Kiné',category:'sport',person:0,owner:0,visibility:'private',date:'2026-10-22',time:'07:30'});
const sport=ev({title:'Piscine',category:'sport',owner:1,date:'2026-10-08',recurrence:'weekly',child:'kid-1'});
const marker=ev({title:'Jour férié',category:'france',date:'2026-10-22'});
const s={household:{first:'Alex',second:'Camille'},children:[{id:'kid-1',name:'Léa'}],devices:[d0,d1,off],appointments:[dentist,secret,mine,sport,marker,ev({title:'Déjà fait',status:'done',date:'2026-10-22'})],
 items:[{id:'t1',kind:'task',title:'Appeler le plombier',assignee:0,due:'2026-10-22',done:false},{id:'t2',kind:'task',title:'Arroser',assignee:-1,due:'2026-10-22',done:false},{id:'t3',kind:'task',title:'Poster le colis',assignee:1,due:'2026-10-22',done:false},{id:'t4',kind:'task',title:'Fait',assignee:0,due:'2026-10-22',done:true},{id:'t5',kind:'task',title:'Demain',assignee:0,due:'2026-10-23',done:false},{id:'s1',kind:'shopping',title:'Pain',assignee:-1,due:'2026-10-22',done:false}]};
const at=iso=>claimReminders(s,new Date(iso));
const of=(list,device,kind)=>list.filter(r=>r.device.deviceId===device.deviceId&&r.kind===kind);

// Nothing outside the windows: 18:30 Paris.
assert.equal(at('2026-10-21T16:30:00Z').length,0);
// The day before at 19:00: one grouped notification per device, own and shared events only.
const eve=at('2026-10-21T17:00:00Z');
assert.equal(of(eve,off,'eve').length,0,'preference respected');
const e0=of(eve,d0,'eve');assert.equal(e0.length,1);assert.equal(e0[0].category,'reminders');assert.equal(e0[0].view,'calendar');
assert.equal(e0[0].body,'Demain, 3 rendez-vous :\nPiscine (Léa)\n7 h 30 · Kiné\n10 h · Dentiste');
assert(!e0[0].body.includes('Surprise'),'a private event of the partner never reaches Alex');
const e1=of(eve,d1,'eve')[0];assert.equal(e1.body,'Demain, 3 rendez-vous :\nPiscine (Léa)\n10 h · Dentiste (Alex)\n18 h · Surprise pour Alex');assert(!e1.body.includes('Kiné'));
assert(!eve.some(r=>/Jour férié|Déjà fait/.test(r.body)),'holiday markers and done events are skipped');
// Idempotence: the 19:30 run and a replay send nothing again.
assert.equal(at('2026-10-21T17:30:00Z').length,0);assert.equal(at('2026-10-21T17:00:00Z').length,0);
// A failed push gives its keys back; the next run retries that device only.
releaseReminders(s,e1.keys);const retry=at('2026-10-21T17:30:00Z');assert.equal(retry.length,1);assert.equal(retry[0].device.deviceId,d1.deviceId);
// A new shared event added after 19:00 is still announced, alone.
s.appointments.push(ev({title:'Dîner chez Sam',category:'party',date:'2026-10-22',time:'20:00'}));
assert.deepEqual(at('2026-10-21T17:30:00Z').filter(r=>r.kind==='eve').map(r=>r.body),['Demain à 20 h : Dîner chez Sam','Demain à 20 h : Dîner chez Sam']);

// The morning at 08:00: what has not started yet, plus one grouped mission note per person.
const morning=at('2026-10-22T06:00:00Z');
assert.equal(of(morning,d0,'morning')[0].body,'Aujourd’hui, 3 rendez-vous :\nPiscine (Léa)\n10 h · Dentiste\n20 h · Dîner chez Sam','Kiné (7 h 30) has already started');
assert.equal(of(morning,d0,'missions')[0].body,'Aujourd’hui : Appeler le plombier et Arroser');assert.equal(of(morning,d0,'missions')[0].category,'tasks');
assert.equal(of(morning,d1,'missions')[0].body,'Aujourd’hui : Arroser et Poster le colis','« l’un de nous » reaches both');
assert.equal(of(morning,off,'missions').length,0);assert.equal(of(morning,off,'morning').length,0);
assert.equal(at('2026-10-22T06:30:00Z').length,0,'one morning note per day');
// About one hour before a health appointment (here 09:00 for 10:00), never for other categories, never twice.
const soon=at('2026-10-22T07:00:00Z');assert.deepEqual(soon.map(r=>[r.device.deviceId,r.kind,r.body]),[[d0.deviceId,'soon','Dans 1 h · 10 h · Dentiste'],[d1.deviceId,'soon','Dans 1 h · 10 h · Dentiste (Alex)']]);
assert.equal(at('2026-10-22T07:30:00Z').length,0);
// A health appointment just after midnight is reminded the evening before.
s.appointments.push(ev({title:'Urgences pédiatriques',category:'medical',owner:0,date:'2026-10-23',time:'00:30',child:'kid-1'}));
assert.deepEqual(at('2026-10-22T21:30:00Z').map(r=>r.body),['Dans 1 h · 0 h 30 · Urgences pédiatriques (Léa)','Dans 1 h · 0 h 30 · Urgences pédiatriques (Léa)']);
// When the 1-hour reminder and the morning note fall in the same run, the event is only in the 1-hour one.
s.appointments.push(ev({title:'Prise de sang',category:'medical',owner:1,date:'2026-10-24',time:'08:50'}),ev({title:'Marché',category:'home',owner:1,date:'2026-10-24',time:'11:00'}));
const sat=at('2026-10-24T06:00:00Z');assert.equal(of(sat,d0,'soon')[0].body,'Dans 50 min · 8 h 50 · Prise de sang');assert.equal(of(sat,d0,'morning')[0].body,'Aujourd’hui à 11 h : Marché');

// Winter time: 08:00 in Paris is 07:00 UTC.
const w={devices:[d0],items:[],appointments:[ev({title:'Réunion',category:'work',date:'2026-12-10',time:'14:00'})]};
assert.equal(claimReminders(w,new Date('2026-12-10T06:00:00Z')).length,0);assert.equal(claimReminders(w,new Date('2026-12-10T07:00:00Z'))[0].body,'Aujourd’hui à 14 h : Réunion');

// Bounded memory: past occurrences and removed devices are forgotten, the log never exceeds its limit.
const before=Object.keys(s.reminderLog).length;assert(before>0);
s.devices=[d0];at('2026-10-30T12:00:00Z');assert.equal(Object.keys(s.reminderLog).length,0);
const big={devices:[d0],items:[],appointments:[],reminderLog:Object.fromEntries(Array.from({length:LOG_LIMIT+50},(_,i)=>[`${d0.deviceId}|eve|${i}|2026-10-30`,'2026-10-30']))};
claimReminders(big,new Date('2026-10-30T12:00:00Z'));assert.equal(Object.keys(big.reminderLog).length,LOG_LIMIT);
console.log('PASS: agenda reminders (eve 19 h, morning 8 h, 1 h before health appointments), Europe/Paris summer and winter time, repetitions, private events of the partner excluded, preferences, grouped missions, idempotence, retries and bounded log.');
