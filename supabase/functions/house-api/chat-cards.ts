// Shareable "house" cards and Nous deux stickers in the chat.
// The browser only sends a typed reference (kind + id). The server checks it
// against the household state with the sender's own rights and keeps a small
// snapshot keyed by message id in nd_state.chatCards (additive, no SQL change).
import {ApiError,weekMonday,visibleAppointments,type State} from './model.ts';
import {plantCare,plantMood,parisDate,type Plant} from './life.ts';
import {recipeIds,recipeTitles} from './recipe-ids.ts';
import {sweetNoteText} from './sweet-notes.ts';
import {buildInvitationCard} from './chat-invitation.ts';

export {chatStickerIds,chatCardKinds,chatCardInput,chatStickerInput,MAX_CARD_NOTE,type ChatCardKind,type ChatCardRef} from './chat-card-input.ts';
import type {ChatCardKind,ChatCardRef} from './chat-card-input.ts';
export type ChatCardRecord={member:number;kind:ChatCardKind|'sticker';ref:string;data?:Record<string,unknown>;note?:string;at:string};
export type ChatCardState={chatCards?:Record<string,ChatCardRecord>};
const MAX_CARDS=200,MAX_STICKERS=600,MAX_LIST=12;

const money=(cents:number)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(cents/100);
function missing():never{throw new ApiError(404,'Cet élément n’existe plus dans la maison.');}
const short=(v:unknown,n=100)=>String(v??'').slice(0,n);

/** Validates a reference with the sender's rights and returns the minimal snapshot. */
export function buildChatCard(s:State&ChatCardState,ref:ChatCardRef,actor:number,today=parisDate()):{ref:string;data:Record<string,unknown>;summary:string;push:string}{
 if(actor!==0&&actor!==1)throw new ApiError(403,'Compte personnel requis.');
 switch(ref.kind){
  case 'shopping':{
   const week=ref.weekStart||weekMonday(today),list=s.items.filter(i=>i.kind==='shopping'&&i.weekStart===week),toBuy=list.filter(i=>!i.done);
   if(!toBuy.length)throw new ApiError(400,'Il n’y a rien à acheter cette semaine.');
   return {ref:week,data:{weekStart:week,toBuy:toBuy.length,bought:list.length-toBuy.length,items:toBuy.slice(0,MAX_LIST).map(i=>({title:short(i.title),quantity:short(i.quantity,50)}))},summary:`🛒 Liste de courses : ${toBuy.length} article${toBuy.length>1?'s':''} à acheter`,push:'🛒 La liste de courses dans votre discussion'};
  }
  case 'expense':{
   const e=s.entries.find(e=>e.id===ref.id)||missing();
   return {ref:e.id,data:{title:short(e.title),cents:e.cents,payer:e.member,category:short(e.category,40),date:e.date,kind:e.kind==='settlement'?'settlement':'expense'},summary:`💸 ${e.kind==='settlement'?'Remboursement':'Dépense'} : ${short(e.title)} · ${money(e.cents)}`,push:'💸 Une dépense dans votre discussion'};
  }
  case 'plant':{
   const p=(s.plants||[]).find(p=>p.id===ref.id) as Plant|undefined||missing();
   const care=plantCare(p,today),water=care.find(c=>c.kind==='water'),due=care.filter(c=>c.overdue>=0).map(c=>c.kind);
   const mood=plantMood(p,today);
   return {ref:p.id,data:{name:short(p.name,60),species:short(p.species,80),mood,due,waterDue:water?.due||'',overdue:water?.overdue??0},summary:`🌱 ${short(p.name,60)} ${mood==='thirsty'||mood==='droopy'?'a soif !':mood==='ready'?'attend son arrosage aujourd’hui.':'va bien.'}`,push:'🌱 Une plante a besoin de vous'};
  }
  case 'task':{
   const t=s.items.find(i=>i.id===ref.id&&i.kind==='task')||missing();
   return {ref:t.id,data:{title:short(t.title),assignee:t.assignee,due:t.due||'',done:!!t.done,priority:t.priority?1:0},summary:`✅ Mission : ${short(t.title)}`,push:'✅ Une mission dans votre discussion'};
  }
  case 'appointment':{
   // Private events never leave their author, even toward the chat.
   const a=visibleAppointments(s,actor).find(a=>a.id===ref.id)||missing();
   if(a.visibility!=='shared')throw new ApiError(403,'Ce rendez-vous est privé. Partagez-le d’abord dans l’agenda.');
   return {ref:a.id,data:{title:short(a.title),category:a.category,date:a.date||'',time:a.time||'',endDate:a.endDate||'',location:short(a.location,150),person:a.person,status:a.status},summary:`📅 Rendez-vous : ${short(a.title)}${a.date?' · '+new Date(a.date+'T12:00:00Z').toLocaleDateString('fr-FR',{day:'numeric',month:'short',timeZone:'UTC'}):''}`,push:'📅 Un rendez-vous dans votre discussion'};
  }
  case 'recipe':{
   const built=recipeIds.indexOf(ref.id),generated=(s as any).generatedRecipes?.find((r:any)=>r.id===ref.id),personal=s.personalRecipes?.find(r=>r.id===ref.id&&!r.archived);
   const r:any=personal||generated||(built>=0?{title:recipeTitles[built]}:null)||missing();
   return {ref:ref.id,data:{title:short(r.title),...(Number.isInteger(r.minutes)?{minutes:r.minutes}:{}),...(Number.isInteger(r.servings)?{servings:r.servings}:{}),...(typeof r.group==='string'?{group:short(r.group,40)}:{})},summary:`🍽️ Recette : ${short(r.title)}`,push:'🍽️ Une recette dans votre discussion'};
  }
  case 'mot':{
   // A ready-made sweet note: only ids of the fixed list are accepted, the text is a snapshot.
   const text=sweetNoteText(ref.id)||missing();
   return {ref:ref.id,data:{text},summary:'💌 '+text,push:'💌 Un petit mot doux pour vous'};
  }
  case 'invitation':return buildInvitationCard(s,ref.id,actor);
  case 'menu':{
   const plan=s.mealPlans?.find(m=>m.id===ref.id)||missing();
   const title=(id:string)=>{const i=recipeIds.indexOf(id);return i>=0?recipeTitles[i]:(s.personalRecipes?.find(r=>r.id===id)?.title||(s as any).generatedRecipes?.find((r:any)=>r.id===id)?.title||'Plat');};
   return {ref:plan.id,data:{weekStart:plan.weekStart,slots:plan.slots.slice(0,14).map(x=>({day:x.day,meal:x.meal,title:short(title(x.recipeId))}))},summary:'🍽️ Notre menu de la semaine',push:'🍽️ Le menu de la semaine dans votre discussion'};
  }
 }
}

