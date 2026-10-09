import {today} from './domain';
export function weekStart(date=today()){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10);}
export function shiftWeek(week:string,amount:number){const d=new Date(week+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+amount*7);return d.toISOString().slice(0,10);}
export function weekLabel(week:string){const end=new Date(week+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+6);const f=new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short'});return `${f.format(new Date(week+'T12:00:00Z'))} – ${f.format(end)}`;}
