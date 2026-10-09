import {mealVote,type MealState} from './meals.ts';
import {parisDate,plantCare} from './life.ts';
import {entryInput,itemInput,householdInput,deleteInput,appointmentInput,shoppingCheckInput,templateInput,templateApplyInput,ideaInput,ideaResponseInput,plantInput,plantCareInput} from './validation.ts';
import {deviceInput,memberInput,preferenceInput,subscriptionInput,changeDescription} from './communication.ts';
export class ApiError extends Error{constructor(public status:number,message:string){super(message);}}
export type State=MealState&{profiles?:Record<string,string|null>;household:any;entries:any[];items:any[];appointments:any[];activity:any[];devices:any[];call:any;sequence:number;templates?:any[];templateApplications?:string[];ideas?:any[];plants?:any[];plantReminderDays?:Record<string,string>};
const conflict=()=>{throw new ApiError(409,'Cet élément a changé sur un autre appareil. Fermez puis rouvrez le formulaire.');};
export function householdMutation(s:State,p:any,actor:number){
 if(actor!==0&&actor!==1)throw new ApiError(403,'Compte personnel requis.');
 const {action,payload}=p;if(typeof action!=='string')throw new ApiError(400,'Action invalide.');const previous=action.includes('appointment')?s.appointments.find(a=>a.id===payload?.id):null;const now=new Date().toISOString();

 if(['idea','idea-response','delete-idea','plant','plant-care','plant-care-all','delete-plant'].includes(action))return lifeMutation(s,action,payload,actor,now);
 if(action==='meal-vote'){mealVote(s,payload,actor);return null;}
 if(action==='profile-photo'){
  const id=payload?.photoId;if(id!==null&&(typeof id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)))throw new ApiError(400,'Photo invalide.');
  s.profiles??={};s.profiles[actor]=id;return null;
 }
 if(action==='shopping-check'){
  const v=shoppingCheckInput.parse(payload),item=s.items.find(i=>i.id===v.id&&i.kind==='shopping');
  if(!item||item.version!==v.version)conflict();
  if(item.done&&!v.done&&item.purchasedBy!=null&&item.purchasedBy!==actor)throw new ApiError(403,'Seule la personne qui a coché cet achat peut l’annuler.');
  if(item.done!==v.done)Object.assign(item,{done:v.done,purchasedBy:v.done?actor:null,purchasedAt:v.done?now:null,version:item.version+1});
  return {category:'shopping',message:v.done?'a coché un achat dans les courses.':'a remis un article à acheter.'};
 }
 if(action==='template-create'){
  const v=templateInput.parse(payload);if(weekMonday(v.weekStart)!==v.weekStart)throw new ApiError(400,'Choisissez une semaine.');
  s.templates??=[];if(s.templates.some(t=>t.id===v.id))return null;
  if(s.templates.length>=50)throw new ApiError(400,'Vous pouvez conserver 50 listes types. Supprimez-en une pour continuer.');
  const items=s.items.filter(i=>i.kind==='shopping'&&i.weekStart===v.weekStart).map(i=>({title:i.title,quantity:i.quantity}));
  if(!items.length||items.length>200)throw new ApiError(400,'La semaine doit contenir entre 1 et 200 articles.');
  s.templates.push({id:v.id,title:v.title,items,owner:actor,createdAt:now});return null;
 }
 if(action==='template-delete'){
  const t=s.templates?.find(t=>t.id===payload?.id);if(!t||t.owner!==actor)throw new ApiError(403,'Seul l’auteur peut supprimer cette liste type.');
  s.templates=s.templates!.filter(x=>x.id!==t.id);
  return null;
 }
 if(action==='template-apply'){
  const v=templateApplyInput.parse(payload);if(weekMonday(v.weekStart)!==v.weekStart)throw new ApiError(400,'Choisissez une semaine.');
  s.templateApplications??=[];if(s.templateApplications.includes(v.operationId))return null;
  const t=s.templates?.find(t=>t.id===v.id);if(!t)throw new ApiError(404,'Liste type introuvable.');
  for(const item of t.items)s.items.push({...item,id:crypto.randomUUID(),kind:'shopping',assignee:-1,due:'',priority:0,done:false,owner:actor,version:1,createdAt:now,weekStart:v.weekStart,purchasedBy:null,purchasedAt:null});
  s.templateApplications.push(v.operationId);return {category:'shopping',message:'a ajouté une liste type aux courses.'};
 }
 if(action==='household'){const home=householdInput.parse(payload);if(s.household&&home[actor===0?'second':'first']!==s.household[actor===0?'second':'first'])throw new ApiError(403,'Vous ne pouvez pas modifier le profil de votre moitié.');if((s.household?.version||0)!==home.version)conflict();s.household={...home,version:home.version+1};}
 else{
  if(!s.household)throw new ApiError(400,'Configurez votre maison.');
  const list=action.includes('appointment')?'appointments':action.includes('entry')?'entries':action==='item'||action==='delete-item'?'items':null;
  if(!list)throw new ApiError(400,'Action inconnue.');
  const existing=s[list].find(x=>x.id===payload?.id);if(existing&&existing.owner!==actor)throw new ApiError(403,'Seul l’auteur peut modifier ou supprimer cet élément.');
  if(list==='entries'&&!action.startsWith('delete-')&&payload?.member!==actor)throw new ApiError(403,'Enregistrez uniquement vos propres paiements.');
  if(action.startsWith('delete-')){const v=deleteInput.parse(payload);const i=s[list].findIndex(x=>x.id===v.id);if(i<0||s[list][i].version!==v.version)conflict();s[list].splice(i,1);}
  else{const v=(list==='entries'?entryInput:list==='items'?itemInput:appointmentInput).parse(payload);const i=s[list].findIndex(x=>x.id===v.id);if(i<0&&v.version!==0||i>=0&&s[list][i].version!==v.version)conflict();if(list==='items'&&existing&&existing.kind!==v.kind)throw new ApiError(400,'Le type de liste ne peut pas changer.');if(list==='items'&&v.kind==='shopping'&&((existing&&v.done!==existing.done)||(!existing&&v.done)))throw new ApiError(400,'Utilisez la case achat pour cocher un article.');const value={...v,...(list==='items'&&v.kind==='shopping'?{note:v.note??existing?.note??'',photoId:v.photoId===undefined?existing?.photoId??null:v.photoId,weekStart:weekMonday(v.weekStart||existing?.weekStart||parisToday()),purchasedBy:existing?.purchasedBy??null,purchasedAt:existing?.purchasedAt??null}:{}),owner:actor,version:v.version+1,createdAt:i<0?now:s[list][i].createdAt};if(i<0)s[list].push(value);else s[list][i]=value;}
 }
 // Private changes never enter the shared activity feed or trigger partner push.
 const current=action.includes('appointment')?s.appointments.find(a=>a.id===payload?.id):null;
 if((current?.visibility||previous?.visibility)==='private'){s.activity=s.activity.filter(a=>a.appointmentId!==payload?.id);return null;}
 const note=changeDescription(action,payload||{});if(note&&(actor===0||actor===1)){s.sequence=(s.sequence||0)+1;s.activity.unshift({id:s.sequence,actor,...note,...(action.includes('appointment')?{appointmentId:payload.id}:{}),createdAt:now});s.activity=s.activity.filter(e=>Date.parse(e.createdAt)>Date.now()-90*86400000).slice(0,500);return note;}return null;
}
export function callMutation(s:State,p:any){
 const id=deviceInput.parse(p.id),session=deviceInput.parse(p.session),member=memberInput.parse(p.member),now=Date.now();
 const description=(value:any)=>{if(typeof value!=='string'||value.length<20||value.length>30000||!value.startsWith('v=0')||!value.includes('m=audio')||value.includes('m=video'))throw new ApiError(400,'Description audio invalide.');return value;};
 if(p.action==='start'){if(!s.household)throw new ApiError(400,'Configurez votre maison.');if(s.call&&s.call.state!=='ended'&&s.call.expiresAt>now)throw new ApiError(409,'Un appel est déjà en cours.');s.call={id,caller:member,callerDevice:session,calleeDevice:'',offer:description(p.offer),answer:'',state:'ringing',expiresAt:now+120000,createdAt:new Date().toISOString()};return {call:s.call};}
 const c=s.call;if(!c||c.id!==id||c.state==='ended'||c.expiresAt<=now)throw new ApiError(410,'Cet appel est terminé.');
 const caller=c.callerDevice===session&&c.caller===member,callee=c.calleeDevice===session&&c.caller!==member;
 if(p.action==='answer'){if(member===c.caller||c.state!=='ringing')throw new ApiError(409,'Cet appel est déjà pris ou ne vous est pas destiné.');Object.assign(c,{answer:description(p.answer),calleeDevice:session,state:'connected',expiresAt:now+60000});return {call:c};}
 if(p.action==='end'){if(!caller&&!callee&&!(c.state==='ringing'&&member!==c.caller))throw new ApiError(403,'Cet appel est ouvert sur un autre appareil.');Object.assign(c,{state:'ended',offer:'',answer:'',expiresAt:now});return {ok:true};}
 if(p.action==='heartbeat'&&(caller||callee)){if(c.state==='connected')c.expiresAt=now+60000;return {ok:true};}throw new ApiError(403,'Action non autorisée.');
}
export function deviceMutation(s:State,p:any){const deviceId=deviceInput.parse(p.deviceId);const i=s.devices.findIndex(d=>d.deviceId===deviceId);
 if(p.action==='disable'){if(i>=0)s.devices.splice(i,1);return;}
 if(!['subscribe','preferences'].includes(p.action))throw new ApiError(400,'Action inconnue.');
 const member=memberInput.parse(p.member),preferences=preferenceInput.parse(p.preferences);
 if(p.action==='preferences'){if(i>=0)Object.assign(s.devices[i],{member,preferences});return;}
 const subscription=subscriptionInput.parse(p.subscription);if(i<0&&s.devices.length>=12)throw new ApiError(400,'Limite de 12 appareils atteinte.');const d={deviceId,member,preferences,subscription};if(i<0)s.devices.push(d);else s.devices[i]=d;
}

