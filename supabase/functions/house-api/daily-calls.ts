import {dailyProvider,DailyError,CALL_LIMIT_MS} from './daily-provider.ts';
export {DailyError};
export type DailyRow={id:string;caller:number;mode:'audio'|'video';state:string;caller_device:string;callee_device:string|null;room_name:string;room_url:string|null;created_at:number;expires_at:number;max_expires_at:number;caller_seen:number;callee_seen:number|null;connected_at:number|null;ended_at:number|null;end_reason:string|null;version:number;notified:boolean;cleanup_pending:boolean;cleanup_after:number};
export const ACTIVE=['preparing','ringing','connecting','connected'];
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const ownsCall=(c:DailyRow,actor:number,device:string)=>c.caller===actor?c.caller_device===device:c.callee_device===device;
export function callProjection(c:DailyRow,actor:number,device:string){return {id:c.id,caller:c.caller,mode:c.mode,state:c.state,mine:ownsCall(c,actor,device),createdAt:c.created_at,expiresAt:c.expires_at,maxExpiresAt:c.max_expires_at,connectedAt:c.connected_at,endedAt:c.ended_at,endReason:c.end_reason};}
export function expiredState(c:DailyRow,now:number){if(!ACTIVE.includes(c.state))return null;if(c.max_expires_at<=now)return 'ended';if(c.expires_at<=now)return c.state==='ringing'?'missed':'failed';return null;}
export function transition(c:DailyRow,action:string,actor:number,device:string,now:number,connected=false):Partial<DailyRow>{
 if(![0,1].includes(actor))throw new DailyError(403,'Compte personnel requis.');
 const expired=expiredState(c,now);if(expired)throw new DailyError(410,'Cet appel est terminé.');
 const mine=ownsCall(c,actor,device);
 if(action==='accept'){
  if(actor===c.caller)throw new DailyError(403,'Cet appel ne vous est pas destiné.');
  if(['connecting','connected'].includes(c.state)&&mine)return {};
  if(c.state!=='ringing')throw new DailyError(409,'Cet appel est déjà pris ou terminé.');
  return {state:'connecting',callee_device:device,callee_seen:now,expires_at:Math.min(now+90000,c.max_expires_at)};
 }
 if(action==='decline'){
  if(actor===c.caller||c.state!=='ringing')throw new DailyError(409,'Cet appel ne peut plus être refusé.');
  return {state:'declined',ended_at:now,end_reason:'declined',cleanup_pending:true};
 }
 if(!mine)throw new DailyError(403,'Cet appel est ouvert sur un autre appareil.');
 if(action==='end')return ACTIVE.includes(c.state)?{state:'ended',ended_at:now,end_reason:c.connected_at?'completed':'cancelled',cleanup_pending:true}:{};
 if(!ACTIVE.includes(c.state))throw new DailyError(410,'Cet appel est terminé.');
 if(action==='heartbeat'){
  const patch:Partial<DailyRow>=actor===c.caller?{caller_seen:now}:{callee_seen:now};
  if(c.state==='ringing'||c.state==='preparing')return patch;
  const otherSeen=actor===c.caller?c.callee_seen:c.caller_seen;
  if(otherSeen&&otherSeen<now-240000)throw new DailyError(410,'La connexion de votre moitié a été interrompue.');
  patch.expires_at=Math.min(now+240000,c.max_expires_at);
  if(connected&&c.callee_device){patch.state='connected';patch.connected_at=c.connected_at||now;}
  return patch;
 }
 if(action==='join')return {};
 throw new DailyError(400,'Action d’appel inconnue.');
}
type DB=(path:string,method?:string,body?:unknown)=>Promise<any>;
type Options={db:DB;key:string;actor:number;device:string;names:string[];notify:(c:DailyRow)=>Promise<void>;now?:()=>number;defer?:(task:Promise<void>)=>void;provider?:ReturnType<typeof dailyProvider>};
export async function handleDailyCalls(method:string,url:URL,p:any,o:Options){
 const {db,actor,device,names}=o,now=o.now||Date.now,provider=o.provider||dailyProvider(o.key);
 if(![0,1].includes(actor))throw new DailyError(403,'Compte personnel requis.');
 if(!o.key){if(method==='GET')return {configured:false,call:null,history:[],estimatedMinutes:0};throw new DailyError(503,'Les appels Daily attendent leur activation.');}
 const read=async(id:string)=>(await db('nd_daily_calls?id=eq.'+id+'&limit=1'))[0] as DailyRow|undefined;
 const patch=async(c:DailyRow,fields:Partial<DailyRow>)=>(await db('nd_daily_calls?id=eq.'+c.id+'&version=eq.'+c.version,'PATCH',{...fields,version:c.version+1}))[0] as DailyRow|undefined;
 // Bounded maintenance. Records and call history are never deleted.
 const active:DailyRow[]=await db('nd_daily_calls?state=in.('+ACTIVE.join(',')+')');
 for(const c of active){const end=expiredState(c,now());if(end)await patch(c,{state:end,ended_at:Math.min(c.expires_at,c.max_expires_at),end_reason:c.max_expires_at<=now()?'time_limit':end==='missed'?'unanswered':'connection_lost',cleanup_pending:true});}
 const maintenance=async()=>{const pending:DailyRow[]=await db('nd_daily_calls?cleanup_pending=eq.true&cleanup_after=lte.'+now()+'&limit=3');
 for(const c of pending){const claimed=await patch(c,{cleanup_after:now()+60000});if(!claimed)continue;try{await provider.close(c.room_name);await patch(claimed,{cleanup_pending:false});}catch{/* Retry later. Room and token expiry remain the hard stop. */}}
 };if(o.defer)o.defer(maintenance().catch(()=>{}));else await maintenance();
 const snapshot=async()=>{
  const rows:DailyRow[]=await db('nd_daily_calls?order=created_at.desc&limit=31');
  const month=new Date(now());month.setUTCDate(1);month.setUTCHours(0,0,0,0);
  const usage=await db('rpc/nd_daily_usage','POST',{month_start:month.getTime(),at_time:now()});
  return {configured:true,call:rows.find(c=>ACTIVE.includes(c.state))?callProjection(rows.find(c=>ACTIVE.includes(c.state))!,actor,device):null,history:rows.filter(c=>!ACTIVE.includes(c.state)).slice(0,30).map(c=>callProjection(c,actor,device)),estimatedMinutes:Number(usage)||0};
 };
 if(method==='GET')return snapshot();
 if(!UUID.test(p.id||''))throw new DailyError(400,'Identifiant d’appel invalide.');
 if(!['start','accept','join','heartbeat','end','decline'].includes(p.action))throw new DailyError(400,'Action inconnue.');
 let c=await read(p.id);
 if(p.action==='start'){
  if(!['audio','video'].includes(p.mode))throw new DailyError(400,'Choisissez audio ou vidéo.');
  if(c){if(c.caller!==actor||c.caller_device!==device)throw new DailyError(403,'Cet identifiant appartient à un autre appel.');if(!ACTIVE.includes(c.state))throw new DailyError(410,'Cet appel est terminé.');}
  else{
   const hits=await db('rpc/nd_rate_hit','POST',{rate_key:'daily-start:'+actor+':'+Math.floor(now()/900000),expiry:now()+1800000});if(hits>15)throw new DailyError(429,'Vous avez lancé plusieurs appels. Réessayez dans quelques minutes.');
   const t=now();
   try{c=(await db('nd_daily_calls','POST',{id:p.id,caller:actor,caller_device:device,mode:p.mode,state:'preparing',room_name:'nd-'+p.id,created_at:t,expires_at:t+45000,max_expires_at:t+CALL_LIMIT_MS,caller_seen:t}))[0];}
   catch{const existing=await read(p.id);if(existing&&existing.caller===actor&&existing.caller_device===device)c=existing;else throw new DailyError(409,'Un autre appel est déjà en cours.');}
  }
  if(c!.state==='preparing'){
   try{const room=await provider.room(c!.room_name,c!.max_expires_at);const ready=await patch(c!,{room_url:room,state:'ringing',expires_at:now()+90000});c=ready||await read(p.id);}
   catch(e){const current=await read(p.id);if(current&&current.state==='preparing')await patch(current,{state:'failed',ended_at:now(),end_reason:'provider',cleanup_pending:true});throw e;}
  }
 }else{
  if(!c)throw new DailyError(404,'Appel introuvable.');
  let updated=false;for(let attempt=0;attempt<4;attempt++){const change=transition(c!,p.action,actor,device,now(),p.connected===true);if(!Object.keys(change).length){updated=true;break;}const next=await patch(c!,change);if(next){c=next;updated=true;break;}c=await read(p.id);if(!c)break;}if(!updated)throw new DailyError(409,'L’appel a changé. Réessayez.');
 }
 if(!c)throw new DailyError(410,'Cet appel est terminé.');
 if(['start','accept','join'].includes(p.action)){
  transition(c,'join',actor,device,now());if(!c.room_url)throw new DailyError(409,'La salle se prépare encore. Réessayez.');
  const token=await provider.token(c.room_name,actor,names[actor]||'Nous deux',c.mode==='video',now());
  const fresh=await read(c.id);if(!fresh||!ACTIVE.includes(fresh.state)||expiredState(fresh,now()))throw new DailyError(410,'Cet appel est terminé.');c=fresh;
  if(p.action==='start'&&!c.notified&&c.state==='ringing'){const claimed=await patch(c,{notified:true});if(claimed){c=claimed;try{await o.notify(c);}catch{/* Foreground polling still works; don't send duplicate pushes. */}}}
  return {call:callProjection(c,actor,device),join:{url:c.room_url,token}};
 }
 if(c.cleanup_pending){try{await provider.close(c.room_name);const fresh=await read(c.id);if(fresh)await patch(fresh,{cleanup_pending:false});}catch{}}
 return {call:ACTIVE.includes(c.state)?callProjection(c,actor,device):null,ended:callProjection(c,actor,device)};
}
