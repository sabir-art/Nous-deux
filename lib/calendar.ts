import type {Appointment} from './domain';
export const appointmentCategories={medical:'Médical',personal:'Personnel',admin:'Administratif',work:'Travail',holiday:'Vacances',travel:'Voyage',birthday:'Anniversaire',couple:'Notre histoire',party:'Soirée / sortie',absence:'Absence',family:'Famille',sport:'Sport / bien-être',study:'Études / formation',home:'Maison',other:'Autre',france:'Jours fériés · France',christian:'Fêtes chrétiennes',islam:'Repères musulmans',culture:'Fêtes et traditions',jewish:'Fêtes juives',world:'Fêtes du monde',abroad:'Jours fériés · autres pays'};
// Whose birthday it is: close family, wider family, friends of both of us, or the author's own friends.
export const birthdayCircles={close:'Famille proche',family:'Famille',friends:'Amis communs',mine:'Mes amis'} as const;
export const circleLabel=(a:{circle?:keyof typeof birthdayCircles;owner?:number|null},names:string[])=>a.circle==='mine'?(a.owner!=null?`Amis de ${names[a.owner]}`:'Amis'):a.circle?birthdayCircles[a.circle]:'';
// The couple's own important dates, each one comes back every year.
export const coupleMoments={meeting:'Notre rencontre',together:'Notre mise en couple',engagement:'Nos fiançailles',pacs:'Notre PACS',wedding:'Notre mariage'} as const;
export const yearsSince=(start:string,on:string)=>Number(on.slice(0,4))-Number(start.slice(0,4));
export const editableCategories=Object.entries(appointmentCategories).filter(([id])=>!['france','christian','islam','culture','jewish','world','abroad','couple'].includes(id));
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

const dayMs=86400000;
export function addDays(date:string,n:number){return isoDate(new Date(Date.parse(date+'T12:00:00Z')+n*dayMs));}
// Instances are for display only. Editing always opens the original series.
// Monthly/yearly dates clamp to the last day (29 Feb becomes 28 Feb).
export function occurrences(events:Appointment[],from:string,to:string):Appointment[]{
 const result:Appointment[]=[];
 for(const a of events){
  if(!a.date||a.status==='to_book')continue;
  const span=a.endDate?Math.max(0,Math.round((Date.parse(a.endDate)-Date.parse(a.date))/dayMs)):0;
  const first=addDays(from,-span),mode=a.recurrence||'none';
  const interval=mode==='weekly'?7:mode==='custom'&&Number.isInteger(a.intervalDays)&&a.intervalDays!>=1&&a.intervalDays!<=3650?a.intervalDays!:1;
  const [y,m,d]=a.date.split('-').map(Number),[fy,fm]=first.split('-').map(Number);
  let n=mode==='yearly'?Math.max(0,fy-y-1):mode==='monthly'?Math.max(0,(fy-y)*12+fm-m-1):(mode==='weekly'||mode==='custom')?Math.max(0,Math.floor((Date.parse(first)-Date.parse(a.date))/(interval*dayMs))-1):0;
  for(;;n++){
   let start=a.date;
   if(mode==='weekly'||mode==='custom')start=addDays(a.date,n*interval);
   if(mode==='monthly'||mode==='yearly'){
    const total=y*12+m-1+(mode==='yearly'?n*12:n),year=Math.floor(total/12),month=total%12;
    const last=new Date(Date.UTC(year,month+1,0,12)).getUTCDate();
    start=isoDate(new Date(Date.UTC(year,month,Math.min(d,last),12)));
   }
   if(start>to||a.repeatUntil&&start>a.repeatUntil)break;
   const end=addDays(start,span);
   if(end>=from)result.push({...a,date:start,endDate:span?end:'',original:a});
   if(mode==='none')break;
  }
 }
 return result.sort(sortAppointments);
}
export function onDay(a:Appointment,date:string){return a.date<=date&&(a.endDate||a.date)>=date;}
