export type Entry={owner?:number|null;id:string;kind:'expense'|'settlement';title:string;cents:number;member:number;category:string;date:string;note:string;version:number;createdAt:string};
export type Item={weekStart?:string;purchasedBy?:number|null;purchasedAt?:string|null;owner?:number|null;id:string;kind:'shopping'|'task';title:string;quantity:string;assignee:number;due:string;priority:number;done:boolean;version:number;createdAt:string};
export type Household={first:string;second:string;name:string;budget:number;version:number};
export type Appointment={holidayGroups?:string[];visibility?:'private'|'shared';recurrence?:'none'|'weekly'|'monthly'|'yearly';endDate?:string;repeatUntil?:string;source?:string;provisional?:boolean;original?:Appointment;owner?:number|null;id:string;title:string;category:'medical'|'personal'|'admin'|'work'|'holiday'|'travel'|'birthday'|'party'|'absence'|'family'|'sport'|'study'|'home'|'other'|'france'|'christian'|'islam'|'culture';person:number;status:'to_book'|'scheduled'|'done';date:string;time:string;bookBy:string;location:string;note:string;createdAt:string;version:number};
export type ShoppingTemplate={id:string;title:string;owner:number;items:{title:string;quantity:string}[]};
export type Data={templates?:ShoppingTemplate[];member?:number;household:Household|null;entries:Entry[];items:Item[];appointments:Appointment[]};
export const categories=['Courses','Maison','Factures','Sorties','Transport','Autre'];
export function centsFromInput(value:string):number{
 const s=value.trim().replace(',','.');
 if(!/^\d{1,7}(\.\d{1,2})?$/.test(s))throw new Error('Saisissez un montant avec au maximum 2 décimales.');
 const [euros,dec='']=s.split('.');return Number(euros)*100+Number(dec.padEnd(2,'0'));
}
// For odd cents, the first person's share is rounded up.
export function balance(entries:Pick<Entry,'kind'|'member'|'cents'>[]):number{
 return entries.reduce((sum,e)=>sum+(e.kind==='settlement'?(e.member===0?e.cents:-e.cents):(e.member===0?Math.floor(e.cents/2):-Math.ceil(e.cents/2))),0);
}
export function validDate(value:string):boolean{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(value+'T12:00:00Z');return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===value;
}
export function money(cents:number):string{return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(cents/100);}
export function today():string{return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
