import {entryInput,itemInput,householdInput,deleteInput,appointmentInput} from './validation.ts';
import {deviceInput,memberInput,preferenceInput,subscriptionInput,changeDescription} from './communication.ts';
export class ApiError extends Error{constructor(public status:number,message:string){super(message);}}
export type State={household:any;entries:any[];items:any[];appointments:any[];activity:any[];devices:any[];call:any;sequence:number};
const conflict=()=>{throw new ApiError(409,'Cet élément a changé sur un autre appareil. Fermez puis rouvrez le formulaire.');};
export function householdMutation(s:State,p:any,actor:number){
 if(actor!==0&&actor!==1)throw new ApiError(403,'Compte personnel requis.');
 const {action,payload}=p;const previous=action.includes('appointment')?s.appointments.find(a=>a.id===payload?.id):null;const now=new Date().toISOString();
 if(action==='household'){const home=householdInput.parse(payload);if(s.household&&home[actor===0?'second':'first']!==s.household[actor===0?'second':'first'])throw new ApiError(403,'Vous ne pouvez pas modifier le profil de votre moitié.');if((s.household?.version||0)!==home.version)conflict();s.household={...home,version:home.version+1};}
 else{
  if(!s.household)throw new ApiError(400,'Configurez votre maison.');
  const list=action.includes('appointment')?'appointments':action.includes('entry')?'entries':action==='item'||action==='delete-item'?'items':null;
  if(!list)throw new ApiError(400,'Action inconnue.');
  const existing=s[list].find(x=>x.id===payload?.id);if(existing&&existing.owner!==actor)throw new ApiError(403,'Seul l’auteur peut modifier ou supprimer cet élément.');
  if(list==='entries'&&!action.startsWith('delete-')&&payload?.member!==actor)throw new ApiError(403,'Enregistrez uniquement vos propres paiements.');
  if(action.startsWith('delete-')){const v=deleteInput.parse(payload);const i=s[list].findIndex(x=>x.id===v.id);if(i<0||s[list][i].version!==v.version)conflict();s[list].splice(i,1);}
  else{const v=(list==='entries'?entryInput:list==='items'?itemInput:appointmentInput).parse(payload);const i=s[list].findIndex(x=>x.id===v.id);if(i<0&&v.version!==0||i>=0&&s[list][i].version!==v.version)conflict();const value={...v,owner:actor,version:v.version+1,createdAt:i<0?now:s[list][i].createdAt};if(i<0)s[list].push(value);else s[list][i]=value;}
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
