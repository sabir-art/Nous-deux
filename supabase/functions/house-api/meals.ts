import {knownRecipe,type RecipeState} from './recipe-library.ts';
import type {DiscoveryState} from './recipe-discovery.ts';
import {recipeIds} from './recipe-ids.ts';
import {parisDate} from './life.ts';
export type MealMatch={recipeId:string;chef:0|1|2;createdAt:string};
export type MealRound={votes:Record<string,boolean>[];matches:MealMatch[];draws?:Record<string,Record<string,0|1|2>>};
export type MealState=DiscoveryState & RecipeState & {mealRounds?:Record<string,MealRound>};
export class MealError extends Error{status=400;}
// Rejection sampling avoids modulo bias. The server draws once, after mutual consent.
export function drawChef():0|1|2{let n:number;do{n=crypto.getRandomValues(new Uint32Array(1))[0];}while(n===4294967295);return (n%3) as 0|1|2;}
export function mealProjection(s:MealState,actor:number,date=parisDate()){
 const round=s.mealRounds?.[date];return {date,myVotes:{...(round?.votes[actor]||{})},matches:round?.matches||[],draws:round?.draws||{}};
}
export function mealVote(s:MealState,p:any,actor:number){
 if(actor!==0&&actor!==1)throw new MealError('Compte personnel requis.');
 if(p?.date!==parisDate())throw new MealError('Cette session est terminée. Revenez au menu du jour.');
 if(!knownRecipe(s,p?.recipeId,true)||typeof p?.like!=='boolean')throw new MealError('Choix de recette invalide.');
 s.mealRounds??={};const round=s.mealRounds[p.date]??={votes:[{},{}],matches:[]};const votes=round.votes[actor];
 // A daily ballot is final: probing/retracting votes cannot reveal a partner's history.
 if(Object.hasOwn(votes,p.recipeId)){if(votes[p.recipeId]!==p.like)throw new MealError('Votre choix pour ce plat est déjà enregistré pour aujourd’hui.');return;}
 votes[p.recipeId]=p.like;
 if(p.like&&round.votes[1-actor][p.recipeId]===true&&!round.matches.some(m=>m.recipeId===p.recipeId))round.matches.push({recipeId:p.recipeId,chef:drawChef(),createdAt:new Date().toISOString()});
}

export function mealDraw(s:MealState,p:any,actor:number){
 if(actor!==0&&actor!==1)throw new MealError('Compte personnel requis.');if(p.date!==parisDate())throw new MealError('Cette journée est terminée. Actualisez la page.');
 const scoped=typeof p.recipeId==='string';if(p.recipeId!==undefined&&!scoped)throw new MealError('Recette invalide.');const tasks=scoped?['cuisine','vaisselle','courses']:['vaisselle','courses','rangement'];if(!tasks.includes(p.task))throw new MealError('Mission invalide.');
 const match=scoped?s.mealRounds?.[p.date]?.matches.find(m=>m.recipeId===p.recipeId):undefined;if(scoped&&!match)throw new MealError('La roue de cuisine est réservée à vos matchs.');
 s.mealRounds??={};const round=s.mealRounds[p.date]??={votes:[{},{}],matches:[]};round.draws??={};const results=round.draws[scoped?p.recipeId:'home']??={};if(results[p.task]===undefined)results[p.task]=p.task==='cuisine'?match!.chef:drawChef();
}
