// Trial-mode replacement for lib/api-client.ts, used only by `pnpm run build:essai`.
// It never contacts Supabase: the household lives in this browser's localStorage and is
// changed by the same server rules as house-api (model, meals, recipes, places), so a
// branch can be tried for real without touching the household's real data.
import {householdMutation,visibleAppointments,weekMonday,ApiError,type State} from '../supabase/functions/house-api/model.ts';
import {mealProjection,mealVote,mealDraw} from '../supabase/functions/house-api/meals.ts';
import {recipeMutation} from '../supabase/functions/house-api/recipe-library.ts';
import {discoveryProjection} from '../supabase/functions/house-api/recipe-discovery.ts';
import {placeMutation} from '../supabase/functions/house-api/places.ts';
import {defaultPreferences} from '../supabase/functions/house-api/communication.ts';
import {parisDate} from '../supabase/functions/house-api/life.ts';
import {visibleGifts,giftsOn} from '../supabase/functions/house-api/gifts.ts';
import {chatInput} from '../supabase/functions/house-api/validation.ts';
import {buildChatCard,storeChatCard,dropChatCards,attachChatCards,stickerText,type ChatCardState} from '../supabase/functions/house-api/chat-cards.ts';

export const APP_BASE=location.pathname.replace(/[^/]*$/,'');
const STATE_KEY='nous-deux-essai-state-v12',MEMBER_KEY='nous-deux-essai-member',PHOTOS_KEY='nous-deux-essai-photos-v1',CHAT_KEY='nous-deux-essai-chat-v1';
const unavailable='Pas disponible en mode essai.';

const read=<T,>(key:string,fallback:()=>T):T=>{try{const raw=localStorage.getItem(key);if(raw)return JSON.parse(raw) as T;}catch{}return fallback();};
const write=(key:string,value:unknown)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Private browsing: the trial still works until the page closes. */}};
let memory:State|null=null;
const member=()=>{const m=read<number>(MEMBER_KEY,()=>1);return m===0?0:1;};

function seed():State{
 const today=parisDate(),monday=weekMonday(today),now=new Date().toISOString(),id=()=>crypto.randomUUID();
 const day=(offset:number)=>{const d=new Date(today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);};
 const entry=(title:string,cents:number,who:number,category:string,offset:number,extra={})=>({id:id(),kind:'expense',title,cents,member:who,owner:who,category,date:day(offset),note:'',version:1,createdAt:now,...extra});
 const item=(title:string,quantity:string,who:number)=>({id:id(),kind:'shopping',title,quantity,assignee:-1,due:'',priority:0,done:false,note:'',photoId:null,weekStart:monday,purchasedBy:null,purchasedAt:null,owner:who,version:1,createdAt:now});
 return {household:{first:'Abdellah',second:'Laura',name:'Nous deux',budget:80000,categoryBudgets:{Courses:40000,Transport:3000,Sorties:12000},version:1},profiles:{},
  entries:[entry('Courses de la semaine',6420,0,'Courses',-3),entry('Facture d’électricité',8900,1,'Factures',-6),entry('Billet de train',4250,1,'Transport',-1,{split:'full'}),entry('Loyer',85000,0,'Maison',-40,{recurrence:'monthly'})],
  items:[item('Pain','1',0),item('Tomates','1 kg',1),{...item('Lait','2 bouteilles',0),priority:1}],familyMode:false,colors:{},
  appointments:[{id:id(),title:'Notre mise en couple',category:'couple',countdown:true,person:-1,status:'scheduled',date:`${Number(day(12).slice(0,4))-5}${day(12).slice(4)}`,time:'',bookBy:'',location:'',note:'',visibility:'shared',recurrence:'yearly',endDate:'',repeatUntil:'',owner:0,version:1,createdAt:now},...([['Anniversaire de maman','close',1,9],['Anniversaire de tonton Ali','family',0,47],['Anniversaire de Sophie','friends',1,21],['Anniversaire de Karim','mine',0,75]] as const).map(([title,circle,owner,offset])=>({id:id(),title,category:'birthday',circle,person:-1,status:'scheduled',date:day(offset-365*30),time:'',bookBy:'',location:'',note:'',visibility:'shared',recurrence:'yearly',endDate:'',repeatUntil:'',owner,version:1,createdAt:now})),{id:id(),title:'Dîner chez nos amis',category:'party',person:-1,status:'scheduled',date:day(4),time:'20:00',bookBy:'',location:'',note:'',visibility:'shared',recurrence:'none',endDate:'',repeatUntil:'',owner:1,version:1,createdAt:now}],
  activity:[],devices:[],call:null,sequence:0,templates:[],ideas:[],plants:[],
  gifts:[{id:id(),owner:0,recipient:1,title:'Un collier avec nos initiales',note:'Idée secrète d’Abdellah : passez sur son compte pour la voir.',link:'',price:6500,secret:true,bought:false,version:1,createdAt:now},{id:id(),owner:1,recipient:-1,other:'Sophie',title:'Un bon pour un massage',note:'Pour ses 30 ans.',link:'',price:4500,secret:false,bought:false,version:1,createdAt:now},{id:id(),owner:1,recipient:-1,title:'Un week-end à la mer',note:'',link:'',price:null,secret:false,bought:false,version:1,createdAt:now}],
  children:[],
  pets:[{id:id(),owner:0,name:'Biscuit',kind:'dog',breed:'Croisé',tone:'beurre',birthDate:day(-1450),note:'Croquettes matin et soir.',every:{food:1,walk:1,litter:0,groom:7,health:90},last:{food:day(-1),walk:day(-2),litter:day(-1),groom:day(-3),health:day(-30)},careLog:[],version:1,createdAt:now}]} as unknown as State;
}
const load=():State=>memory??=read<State>(STATE_KEY,seed);
function mutate<T>(fn:(s:State)=>T):T{const s=structuredClone(load());const result=fn(s);memory=s;write(STATE_KEY,s);return result;}

