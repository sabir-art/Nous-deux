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
