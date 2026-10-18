import {z} from 'npm:zod@3.25.76';
// Pets, like the plants: everyone can note a care, only the author edits or deletes the card.
// No push and no activity line for pets: a walk or a meal is daily routine, not news.
export const petCares=['food','walk','litter','groom','health'] as const;
export type PetCare=typeof petCares[number];
export type Pet={birthDate?:string;id:string;owner:number;name:string;kind:'dog'|'cat';breed:string;tone:string;note:string;every:Record<PetCare,number>;last:Record<PetCare,string>;version:number;createdAt:string;careLog:{kind:PetCare;actor:number;date:string;at:string}[]};
export class PetError extends Error{constructor(public status:number,message:string){super(message);}}
const day=z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const cares=<T extends z.ZodTypeAny>(t:T)=>z.object({food:t,walk:t,litter:t,groom:t,health:t});
const petInput=z.object({id:z.string().uuid(),version:z.number().int().min(0),name:z.string().trim().min(1).max(60),kind:z.enum(['dog','cat']),breed:z.string().trim().max(80).default(''),tone:z.enum(['beurre','peche','lavande','rose','menthe','lilas']).default('beurre'),note:z.string().trim().max(700).default(''),birthDate:z.union([z.literal(''),day]).default(''),every:cares(z.number().int().min(0).max(365)),last:cares(day)});
const careInput=z.object({id:z.string().uuid(),version:z.number().int().min(1),kind:z.enum(petCares)});
const deleteInput=z.object({id:z.string().uuid(),version:z.number().int().min(1)});
const conflict=()=>new PetError(409,'Cette fiche a changé sur un autre appareil. Fermez puis rouvrez-la.');
function addDays(date:string,days:number){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
const between=(a:string,b:string)=>Math.round((Date.parse(a+'T12:00:00Z')-Date.parse(b+'T12:00:00Z'))/86400000);
export function petCare(p:Pet,date:string){return petCares.filter(k=>p.every[k]>0).map(kind=>{const due=addDays(p.last[kind],p.every[kind]);return {kind,interval:p.every[kind],last:p.last[kind],due,overdue:between(date,due)};});}
const modeInput=z.object({enabled:z.boolean()});
export function petMutation(s:{pets?:Pet[];petsMode?:boolean},action:string,payload:unknown,actor:number,now:string,date:string):null{
 // Nos compagnons is optional: switched on in Notre espace; switching it off only hides the cards.
 if(action==='pets-mode'){s.petsMode=modeInput.parse(payload).enabled;return null;}
 s.pets??=[];const list=s.pets;const old=list.find(p=>p.id===(payload as {id?:string})?.id);
 if(action==='pet-care'){
  const v=careInput.parse(payload);if(!old||old.version!==v.version)throw conflict();
  if(!(old.every[v.kind]>0))throw new PetError(400,'Ce soin n’est pas suivi pour cet animal.');
  if(old.careLog.some(c=>c.kind===v.kind&&c.date===date))throw new PetError(409,'Ce soin a déjà été noté aujourd’hui.');
  old.last[v.kind]=date;old.careLog=[{kind:v.kind,actor,date,at:now},...old.careLog].slice(0,100);old.version++;return null;
 }
 // « Tout est fait »: every care due today (or late) is noted at once, skipping those already noted today.
 if(action==='pet-care-all'){
  const v=deleteInput.parse(payload);if(!old||old.version!==v.version)throw conflict();
  const due=petCare(old,date).filter(c=>c.overdue>=0&&!old.careLog.some(l=>l.kind===c.kind&&l.date===date));
  if(!due.length)throw new PetError(409,'Tous les soins du jour sont déjà faits.');
  for(const c of due){old.last[c.kind]=date;old.careLog=[{kind:c.kind,actor,date,at:now},...old.careLog].slice(0,100);}old.version++;return null;
 }
 if(old&&old.owner!==actor)throw new PetError(403,'Seule la personne qui a créé cette fiche peut la modifier.');
 if(action==='delete-pet'){const v=deleteInput.parse(payload);if(!old||old.version!==v.version)throw conflict();list.splice(list.indexOf(old),1);return null;}
 const v=petInput.parse(payload);if((old?.version||0)!==v.version)throw conflict();
 if(!old&&!s.petsMode)throw new PetError(400,'Activez d’abord Nos compagnons dans Notre espace.');
 if(!old&&list.length>=30)throw new PetError(400,'La limite de fiches est atteinte.');
 if(v.birthDate&&v.birthDate>date)throw new PetError(400,'La date de naissance ne peut pas être dans le futur.');
 if(!old&&petCares.some(k=>v.last[k]>date))throw new PetError(400,'Un soin déjà effectué ne peut pas être dans le futur.');
 // Past care dates come from the care log once the card exists, never from an edit.
 const value:Pet={...v,owner:actor,version:v.version+1,createdAt:old?.createdAt||now,last:old?{...old.last}:v.last,careLog:old?.careLog||[]};
 if(old)list[list.indexOf(old)]=value;else list.push(value);
 return null;
}