export function visibleAppointments(s:State,actor:number){return s.appointments.filter(a=>a.visibility!=='private'||a.owner===actor);}

export function weekMonday(date:string){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10);}
const parisToday=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function authorizeChat(message:any,actor:number,version:number|undefined){if(!message||message.member!==actor)throw new ApiError(403,'Vous pouvez modifier uniquement vos messages.');if(message.version!==version)conflict();}

function lifeMutation(s:State,action:string,p:any,actor:number,now:string){
 const isIdea=action.includes('idea');const list=isIdea?(s.ideas??=[]):(s.plants??=[]);const old=list.find(x=>x.id===p?.id);const date=parisDate();
 if(action==='idea-response'){
  const v=ideaResponseInput.parse(p);if(!old||old.owner===actor)throw new ApiError(403,'Seule la personne invitée peut répondre.');
  if(old.version!==v.version||old.status!=='pending')conflict();Object.assign(old,{status:v.status,responseNote:v.responseNote,respondedAt:now,version:old.version+1});
 }else if(action==='plant-care-all'){
  const v=deleteInput.parse(p);if(!old||old.version!==v.version)conflict();
  const due=plantCare(old,date).filter(c=>c.overdue>=0&&!old.careLog?.some((l:any)=>l.kind===c.kind&&l.date===date));
  if(!due.length)throw new ApiError(409,'Tous les soins du jour sont déjà faits.');
  for(const c of due){old[c.kind==='water'?'lastWater':c.kind==='light'?'lastLight':'lastFeed']=date;old.careLog=[{kind:c.kind,actor,date,at:now},...(old.careLog||[])].slice(0,100);}old.version++;
 }else if(action==='plant-care'){
  const v=plantCareInput.parse(p);if(!old||old.version!==v.version)conflict();if(!plantCare(old,date).some(c=>c.kind===v.kind))throw new ApiError(400,'Ce soin n’est pas activé.');
  const key=v.kind==='water'?'lastWater':v.kind==='light'?'lastLight':'lastFeed';
  if(old.careLog?.some((c:any)=>c.kind===v.kind&&c.date===date))throw new ApiError(409,'Ce soin a déjà été noté aujourd’hui.');
  old[key]=date;old.careLog=[{kind:v.kind,actor,date,at:now},...(old.careLog||[])].slice(0,100);old.version++;
 }else{
  if(old&&old.owner!==actor)throw new ApiError(403,'Seul l’auteur peut modifier ou supprimer cette fiche.');
  if(action.startsWith('delete-')){const v=deleteInput.parse(p);if(!old||old.version!==v.version)conflict();list.splice(list.indexOf(old),1);}
  else{
   const v=(isIdea?ideaInput:plantInput).parse(p);if((old?.version||0)!==v.version)conflict();
   if(!old&&list.length>=(isIdea?300:100))throw new ApiError(400,'La limite de fiches est atteinte. Supprimez une ancienne fiche pour continuer.');
   if(!isIdea&&['lastWater','lastLight','lastFeed'].some(k=>v[k]>date))throw new ApiError(400,'Un soin déjà effectué ne peut pas être dans le futur.');
   const value={...v,owner:actor,version:v.version+1,createdAt:old?.createdAt||now,...(isIdea?{status:'pending',responseNote:'',respondedAt:null}:{careLog:old?.careLog||[],...(old?{lastWater:old.lastWater,lastLight:old.lastLight,lastFeed:old.lastFeed}:{})})};
   if(old)list[list.indexOf(old)]=value;else list.push(value);
  }
 }
 const note={category:isIdea?'ideas':'plants',message:action==='idea-response'?(p.status==='accepted'?'a accepté votre invitation.':'a répondu « pas cette fois » à votre invitation.'):action==='idea'?'vous propose une activité à deux.':action.startsWith('plant-care')?'a pris soin d’une plante.':action==='plant'?'a mis à jour le petit jardin.':'a supprimé une fiche.'};
 s.sequence=(s.sequence||0)+1;s.activity.unshift({id:s.sequence,actor,...note,createdAt:now});s.activity=s.activity.slice(0,500);return note;
}
export function claimPlantReminders(s:State,date:string){
 s.plantReminderDays??={};const targets=s.devices.filter(d=>(d.preferences?.plants??true)&&s.plantReminderDays![d.deviceId]!==date).flatMap(d=>{
 const due=(s.plants||[]).filter(p=>p.reminders&&(p.owner===d.member||p.remindBoth)&&plantCare(p,date).some(c=>c.overdue>=0));if(!due.length)return [];
 s.plantReminderDays![d.deviceId]=date;return [{device:d,count:due.length}];
 });for(const id of Object.keys(s.plantReminderDays))if(!s.devices.some(d=>d.deviceId===id))delete s.plantReminderDays[id];return targets;
}