type Chat={id:string;member:number;text:string;created_at:string;version:number;edited_at:string|null;deleted:'everyone'|null;hidden:number[]};
function chatProjection(actor:number){const all=read<Chat[]>(CHAT_KEY,()=>[]);return {messages:attachChatCards(all.filter(m=>!m.hidden.includes(actor)).map(m=>({id:m.id,member:m.member,created_at:m.created_at,version:m.version,deleted:m.deleted,text:m.deleted?'':m.text,edited_at:m.edited_at,editable_until:m.member===actor&&!m.deleted?new Date(Date.parse(m.created_at)+15*60000).toISOString():null,voice_id:null,voice_duration:null,attachment_id:null,attachment_name:null,attachment_mime:null,attachment_bytes:null})),(load() as ChatCardState).chatCards),hasMore:false,serverNow:new Date().toISOString()};}
function chatChange(p:any,actor:number){
 const all=read<Chat[]>(CHAT_KEY,()=>[]);
 if(p.action==='send'){if(p.voiceId||p.attachmentId)throw new ApiError(400,'Vocaux et fichiers : '+unavailable.toLowerCase());
  // Same checks as house-api: a card is built from the sender's own view of the house.
  let text=String(p.text||'').slice(0,2000);if((p.card||p.sticker)&&!all.some(m=>m.id===p.id)){const v=chatInput.parse(p);const now=new Date().toISOString();text=mutate(s=>{if(v.sticker){storeChatCard(s as ChatCardState,v.id!,{member:actor,kind:'sticker',ref:v.sticker,at:now});return stickerText(v.sticker);}const card=buildChatCard(s,v.card!,actor);storeChatCard(s as ChatCardState,v.id!,{member:actor,kind:v.card!.kind,ref:card.ref,data:card.data,...(v.text?{note:v.text}:{}),at:now});return card.summary;});}
  if(!all.some(m=>m.id===p.id))all.push({id:p.id,member:actor,text,created_at:new Date().toISOString(),version:1,edited_at:null,deleted:null,hidden:[]});}
 else if(p.action==='clear'){if(p.scope==='everyone')mutate(s=>dropChatCards(s as ChatCardState,(_,r)=>r.member===actor));for(const m of all)if(!m.hidden.includes(actor))m.hidden.push(actor);}
 else{const m=all.find(m=>m.id===p.id);if(!m)throw new ApiError(404,'Ce message n’est plus visible.');
  if(p.action==='hide'||p.action==='delete'&&p.scope!=='everyone'){m.hidden.push(actor);}
  else{if(m.member!==actor)throw new ApiError(403,'Vous contrôlez uniquement vos propres messages.');
   if(p.action==='delete'){m.deleted='everyone';m.version++;mutate(s=>dropChatCards(s as ChatCardState,id=>id===m.id));}
   else{if(Date.now()>Date.parse(m.created_at)+15*60000)throw new ApiError(400,'Le délai de modification est passé.');m.text=String(p.text||'').slice(0,2000);m.edited_at=new Date().toISOString();m.version++;}}}
 write(CHAT_KEY,all);
}

