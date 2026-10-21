import {defaultPreferences} from './communication.ts';
import {addDays,dayDifference} from './life.ts';
import {validDate} from './domain.ts';
// Agenda and mission reminders, computed on each run of the existing scheduler (every 30 minutes),
// always in Europe/Paris time. Nothing here is sent: the route sends what this returns and releases
// the keys of a reminder whose push failed, so the next run can try again.
//  - the day before, from 19:00: tomorrow's appointments, grouped in one notification;
//  - the same morning, from 08:00: today's appointments (one notification) and today's missions (another one);
//  - about one hour before (40 to 70 minutes) a health appointment that has a time.
// Each person only hears about what the agenda already shows them: their own events and the shared ones,
// never a private event of the partner. Every sent reminder is remembered per device, event, occurrence and kind.
type Device={deviceId:string;member:number;preferences?:Record<string,boolean>};
type Appointment={id:string;title:string;category:string;person?:number;child?:string;status?:string;date:string;time?:string;visibility?:string;owner?:number|null;recurrence?:string;intervalDays?:number;repeatUntil?:string};
type Task={id:string;kind:string;title:string;assignee:number;due:string;done:boolean};
export type ReminderState={household?:{first?:string;second?:string}|null;appointments:Appointment[];items:Task[];devices:Device[];children?:{id:string;name:string}[];reminderLog?:Record<string,string>};
export type ReminderKind='eve'|'morning'|'soon'|'missions';
export type Reminder={device:Device;kind:ReminderKind;category:'reminders'|'tasks';view:'calendar'|'tasks';title:string;body:string;tag:string;keys:string[]};
export const EVE_START=19*60,MORNING_START=8*60,WINDOW=60,SOON_MIN=40,SOON_MAX=70,LOG_LIMIT=4000;
// Built-in holiday markers are never stored as household events; refuse them anyway.
const MARKERS=new Set(['france','christian','islam','culture','jewish','world','abroad']);
const HEALTH=new Set(['medical']);
export function parisClock(now:Date){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(x=>[x.type,x.value]));
 return {date:`${p.year}-${p.month}-${p.day}`,minutes:Number(p.hour)*60+Number(p.minute)};
}
const clock=(time:string)=>/^([01]\d|2[0-3]):[0-5]\d$/.test(time)?Number(time.slice(0,2))*60+Number(time.slice(3)):null;
export const timeLabel=(time:string)=>{const m=clock(time);if(m===null)return '';const h=Math.floor(m/60),min=m%60;return min?`${h} h ${String(min).padStart(2,'0')}`:`${h} h`;};
// Same repetition rules as the agenda (lib/calendar.ts occurrences): monthly and yearly dates clamp to the
// last day of a short month; a multi-day event is reminded on its first day only.
export function occursOn(a:Appointment,date:string){
 if(!a?.date||!validDate(a.date)||a.status==='to_book'||a.status==='done'||date<a.date||a.repeatUntil&&date>a.repeatUntil)return false;
 const mode=a.recurrence||'none';
 if(mode==='none')return a.date===date;
 const diff=dayDifference(date,a.date);
 if(mode==='weekly')return diff%7===0;
 if(mode==='custom'){const n=Number.isInteger(a.intervalDays)&&a.intervalDays!>=1&&a.intervalDays!<=3650?a.intervalDays!:1;return diff%n===0;}
 const [,m,d]=a.date.split('-').map(Number),[ty,tm,td]=date.split('-').map(Number);
 if(mode==='yearly'&&tm!==m)return false;
 if(mode!=='monthly'&&mode!=='yearly')return false;
 return td===Math.min(d,new Date(Date.UTC(ty,tm,0)).getUTCDate());
}
// What the agenda shows this member: own events (private or not) and shared ones.
export const visibleTo=(a:Appointment,member:number)=>a.visibility!=='private'||a.owner===member;
const more=(n:number)=>`et ${n} autre${n>1?'s':''}`;
const list=(lines:string[],max:number)=>lines.length>max?[...lines.slice(0,max),more(lines.length-max)]:lines;
// « A, B et C », « A, B, C et 2 autres ».
export const frenchList=(items:string[],max=3)=>items.length>max?items.slice(0,max).join(', ')+' '+more(items.length-max):items.length>1?items.slice(0,-1).join(', ')+' et '+items[items.length-1]:items[0]||'';
export function claimReminders(s:ReminderState,now=new Date()):Reminder[]{
 const {date:today,minutes}=parisClock(now),tomorrow=addDays(today,1);
 const log=(s.reminderLog??={}),out:Reminder[]=[];
 const names=[s.household?.first||'',s.household?.second||''],kids=new Map((s.children||[]).map(c=>[c.id,c.name]));
 const eve=minutes>=EVE_START&&minutes<EVE_START+WINDOW,morning=minutes>=MORNING_START&&minutes<MORNING_START+WINDOW;
 for(const d of s.devices||[]){
  if(d.member!==0&&d.member!==1)continue;
  const prefs={...defaultPreferences,...d.preferences};
  const key=(kind:ReminderKind,id:string,day:string)=>`${d.deviceId}|${kind}|${id}|${day}`;
  const who=(a:Appointment)=>a.child&&kids.has(a.child)?` (${kids.get(a.child)})`:(a.person===0||a.person===1)&&a.person!==d.member&&names[a.person]?` (${names[a.person]})`:'';
  const line=(a:Appointment)=>(a.time&&timeLabel(a.time)?timeLabel(a.time)+' · ':'')+a.title+who(a);
  const push=(kind:ReminderKind,keys:string[],r:Omit<Reminder,'device'|'kind'|'keys'>)=>{for(const k of keys)log[k]=k.slice(-10);out.push({device:d,kind,keys,...r});};
  if(prefs.reminders){
   const mine=(s.appointments||[]).filter(a=>a&&typeof a.id==='string'&&!MARKERS.has(a.category)&&visibleTo(a,d.member));
   const on=(day:string)=>mine.filter(a=>occursOn(a,day)).sort((a,b)=>(a.time||'').localeCompare(b.time||'')||a.title.localeCompare(b.title,'fr'));
   // About one hour before a health appointment, today or just after midnight.
   const soon=[today,tomorrow].flatMap(day=>on(day).filter(a=>HEALTH.has(a.category)&&clock(a.time||'')!==null).map(a=>({a,day,until:dayDifference(day,today)*1440+clock(a.time!)!-minutes}))).filter(x=>x.until>=SOON_MIN&&x.until<=SOON_MAX&&!log[key('soon',x.a.id,x.day)]);
   for(const {a,day,until} of soon)push('soon',[key('soon',a.id,day)],{category:'reminders',view:'calendar',title:'⏰ Rendez-vous santé bientôt',body:`${until>=55?'Dans 1 h':`Dans ${until} min`} · ${line(a)}`,tag:`nousdeux-soon-${a.id}-${day}`});
   const group=(kind:'eve'|'morning',day:string,events:Appointment[])=>{
    const fresh=events.filter(a=>!log[key(kind,a.id,day)]);if(!fresh.length)return;
    const when=kind==='eve'?'Demain':'Aujourd’hui';
    const body=fresh.length===1?`${when}${fresh[0].time&&timeLabel(fresh[0].time)?' à '+timeLabel(fresh[0].time):''} : ${fresh[0].title}${who(fresh[0])}`:`${when}, ${fresh.length} rendez-vous :\n`+list(fresh.map(line),4).join('\n');
    push(kind,fresh.map(a=>key(kind,a.id,day)),{category:'reminders',view:'calendar',title:kind==='eve'?'📅 Demain dans notre agenda':'☀️ Aujourd’hui dans notre agenda',body,tag:`nousdeux-${kind}-${day}`});
   };
   if(eve)group('eve',tomorrow,on(tomorrow));
   // The morning note skips what has already started and what the 1-hour reminder covers.
   if(morning)group('morning',today,on(today).filter(a=>{const t=clock(a.time||'');return (t===null||t>minutes)&&!log[key('soon',a.id,today)];}));
  }
  if(prefs.tasks&&morning&&!log[key('missions','day',today)]){
   const tasks=(s.items||[]).filter(t=>t&&t.kind==='task'&&!t.done&&t.due===today&&(t.assignee===d.member||t.assignee!==0&&t.assignee!==1));
   if(tasks.length)push('missions',[key('missions','day',today)],{category:'tasks',view:'tasks',title:'✅ Les missions du jour',body:'Aujourd’hui : '+frenchList(tasks.map(t=>t.title)),tag:`nousdeux-missions-${today}`});
  }
 }
 // Bounded memory: forget past occurrences and removed devices, and never keep more than LOG_LIMIT keys.
 const oldest=addDays(today,-2),devices=new Set((s.devices||[]).map(d=>d.deviceId));
 for(const [k,day] of Object.entries(log))if(day<oldest||!devices.has(k.split('|')[0]))delete log[k];
 const keys=Object.keys(log);if(keys.length>LOG_LIMIT)for(const k of keys.sort((a,b)=>log[a].localeCompare(log[b])).slice(0,keys.length-LOG_LIMIT))delete log[k];
 return out;
}
// A push that failed gives its keys back so the next run (30 minutes later) can retry.
export function releaseReminders(s:ReminderState,keys:string[]){for(const k of keys)if(s.reminderLog)delete s.reminderLog[k];}
