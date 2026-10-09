import assert from 'node:assert/strict';
import {calendarDays,shiftMonth,sortAppointments} from '../lib/calendar.ts';
assert.deepEqual([calendarDays('2026-02')[0],calendarDays('2026-02').at(-1)],['2026-01-26','2026-03-01']);
assert.equal(calendarDays('2028-02').includes('2028-02-29'),true);
assert.equal(calendarDays('2026-02').includes('2026-02-29'),false);
assert.equal(calendarDays('2026-03').length,42);
assert.equal(calendarDays('2021-02').length,28);
assert.equal(shiftMonth('2026-12',1),'2027-01');assert.equal(shiftMonth('2026-01',-1),'2025-12');
for(const month of ['2026-03','2026-10','2028-02']){
 const days=calendarDays(month);assert.equal(days.length%7,0);assert.equal(new Set(days).size,days.length);
 assert.equal(new Date(days[0]+'T12:00:00Z').getUTCDay(),1);
 for(let i=1;i<days.length;i++)assert.equal(new Date(days[i]+'T12:00:00Z')-new Date(days[i-1]+'T12:00:00Z'),86400000);
}
const events=[{date:'2026-10-08',time:'08:00',title:'c'},{date:'2026-10-07',time:'15:00',title:'b'},{date:'2026-10-07',time:'',title:'a'}];
assert.deepEqual(events.sort(sortAppointments).map(x=>x.title),['a','b','c']);
console.log('PASS: Monday-first grids, leap years, year changes, daylight saving boundaries and appointment ordering.');
const {occurrences,onDay}=await import('../lib/calendar.ts');
const {holidays}=await import('../lib/holidays.ts');
const base={id:'test',date:'2026-04-07',title:'Anniversaire',status:'scheduled',time:'',recurrence:'yearly'};
let series=occurrences([base],'2027-01-01','2028-12-31');assert.deepEqual(series.map(x=>x.date),['2027-04-07','2028-04-07']);assert.equal(series[0].original,base);
assert.deepEqual(occurrences([{...base,date:'2028-02-29'}],'2029-01-01','2032-12-31').map(x=>x.date),['2029-02-28','2030-02-28','2031-02-28','2032-02-29']);
assert.deepEqual(occurrences([{...base,date:'2026-01-31',recurrence:'monthly'}],'2026-02-01','2026-03-31').map(x=>x.date),['2026-02-28','2026-03-31']);
assert.deepEqual(occurrences([{...base,date:'2026-10-05',recurrence:'weekly',repeatUntil:'2026-10-19'}],'2026-10-01','2026-11-01').map(x=>x.date),['2026-10-05','2026-10-12','2026-10-19']);
series=occurrences([{...base,date:'2026-12-30',endDate:'2027-01-03',recurrence:'none'}],'2027-01-01','2027-01-31');assert.equal(series.length,1);assert.equal(onDay(series[0],'2027-01-02'),true);assert.equal(onDay(series[0],'2027-01-04'),false);
assert.equal(new Set(holidays.map(x=>x.id)).size,holidays.length);
for(const y of ['2026','2027'])assert.equal(holidays.filter(x=>x.date.startsWith(y)&&x.holidayGroups.includes('france')).length,11);
assert(holidays.some(x=>x.title==='Pâques'&&x.date==='2027-03-28'));
assert(holidays.filter(x=>x.category==='islam'&&x.date.startsWith('2027')).every(x=>x.provisional));
console.log('PASS: annual birthdays, leap days, monthly clamping, weekly limits, multi-day trips and reference holidays.');
