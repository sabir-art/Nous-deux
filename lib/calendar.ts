import type {Appointment} from './domain';
export const appointmentCategories={medical:'Médical',personal:'Personnel',admin:'Administratif',other:'Autre'};
const isoDate=(d:Date)=>d.toISOString().slice(0,10);
export function calendarDays(month:string):string[]{
 const first=new Date(month+'-01T12:00:00Z');
 const offset=(first.getUTCDay()+6)%7;
 const count=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0,12)).getUTCDate();
 return Array.from({length:Math.ceil((offset+count)/7)*7},(_,i)=>{
  const day=new Date(first);day.setUTCDate(1-offset+i);return isoDate(day);
 });
}
export function shiftMonth(month:string,step:number):string{
 const d=new Date(month+'-01T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+step);return isoDate(d).slice(0,7);
}
export function sortAppointments(a:Appointment,b:Appointment):number{
 return a.date.localeCompare(b.date)||(a.time||'00:00').localeCompare(b.time||'00:00')||a.title.localeCompare(b.title,'fr');
}