function route(path:string,method:string,url:URL,p:any){
 const actor=member();
 switch(path){
  // Trial only: no server or AI here, so any photo or link fills in the same example recipe, to try the flow.
  case 'recipe-import':return {method:'structured',draft:{title:'Gratin de courgettes (exemple d’import)',group:'Végétarien',difficulty:'Facile',minutes:40,servings:2,ingredients:['2 courgettes','2 œufs','10 cl de crème','50 g de gruyère râpé','Sel, poivre'],steps:['Couper les courgettes en rondelles et les faire revenir 5 minutes.','Battre les œufs avec la crème, saler, poivrer.','Verser sur les courgettes, parsemer de gruyère et cuire 25 minutes à 200 °C.'],sourceUrl:p.kind==='url'?String(p.url||''):'',sourceTitle:p.kind==='url'?'Page importée (essai)':'Photo importée (essai)'}};
  case 'access':if(p.action==='logout'){reset();return {ok:true};}return {configured:true};
  case 'household':
   if(method==='GET'){const s=load();return {member:actor,profiles:s.profiles||{},meals:mealProjection(s,actor),household:s.household,entries:s.entries,items:s.items,appointments:visibleAppointments(s,actor),templates:s.templates||[],ideas:s.ideas||[],plants:s.plants||[],gifts:visibleGifts(s,actor),pets:(s as {pets?:unknown[]}).pets||[],children:(s as {children?:unknown[]}).children||[],shoppingPending:!!s.shoppingPending?.[actor],familyMode:!!s.familyMode,petsMode:!!(s as {petsMode?:boolean}).petsMode,giftsMode:giftsOn(s as {giftsMode?:Record<string,boolean>},actor),colors:s.colors||{}};}
   mutate(s=>householdMutation(s,p,actor));return {ok:true};
  case 'meals':if(method==='POST')mutate(s=>p.action==='draw'?mealDraw(s,p,actor):mealVote(s,p,actor));return mealProjection(load(),actor);
  case 'recipes':{if(method==='POST'){if(p.action==='discover'||p.action==='toggle')throw new ApiError(400,'Les idées de recettes par IA : '+unavailable.toLowerCase());mutate(s=>recipeMutation(s,p,actor));}
   const s=load() as any;return {recipes:[...(s.generatedRecipes||[]),...(s.personalRecipes||[])],favorites:s.recipeFavorites?.[actor]||[],plans:s.mealPlans||[],menus:s.mealPlanTemplates||[],member:actor,discovery:discoveryProjection(s,false)};}
  case 'ai-settings':if(method==='POST')throw new ApiError(400,unavailable);return {configured:false,canConfigure:false,discovery:discoveryProjection(load() as any,false)};
  case 'places':if(method==='POST')mutate(s=>placeMutation(s,p,actor));return {places:load().favoritePlaces||[]};
  case 'place-search':return {places:[]};
  case 'photos':{const photos=read<Record<string,{data:string;owner:number}>>(PHOTOS_KEY,()=>({}));
   if(method==='GET'){const photo=photos[url.searchParams.get('id')||''];if(!photo)throw new ApiError(404,'Photo introuvable.');return {data:photo.data};}
   if(typeof p.data!=='string'||!p.data.startsWith('data:image/jpeg;base64,'))throw new ApiError(400,'Choisissez une image JPEG valide.');if(photos[p.id]&&photos[p.id].owner!==actor)throw new ApiError(403,'Cette photo appartient à un autre compte.');
   photos[p.id]={data:p.data,owner:actor};write(PHOTOS_KEY,photos);return {id:p.id};}
  case 'chat-settings':{const key='nous-deux-essai-chat-theme-'+actor;if(method==='POST')write(key,p.theme);return {theme:read(key,()=>'rose')};}
  case 'chat':if(method==='POST')chatChange(p,actor);return chatProjection(actor);
  case 'calls':return {call:null};
  case 'daily-calls':if(method==='POST')throw new ApiError(400,'Les appels : '+unavailable.toLowerCase());return {configured:false,call:null,history:[]};
  case 'notifications':if(method==='POST')throw new ApiError(400,'Les notifications : '+unavailable.toLowerCase());return {publicKey:'',enabled:false,preferences:defaultPreferences,activity:load().activity.slice(0,50)};
  default:throw new ApiError(400,unavailable);
 }
}

