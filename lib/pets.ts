// Browser copy of the pet model in supabase/functions/house-api/pets.ts (kept without zod).
import {addDays,dayDifference,parisDate} from './life';
export const petCares=['food','walk','litter','groom','health'] as const;
export type PetCare=typeof petCares[number];
export type PetTone='beurre'|'peche'|'lavande'|'rose'|'menthe'|'lilas';
export type Pet={id:string;owner:number;name:string;kind:'dog'|'cat';breed:string;tone:PetTone;note:string;every:Record<PetCare,number>;last:Record<PetCare,string>;version:number;createdAt:string;careLog:{kind:PetCare;actor:number;date:string;at:string}[]};
export const petCareLabels:Record<PetCare,string>={food:'Repas',walk:'Promenade',litter:'Litière',groom:'Brossage',health:'Antipuces, vermifuge'};
export const petCareDone:Record<PetCare,string>={food:'Nourri',walk:'Promené',litter:'Changée',groom:'Brossé',health:'Fait'};
export const petDefaults:Record<'dog'|'cat',Record<PetCare,number>>={dog:{food:1,walk:1,litter:0,groom:7,health:90},cat:{food:1,walk:0,litter:3,groom:7,health:90}};
export function petCare(p:Pet,date=parisDate()){return petCares.filter(k=>p.every[k]>0).map(kind=>{const due=addDays(p.last[kind],p.every[kind]);return {kind,interval:p.every[kind],last:p.last[kind],due,overdue:dayDifference(date,due)};});}
export type PetMood='happy'|'ok'|'want'|'sad'|'love';
export function petMood(p:Pet,date=parisDate()):PetMood{const late=Math.max(-1,...petCare(p,date).map(c=>c.overdue));return late<0?'happy':late===0?'ok':late<=2?'want':'sad';}
export const petQuips:Record<'dog'|'cat',Record<PetMood,string>>={
 dog:{happy:'La vie de chien, c’est la belle vie !',ok:'On sort ? On mange ? On fait quelque chose ? 🐾',want:'Je ne dis rien, mais je fixe la porte…',sad:'Wouf… On m’a un peu oublié, non ?',love:'Merci ! Je remue la queue de bonheur !'},
 cat:{happy:'Je daigne vous accorder un ronron.',ok:'C’est l’heure de mon service, humains.',want:'Ma gamelle me semble étrangement vide…',sad:'Miaou. Je proteste officiellement.',love:'Ronron ! Vous êtes pardonnés.'}};
