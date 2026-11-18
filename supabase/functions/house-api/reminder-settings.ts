import {z} from 'npm:zod@3.25.76';
// Each person chooses when the scheduler reminds them (18 November 2026). The cron runs every 30 minutes,
// so every time is on the hour or the half hour; a reminder is due from its time and for the next hour,
// which leaves one retry 30 minutes later when a push fails. Stored per member in nd_state.reminderTimes;
// a missing or damaged value falls back to the default, field by field.
// The client mirror is lib/reminder-settings.ts (kept identical by tests/reminder-settings.test.mjs).
export type ReminderTimes={eve:string;morning:string;soon:number;plants:string;pets:string};
export const defaultReminderTimes:ReminderTimes={eve:'19:00',morning:'08:00',soon:60,plants:'08:00',pets:'08:00'};
// Allowed ranges, in minutes since midnight (Europe/Paris), and the « before a health appointment » delays.
export const reminderRanges={eve:[17*60,22*60+30],morning:[5*60,11*60+30],plants:[6*60,21*60+30],pets:[6*60,21*60+30]} as const;
export const soonChoices=[30,60,90,120] as const;
export const toMinutes=(time:string)=>/^([01]\d|2[0-3]):(00|30)$/.test(time)?Number(time.slice(0,2))*60+Number(time.slice(3)):null;
const halfHour=([min,max]:readonly [number,number])=>z.string().refine(t=>{const m=toMinutes(t);return m!==null&&m>=min&&m<=max;});
export const reminderTimesInput=z.object({eve:halfHour(reminderRanges.eve),morning:halfHour(reminderRanges.morning),soon:z.number().int().refine(n=>(soonChoices as readonly number[]).includes(n)),plants:halfHour(reminderRanges.plants),pets:halfHour(reminderRanges.pets)}).strict();
export type ReminderTimesState={reminderTimes?:Record<string,Partial<ReminderTimes>>};
export function reminderTimesFor(s:ReminderTimesState,member:number):ReminderTimes{
 const saved=s.reminderTimes?.[member]||{},out={...defaultReminderTimes};
 for(const k of ['eve','morning','plants','pets'] as const){const v=saved[k],m=typeof v==='string'?toMinutes(v):null;if(m!==null&&m>=reminderRanges[k][0]&&m<=reminderRanges[k][1])out[k]=v as string;}
 if((soonChoices as readonly unknown[]).includes(saved.soon))out.soon=saved.soon as number;
 return out;
}
// Only the signed-in person (actor, checked by the session) changes their own times; the partner's stay untouched.
export function reminderTimesMutation(s:ReminderTimesState,payload:unknown,actor:number){
 s.reminderTimes={...s.reminderTimes,[actor]:reminderTimesInput.parse(payload)};
 return reminderTimesFor(s,actor);
}
// True from the chosen time and for the next hour (two scheduler runs).
export const inWindow=(minutes:number,time:string)=>{const start=toMinutes(time);return start!==null&&minutes>=start&&minutes<start+60;};