const stickerWords:Record<string,string>={bisou:'bisou !',calin:'câlin',['je-t-aime']:'je t’aime',coucou:'coucou !',['bonne-nuit']:'bonne nuit',cafe:'café ?',['a-table']:'à table !',courses:'courses ?',arrosage:'on arrose ?',merci:'merci !',bravo:'bravo !',pardon:'pardon…',boude:'je boude',['j-arrive']:'j’arrive !',['tu-me-manques']:'tu me manques',fete:'c’est la fête !',film:'soirée film ?',pluie:'il pleut…',vacances:'vacances !',courage:'courage !',
 ['chat-faim']:'le chat a faim',ronron:'ronron…',sieste:'sieste ?',balade:'balade ?',ouaf:'ouaf !',['ca-pousse']:'ça pousse !',['bisou-piquant']:'bisou piquant',resto:'resto ce soir ?',['je-rentre']:'je rentre !',surprise:'surprise !',anniv:'joyeux anniv !',['rendez-vous']:'rendez-vous ?'};
export const stickerText=(id:string)=>'💞 Sticker « '+(stickerWords[id]||id)+' »';

/** Adds or replaces an unsent record, keeping the state small: older cards fall back to their message text. */
export function storeChatCard(s:ChatCardState,id:string,record:ChatCardRecord){
 s.chatCards??={};const existing=s.chatCards[id];
 // The caller has checked that no message uses this id yet: a retry may replace its own draft card.
 if(existing&&existing.member!==record.member)throw new ApiError(403,'Ce message appartient à votre moitié.');
 s.chatCards[id]=record;
 const entries=Object.entries(s.chatCards).sort((a,b)=>a[1].at.localeCompare(b[1].at));
 for(const [limit,sticker] of [[MAX_CARDS,false],[MAX_STICKERS,true]] as const){const group=entries.filter(([,r])=>(r.kind==='sticker')===sticker);for(const [key] of group.slice(0,Math.max(0,group.length-limit)))delete s.chatCards[key];}
 return true;
}
export function dropChatCards(s:ChatCardState,match:(id:string,r:ChatCardRecord)=>boolean){if(!s.chatCards)return;for(const [id,r] of Object.entries(s.chatCards))if(match(id,r))delete s.chatCards[id];}

/** Adds card/sticker payloads to visible messages only. Deleted messages never expose them. */
export function attachChatCards(messages:any[],cards:Record<string,ChatCardRecord>|null|undefined){
 if(!cards||typeof cards!=='object')return messages;
 return messages.map(m=>{const r=cards[m.id];if(!r||m.deleted||r.member!==m.member)return m;
  if(r.kind==='sticker')return {...m,sticker:r.ref,editable_until:null};
  return {...m,card:{kind:r.kind,ref:r.ref,data:r.data||{},note:r.note||''},editable_until:null};});
}
