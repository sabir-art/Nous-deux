// Client copy of supabase/functions/house-api/reminder-settings.ts (defaults, ranges and choices):
// tests/reminder-settings.test.mjs checks that both stay identical. The server validates every value.
export type ReminderTimes={eve:string;morning:string;soon:number;plants:string;pets:string};
export const defaultReminderTimes:ReminderTimes={eve:'19:00',morning:'08:00',soon:60,plants:'08:00',pets:'08:00'};
export const reminderRanges={eve:[17*60,22*60+30],morning:[5*60,11*60+30],plants:[6*60,21*60+30],pets:[6*60,21*60+30]} as const;
export const soonChoices=[30,60,90,120] as const;
// Every half hour of a range, as « 08:00 » values with « 8 h » / « 8 h 30 » labels.
export function halfHours([min,max]:readonly [number,number]){
 const out:{value:string;label:string}[]=[];
 for(let m=min;m<=max;m+=30){const h=Math.floor(m/60),mm=m%60;out.push({value:`${String(h).padStart(2,'0')}:${mm?'30':'00'}`,label:mm?`${h} h 30`:`${h} h`});}
 return out;
}
export const soonLabel=(m:number)=>m<60?`${m} min avant`:`${Math.floor(m/60)} h${m%60?' '+String(m%60).padStart(2,'0'):''} avant`;
