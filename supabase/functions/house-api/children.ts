import {z} from 'npm:zod@3.25.76';
// Optional child profiles: the family grows inside the couple's app, it doesn't replace it.
// Both parents read and edit a child's profile (version-checked); only the parent who created it can delete it.
// Profiles change quietly: no push, no activity line.
// Agenda colours: the design-system pastels plus four extra pastels (application.css) so children and parents
// never have to share a colour with each other, with « nous deux » (rose) or with the holiday landmarks.
export const personTones=['lavande','peche','ciel','corail','sable','perle','menthe','beurre','lilas','citron','rose'] as const;
export const childTones=personTones;
export const holidayTones=['menthe','beurre','lilas','citron'];
const defaultColors=['lavande','peche'];
export const parentTone=(s:{colors?:Record<string,string>},member:number)=>s.colors?.[member]||defaultColors[member];
export type Renewal={id:string;title:string;size:string;status:'ok'|'soon'|'now'};
export type Child={id:string;owner:number;name:string;birthDate:string;tone:typeof childTones[number];school:string;sizes?:string;health:string;contacts:string;notes:string;needs:string;renewals:Renewal[];version:number;createdAt:string};
// « À savoir » (notes) is still accepted and kept for older screens; the new screens fold it into the needs (up to 700 + 700 characters).
export class ChildError extends Error{constructor(public status:number,message:string){super(message);}}
const text=(max:number)=>z.string().trim().max(max).default('');
const renewalInput=z.object({id:z.string().uuid(),title:z.string().trim().min(1).max(80),size:text(40),status:z.enum(['ok','soon','now']).default('ok')});
const childInput=z.object({id:z.string().uuid(),version:z.number().int().min(0),name:z.string().trim().min(1).max(60),birthDate:z.union([z.literal(''),z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).default(''),tone:z.enum(childTones).default('menthe'),school:text(150),sizes:text(150),health:text(500),contacts:text(500),notes:text(700),needs:text(1400),renewals:z.array(renewalInput).max(60).default([])});
const deleteInput=z.object({id:z.string().uuid(),version:z.number().int().min(1)});
const conflict=()=>new ChildError(409,'Cette fiche a changé sur un autre appareil. Fermez puis rouvrez-la.');
// Family features are opt-in: nothing about children shows (or can be created) until a parent turns them on.
// Turning them off hides the profiles without deleting them.
const familyInput=z.object({enabled:z.boolean()});
const colorInput=z.object({tone:z.enum(personTones)});
export function childMutation(s:{children?:Child[];familyMode?:boolean;colors?:Record<string,string>},action:string,payload:unknown,actor:number,now:string,date:string):null{
 if(action==='family-mode'){s.familyMode=familyInput.parse(payload).enabled;return null;}
 // Each parent picks their own agenda colour, never the partner's nor rose, which stays « nous deux ».
 if(action==='agenda-color'){const {tone}=colorInput.parse(payload);if(tone==='rose'||tone===parentTone(s,actor===0?1:0))throw new ChildError(400,'Cette couleur est déjà prise dans l’agenda.');s.colors={...s.colors,[actor]:tone};return null;}
 s.children??=[];const list=s.children;const old=list.find(c=>c.id===(payload as {id?:string})?.id);
 if(action==='delete-child'){
  const v=deleteInput.parse(payload);if(!old||old.version!==v.version)throw conflict();
  if(old.owner!==actor)throw new ChildError(403,'Seul le parent qui a créé cette fiche peut la supprimer.');
  list.splice(list.indexOf(old),1);return null;
 }
 const v=childInput.parse(payload);if((old?.version||0)!==v.version)throw conflict();
 if(v.birthDate&&v.birthDate>date)throw new ChildError(400,'La date de naissance ne peut pas être dans le futur.');
 if(new Set(v.renewals.map(r=>r.id)).size!==v.renewals.length)throw new ChildError(400,'Une affaire apparaît deux fois.');
 if(!old&&!s.familyMode)throw new ChildError(400,'Activez d’abord l’espace famille dans Notre espace.');
 if(!old&&list.length>=12)throw new ChildError(400,'La limite de fiches est atteinte.');
 const value:Child={...v,owner:old?.owner??actor,version:v.version+1,createdAt:old?.createdAt||now};
 if(old)list[list.indexOf(old)]=value;else list.push(value);
 return null;
}
// An appointment or an expense may name the child it concerns; the id must exist in this household.
export function checkChild(s:{children?:Child[]},id:unknown){if(id!==undefined&&!(s.children||[]).some(c=>c.id===id))throw new ChildError(400,'Cet enfant n’existe plus dans votre espace.');}
