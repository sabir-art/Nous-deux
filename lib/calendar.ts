import type {Appointment,Entry,Item} from './domain';
export const appointmentCategories={medical:'Médical',personal:'Personnel',admin:'Administratif',work:'Travail',holiday:'Vacances',travel:'Voyage',birthday:'Anniversaire',couple:'Notre histoire',party:'Soirée / sortie',absence:'Absence',family:'Famille',sport:'Sport / bien-être',study:'Études / formation',home:'Maison',other:'Autre',france:'Jours fériés · France',christian:'Fêtes chrétiennes',islam:'Repères musulmans',culture:'Fêtes et traditions',jewish:'Fêtes juives',world:'Fêtes du monde',abroad:'Jours fériés · autres pays',mission:'Mission'};
// Whose birthday it is: close family, wider family, friends of both of us, or the author's own friends.
export const birthdayCircles={close:'Famille proche',family:'Famille',friends:'Amis communs',mine:'Mes amis'} as const;
export const circleLabel=(a:{circle?:keyof typeof birthdayCircles|'kid';owner?:number|null;child?:string},names:string[],kids:{id:string;name:string}[]=[])=>a.circle==='kid'?`Amis de ${kids.find(k=>k.id===a.child)?.name||'notre enfant'}`:a.circle==='mine'?(a.owner!=null?`Amis de ${names[a.owner]}`:'Amis'):a.circle?birthdayCircles[a.circle]:'';
// The couple's own important dates, each one comes back every year.
export const coupleMoments={meeting:'Notre rencontre',together:'Notre mise en couple',engagement:'Nos fiançailles',pacs:'Notre PACS',wedding:'Notre mariage'} as const;
export const yearsSince=(start:string,on:string)=>Number(on.slice(0,4))-Number(start.slice(0,4));
// An animal's appointments: the vet, grooming, a pet sitter… never work or studies.
export const petCategories:[string,string][]=[['medical','Santé, vétérinaire'],['home','Soins, toilettage'],['travel','Garde, pension'],['other','Autre']];
export const editableCategories=Object.entries(appointmentCategories).filter(([id])=>!['france','christian','islam','culture','jewish','world','abroad','couple','mission'].includes(id));
// A child's appointments get a soft colour by kind (health, school, activity…), on top of the child's own colour,
// which stays the main colour of the event so the child is still recognised at a glance in the shared agenda.
export type ChildKind='sante'|'ecole'|'activite'|'autre';
export const childKindLabels:Record<ChildKind,string>={sante:'Santé',ecole:'École',activite:'Activité',autre:'Autre'};
export const childKind=(category:string):ChildKind=>category==='medical'?'sante':category==='study'||category==='admin'?'ecole':['sport','party','family','holiday','travel','birthday','personal'].includes(category)?'activite':'autre';
// Missions with a date show in the agenda as computed events (never stored as appointments, so never twice):
// in the agenda of the person they are given to, in both when they are for « l’un de nous », at the child's colour
// when they concern a child. Missions are already shared by both of us, so nobody sees a mission they could not see before.
export function missionEvents(items:Item[]):Appointment[]{
 return items.filter(t=>t.kind==='task'&&/^\d{4}-\d{2}-\d{2}$/.test(t.due||'')).map(t=>({id:'task-'+t.id,taskId:t.id,assignee:t.assignee,title:t.title,category:'mission',person:t.assignee===0||t.assignee===1?t.assignee:-1,...(t.child?{child:t.child}:{}),status:t.done?'done':'scheduled',date:t.due,time:'',bookBy:'',location:'',note:'',visibility:'shared',recurrence:'none',endDate:'',repeatUntil:'',owner:t.owner??null,version:t.version,createdAt:t.createdAt}));
}
// Person filter of the agenda: a mission « pour l’un de nous » belongs to both agendas, a child's mission also to the parent it is given to.
export const inAgendaOf=(a:Appointment,person:string)=>person==='all'||(person.startsWith('child:')?a.child===person.slice(6):a.taskId?(person==='-1'?a.assignee===-1:a.assignee===Number(person)||a.assignee===-1):a.person===Number(person)&&!a.child);
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
// A recurring expense counts once per date up to `to` (today); each copy points back to its series in `original`.
export function expandEntries(entries:Entry[],to:string):Entry[]{
 const result:Entry[]=[];
 for(const e of entries){
  if(e.kind!=='expense'||!e.recurrence||e.recurrence==='none'){result.push(e);continue;}
  const dates=occurrences([{...e,status:'scheduled',endDate:''} as unknown as Appointment],e.date,to).map(a=>a.date);
  if(!dates.length)result.push(e);
  for(const date of dates)result.push({...e,id:date===e.date?e.id:e.id+'#'+date,date,original:e});
 }
 return result;
}