export function hasSession(){return true;}
export async function apiFetch(path:string,init:RequestInit={}){
 const url=new URL(path,'https://local.invalid'),method=(init.method||'GET').toUpperCase();
 await new Promise(r=>setTimeout(r,120));
 try{const p=method==='POST'&&typeof init.body==='string'?JSON.parse(init.body):{};return Response.json(route(url.pathname.replace('/api/',''),method,url,p)??{ok:true});}
 catch(e){const status=typeof (e as {status?:unknown})?.status==='number'?(e as {status:number}).status:400;
  const message=e&&typeof e==='object'&&'issues'in e?'Vérifiez les champs du formulaire.':e instanceof Error?e.message:unavailable;return Response.json({error:message},{status});}
}

function reset(){for(const key of [STATE_KEY,PHOTOS_KEY,CHAT_KEY])try{localStorage.removeItem(key);}catch{}memory=null;location.reload();}

// A visible band so nobody mistakes the trial for the real household.
function band(){
 if(document.getElementById('essai-band'))return;
 const bar=document.createElement('div');bar.id='essai-band';bar.setAttribute('role','note');
 bar.style.cssText='position:sticky;top:0;z-index:200;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;padding:6px 12px;background:var(--beurre,#fff1b8);color:var(--ink,#1f1d1a);font:600 13px/18px var(--font-sans,system-ui)';
 const label=document.createElement('span');label.textContent='Mode essai · fausses données, rien n’est enregistré dans votre vraie maison';
 const select=document.createElement('select');select.setAttribute('aria-label','Essayer en tant que');select.style.cssText='min-height:36px;width:auto;padding:4px 8px;font:inherit';
 ['Abdellah','Laura'].forEach((n,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent='Je suis '+n;o.selected=i===member();select.append(o);});
 select.onchange=()=>{write(MEMBER_KEY,Number(select.value));location.reload();};
 const again=document.createElement('button');again.type='button';again.textContent='Recommencer';again.style.cssText='min-height:36px;padding:4px 12px;border-radius:999px;background:var(--ink,#1f1d1a);color:var(--on-ink,#fff)';
 again.onclick=()=>{if(confirm('Effacer cet essai et repartir des données de départ ?'))reset();};
 bar.append(label,select,again);document.body.prepend(bar);
}
if(typeof document!=='undefined'){if(document.body)band();else document.addEventListener('DOMContentLoaded',band);}
// No service worker in a trial: it would cache this build under the real app's name.
try{if(navigator.serviceWorker)Object.defineProperty(navigator.serviceWorker,'register',{value:()=>Promise.reject(new Error('essai'))});}catch{}
