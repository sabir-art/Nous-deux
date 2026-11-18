// « Préparer ce moment » : une petite liste facultative attachée à un « Je te date ».
// L'auteur écrit la liste (courses et choses à préparer) ; chacun des deux peut cocher.
// La préparation a sa propre version : la modifier ne relance pas la demande d'accord,
// et une coche ne fait jamais sonner le téléphone de l'autre.
import {z} from 'npm:zod@3.25.76';
import {ApiError,weekMonday,type State} from './model.ts';
import {secretIdea} from './chat-invitation.ts';
import {parisDate} from './life.ts';
import {MAX_PREP_ITEMS,MAX_PREP_TITLE,MAX_PREP_QUANTITY,prepItemsInput} from './validation.ts';

export {MAX_PREP_ITEMS,MAX_PREP_TITLE,MAX_PREP_QUANTITY,prepItemsInput};
export type PrepItem={id:string;kind:'buy'|'do';title:string;quantity:string;done:boolean;doneBy:number|null;shoppingItem?:string;shoppingWeek?:string};
export type IdeaPrep={version:number;items:PrepItem[]};
const prepEditInput=z.object({id:z.string().uuid(),version:z.number().int().min(0),items:prepItemsInput.nullable()});
const prepCheckInput=z.object({id:z.string().uuid(),item:z.string().uuid(),done:z.boolean()});
const prepShoppingInput=z.object({id:z.string().uuid(),operationId:z.string().uuid()});

/** Merges the author's list with what is stored: a known item keeps its server-side ticks (the partner may have
 * checked it meanwhile) and its link to the shopping list; only a new item takes the author's own tick. */
export function mergePrep(old:IdeaPrep|undefined,items:z.infer<typeof prepItemsInput>,actor:number):PrepItem[]{
 return items.map(i=>{const known=old?.items.find(o=>o.id===i.id&&o.kind===i.kind);
  const base={id:i.id,kind:i.kind,title:i.title,quantity:i.kind==='buy'?i.quantity:'' };
  if(known)return {...base,done:known.done,doneBy:known.doneBy,...(known.shoppingItem?{shoppingItem:known.shoppingItem,shoppingWeek:known.shoppingWeek}:{})};
  return {...base,done:i.done,doneBy:i.done?actor:null};});
}
const sameList=(a:PrepItem[],b:PrepItem[])=>a.length===b.length&&a.every((x,n)=>x.id===b[n].id&&x.kind===b[n].kind&&x.title===b[n].title&&x.quantity===b[n].quantity);

/** Called by the 'idea' action: no field (page cached before this feature) keeps the stored preparation. */
export function prepFromIdea(old:{prep?:IdeaPrep}|undefined,raw:unknown,actor:number):IdeaPrep|undefined{
 if(raw===undefined)return old?.prep;if(raw===null)return undefined;
 const items=mergePrep(old?.prep,prepItemsInput.parse(raw),actor);
 if(old?.prep&&sameList(old.prep.items,items))return old.prep;
 return {version:(old?.prep?.version||0)+1,items};
}

/** The partner's secret or private idea is indistinguishable from a missing one, preparation included. */
function findIdea(s:State,id:string,actor:number){
 const idea=(s.ideas||[]).find(i=>i&&i.id===id);
 if(!idea||(secretIdea(idea)&&idea.owner!==actor))throw new ApiError(404,'Ce date n’existe plus.');
 return idea;
}

export function ideaPrepMutation(s:State,action:string,p:unknown,actor:number,now:string){
 if(actor!==0&&actor!==1)throw new ApiError(403,'Compte personnel requis.');
 if(action==='idea-prep'){
  const v=prepEditInput.parse(p),idea=findIdea(s,v.id,actor);
  if(idea.owner!==actor)throw new ApiError(403,'Seule la personne qui propose ce date peut écrire sa préparation.');
  const old:IdeaPrep|undefined=idea.prep,current=old?.version||0;
  if(v.items===null){
   if(!old)return null;if(current!==v.version)throw new ApiError(409,'La préparation a changé sur un autre appareil. Rouvrez-la.');
   delete idea.prep;return null;
  }
  const items=mergePrep(old,v.items,actor);
  // Same request sent twice (lost answer, double tap): already applied, nothing to do.
  if(old&&sameList(old.items,items))return null;
  if(current!==v.version)throw new ApiError(409,'La préparation a changé sur un autre appareil. Rouvrez-la.');
  idea.prep={version:current+1,items};return null;
 }
 if(action==='idea-prep-check'){
  const v=prepCheckInput.parse(p),idea=findIdea(s,v.id,actor),item=(idea.prep as IdeaPrep|undefined)?.items.find(i=>i.id===v.item);
  if(!item)throw new ApiError(404,'Cet élément n’est plus dans la préparation.');
  if(item.done===v.done)return null;
  if(!v.done&&item.doneBy!==null&&item.doneBy!==actor&&idea.owner!==actor)throw new ApiError(403,'Seule la personne qui l’a coché peut le décocher.');
  item.done=v.done;item.doneBy=v.done?actor:null;return null;
 }
 if(action==='idea-prep-shopping'){
  const v=prepShoppingInput.parse(p),idea=findIdea(s,v.id,actor),prep=idea.prep as IdeaPrep|undefined;
  s.shoppingBatches??=[];const key=actor+':'+v.operationId;if(s.shoppingBatches.includes(key))return null;
  // The week of the moment, or this week if that one is already over.
  const thisWeek=weekMonday(parisDate()),dateWeek=/^\d{4}-\d{2}-\d{2}$/.test(idea.date||'')?weekMonday(idea.date):thisWeek,weekStart=dateWeek>thisWeek?dateWeek:thisWeek;
  const rest=(prep?.items||[]).filter(i=>i.kind==='buy'&&!i.done&&!(i.shoppingItem&&s.items.some(x=>x.id===i.shoppingItem)));
  if(!rest.length)throw new ApiError(400,'Tout est déjà acheté ou dans les courses.');
  if(s.shoppingBatches.length>=5000||s.items.length+rest.length>10000)throw new ApiError(400,'Votre liste est pleine. Archivez des articles avant de continuer.');
  for(const i of rest){const id=crypto.randomUUID();
   s.items.push({id,kind:'shopping',title:i.title,quantity:i.quantity,assignee:-1,due:'',priority:0,done:false,note:('Pour : '+idea.title).slice(0,500),photoId:null,owner:actor,version:1,createdAt:now,weekStart,purchasedBy:null,purchasedAt:null});
   i.shoppingItem=id;i.shoppingWeek=weekStart;}
  s.shoppingBatches.push(key);return null;
 }
 throw new ApiError(400,'Action inconnue.');
}
/** What the household read returns: a secret or private idea of the partner (and so its preparation) never leaves the server. */
export const visibleIdeas=(s:State,actor:number)=>(s.ideas||[]).filter(i=>i&&(!secretIdea(i)||i.owner===actor));
