import {z} from 'npm:zod@3.25.76';
import {recipeIds} from './recipe-ids.ts';
import {validDate} from './domain.ts';
export class RecipeError extends Error{constructor(public status:number,message:string){super(message);}}
const id=z.string().uuid(),version=z.number().int().min(0),title=z.string().trim().min(1).max(100);
const recipeInput=z.object({id,version,title,difficulty:z.enum(['Facile','Intermédiaire','Avancée','Non précisée']).default('Non précisée'),group:z.enum(['Végétarien','Poulet','Bœuf','Poisson','Autre']),minutes:z.number().int().min(1).max(1440),servings:z.number().int().min(1).max(50),ingredients:z.array(z.string().trim().min(1).max(200)).min(1).max(40),steps:z.array(z.string().trim().min(1).max(500)).min(1).max(30),photoId:id.nullable(),calories:z.number().int().min(0).max(10000).nullable(),nutrients:z.string().trim().max(700),porkFree:z.literal(true)});
export type PersonalRecipe=z.infer<typeof recipeInput>&{owner:number;createdAt:string;photo:string;archived:boolean};
export type MealSlot={day:number;meal:'lunch'|'dinner';recipeId:string};
export type MealPlan={id:string;version:number;owner:number;weekStart:string;slots:MealSlot[]};
export type MealTemplate={id:string;title:string;owner:number;slots:MealSlot[]};
export type RecipeState={recipeFavorites?:Record<string,string[]>;personalRecipes?:PersonalRecipe[];mealPlans?:MealPlan[];mealPlanTemplates?:MealTemplate[];generatedRecipes?:{id:string}[]};
const monday=z.string().refine(v=>validDate(v)&&new Date(v+'T12:00:00Z').getUTCDay()===1,'Choisissez le lundi de la semaine.');
const slots=z.array(z.object({day:z.number().int().min(0).max(6),meal:z.enum(['lunch','dinner']),recipeId:z.string().min(1).max(100)})).min(1).max(14).refine(s=>new Set(s.map(x=>x.day+':'+x.meal)).size===s.length,'Un seul plat par créneau.');
const conflict=()=>{throw new RecipeError(409,'Cet élément a changé. Fermez puis rouvrez le formulaire.');};
const owner=(old:{owner:number}|undefined,actor:number)=>{if(!old)throw new RecipeError(404,'Élément introuvable.');if(old.owner!==actor)throw new RecipeError(403,'Seul l’auteur peut modifier cet élément.');};
export function knownRecipe(s:RecipeState,id:string,activeOnly=false){return recipeIds.includes(id)||!!s.generatedRecipes?.some(r=>r.id===id)||!!s.personalRecipes?.some(r=>r.id===id&&(!activeOnly||!r.archived));}
export function recipeMutation(s:RecipeState,p:any,actor:number){
 if(actor!==0&&actor!==1)throw new RecipeError(403,'Compte personnel requis.');
 if(p.action==='recipe-favorite'){const v=z.object({id:z.string().min(1).max(100),favorite:z.boolean()}).parse(p.payload);if(!knownRecipe(s,v.id))throw new RecipeError(404,'Recette introuvable.');s.recipeFavorites??={};const ids=s.recipeFavorites[actor]||[];s.recipeFavorites[actor]=v.favorite?[...new Set([...ids,v.id])]:ids.filter(id=>id!==v.id);return;}
 const now=new Date().toISOString();
 const checkSlots=(values:MealSlot[])=>{if(values.some(v=>!knownRecipe(s,v.recipeId)))throw new RecipeError(400,'Une recette de ce menu n’existe plus.');};
 if(p.action==='recipe-save'){
  const v=recipeInput.parse(p.payload);s.personalRecipes??=[];const old=s.personalRecipes.find(r=>r.id===v.id);
  if(old)owner(old,actor);if(old&&old.version===v.version+1&&Object.entries(v).every(([key,value])=>key==='version'||JSON.stringify(old[key as keyof typeof old])===JSON.stringify(value)))return;if((old?.version||0)!==v.version)conflict();
  if(!old&&s.personalRecipes.length>=500)throw new RecipeError(400,'Le carnet contient déjà 500 recettes personnelles.');
  const value={...v,photo:'',owner:actor,createdAt:old?.createdAt||now,version:v.version+1,archived:false};
  if(old)s.personalRecipes[s.personalRecipes.indexOf(old)]=value;else s.personalRecipes.push(value);return;
 }
 if(p.action==='recipe-archive'){
  const v=z.object({id,version}).parse(p.payload),old=s.personalRecipes?.find(r=>r.id===v.id);owner(old,actor);if(old!.version!==v.version)conflict();old!.archived=true;old!.version++;return;
 }
 if(p.action==='plan-save'){
  const v=z.object({id,version,weekStart:monday,slots}).parse(p.payload);checkSlots(v.slots);s.mealPlans??=[];const old=s.mealPlans.find(r=>r.id===v.id);
  if(old)owner(old,actor);if(old&&old.version===v.version+1&&Object.entries(v).every(([key,value])=>key==='version'||JSON.stringify(old[key as keyof typeof old])===JSON.stringify(value)))return;if((old?.version||0)!==v.version)conflict();
  if(s.mealPlans.some(r=>r.owner===actor&&r.weekStart===v.weekStart&&r.id!==v.id))throw new RecipeError(409,'Vous avez déjà un menu pour cette semaine. Modifiez-le depuis la liste.');
  if(!old&&s.mealPlans.length>=520)throw new RecipeError(400,'La limite de menus est atteinte. Supprimez un ancien menu.');
  const value={...v,owner:actor,version:v.version+1};if(old)s.mealPlans[s.mealPlans.indexOf(old)]=value;else s.mealPlans.push(value);return;
 }
 if(p.action==='plan-delete'){
  const v=z.object({id,version}).parse(p.payload),old=s.mealPlans?.find(r=>r.id===v.id);owner(old,actor);if(old!.version!==v.version)conflict();s.mealPlans=s.mealPlans!.filter(r=>r.id!==v.id);return;
 }
 if(p.action==='menu-save'){
  const v=z.object({id,title,planId:id,planVersion:version}).parse(p.payload),plan=s.mealPlans?.find(r=>r.id===v.planId);
  s.mealPlanTemplates??=[];const existing=s.mealPlanTemplates.find(r=>r.id===v.id);if(existing){owner(existing,actor);return;}
  if(!plan)throw new RecipeError(404,'Menu introuvable.');if(plan.version!==v.planVersion)conflict();
  if(s.mealPlanTemplates.length>=100)throw new RecipeError(400,'La limite de 100 menus favoris est atteinte.');
  s.mealPlanTemplates.push({id:v.id,title:v.title,owner:actor,slots:structuredClone(plan.slots)});return;
 }
 if(p.action==='menu-apply'){
  const v=z.object({id,templateId:id,weekStart:monday}).parse(p.payload),template=s.mealPlanTemplates?.find(r=>r.id===v.templateId);
  const existing=s.mealPlans?.find(r=>r.id===v.id);if(existing){owner(existing,actor);if(existing.weekStart!==v.weekStart)conflict();return;}
  if(!template)throw new RecipeError(404,'Menu favori introuvable.');
  return recipeMutation(s,{action:'plan-save',payload:{id:v.id,version:0,weekStart:v.weekStart,slots:structuredClone(template.slots)}},actor);
 }
 if(p.action==='menu-delete'){
  const v=z.object({id}).parse(p.payload),old=s.mealPlanTemplates?.find(r=>r.id===v.id);owner(old,actor);s.mealPlanTemplates=s.mealPlanTemplates!.filter(r=>r.id!==v.id);return;
 }
 throw new RecipeError(400,'Action inconnue.');
}
