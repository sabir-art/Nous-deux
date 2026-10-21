import {z} from 'npm:zod@3.25.76';
// Keep in sync with lib/diets.ts (checked by tests/diets.test.mjs).
export const dietKeys=['de-tout','sans-porc','vegetarien','vegetalien','sans-gluten','sans-lactose','sans-oeufs','sans-fruits-a-coque','sans-poisson','halal','casher'] as const;
// « Je mange de tout » says so explicitly; it excludes every other diet (allergies stay possible).
export const EATS_EVERYTHING='de-tout';
export type MemberDiet={diets:string[];allergies:string;version:number;updatedAt:string};
export type DietState={diets?:Record<string,MemberDiet>};
export class DietError extends Error{constructor(public status:number,message:string){super(message);}}
export const dietInput=z.object({member:z.number().int().min(0).max(1).optional(),diets:z.array(z.enum(dietKeys)).max(dietKeys.length).refine(v=>new Set(v).size===v.length,'Régime en double.').refine(v=>!v.includes(EATS_EVERYTHING)||v.length===1,'« Je mange de tout » ne se combine pas avec un autre régime.'),allergies:z.string().trim().max(300),version:z.number().int().min(0)});
// Each person edits only their own diet; the actor always comes from the server session.
export function dietMutation(s:DietState,p:unknown,actor:number){
 if(actor!==0&&actor!==1)throw new DietError(403,'Compte personnel requis.');
 const v=dietInput.parse(p);if(v.member!==undefined&&v.member!==actor)throw new DietError(403,'Vous ne pouvez pas modifier ce que mange votre moitié.');
 s.diets??={};const old=s.diets[actor];const diets=dietKeys.filter(k=>v.diets.includes(k));
 // A retried request that already landed is accepted without a second version bump.
 if(old&&old.version===v.version+1&&old.allergies===v.allergies&&JSON.stringify(old.diets)===JSON.stringify(diets))return;
 if((old?.version||0)!==v.version)throw new DietError(409,'Votre profil a changé sur un autre appareil. Rechargez la page.');
 s.diets[actor]={diets,allergies:v.allergies,version:v.version+1,updatedAt:new Date().toISOString()};
}
export function dietProjection(s:DietState){const out:Record<string,MemberDiet>={};for(const m of ['0','1'])if(s.diets?.[m])out[m]=s.diets[m];return out;}
