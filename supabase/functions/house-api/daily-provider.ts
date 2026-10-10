// Provider credentials never leave the Edge Function. No recordings or transcription.
export class DailyError extends Error { constructor(public status:number,message:string){super(message);} }
export const CALL_LIMIT_MS=2*60*60*1000;
export function roomSettings(name:string,expiresAt:number){return {name,privacy:'private',properties:{exp:Math.floor(expiresAt/1000),eject_at_room_exp:true,max_participants:2,enforce_unique_user_ids:true,enable_knocking:false,enable_screenshare:false,enable_chat:false,enable_recording:false,enable_transcription_storage:false,enable_dialout:false,start_video_off:true,permissions:{canSend:['audio','video'],canAdmin:false}}};}
export function tokenSettings(room:string,member:number,name:string,video:boolean,now:number){return {properties:{room_name:room,user_id:'nous-deux-'+member,user_name:name.slice(0,100),is_owner:false,nbf:Math.floor(now/1000)-5,exp:Math.floor(now/1000)+180,start_video_off:!video,enable_screenshare:false,enable_recording_ui:false,start_cloud_recording:false,auto_start_transcription:false,permissions:{canSend:['audio','video'],canAdmin:false}}};}
export function dailyProvider(key:string,request:typeof fetch=fetch){
 async function api(path:string,method='GET',body?:unknown,missingOK=false){
  let r:Response;try{r=await request('https://api.daily.co/v1/'+path,{method,headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)}),redirect:'error',signal:AbortSignal.timeout(12000)});}catch{throw new DailyError(502,'Daily ne répond pas. Réessayez dans un instant.');}
  if(missingOK&&r.status===404)return null;
  if(!r.ok)throw new DailyError(r.status===429?429:502,r.status===429?'Trop de demandes d’appel. Patientez un instant.':'Le service d’appel est indisponible.');
  const text=await r.text();return text?JSON.parse(text):{};
 }
 return {
  async room(name:string,expiresAt:number){
   let room;try{room=await api('rooms','POST',roomSettings(name,expiresAt));}catch(error){room=await api('rooms/'+name,'GET',undefined,true);if(!room)throw error;}
   if(room.name!==name||room.privacy!=='private'||!/^https:\/\/[a-z0-9-]+\.daily\.co\/[a-z0-9-]+$/i.test(room.url)||room.config?.max_participants!==2||room.config?.exp!==Math.floor(expiresAt/1000)||room.config?.eject_at_room_exp!==true||![false,''].includes(room.config?.enable_recording))throw new DailyError(502,'La salle privée n’a pas pu être vérifiée.');
   return room.url as string;
  },
  async token(room:string,member:number,name:string,video:boolean,now=Date.now()){const r=await api('meeting-tokens','POST',tokenSettings(room,member,name,video,now));if(typeof r.token!=='string'||!r.token)throw new DailyError(502,'Accès temporaire indisponible.');return r.token as string;},
  async close(room:string){
   // Expire admissions first; eject both known identities, then remove the room.
   let failed:unknown;
   for(const [path,method,body] of [
    ['rooms/'+room,'POST',{properties:{exp:Math.floor(Date.now()/1000)+5,eject_at_room_exp:true}}],
    ['rooms/'+room+'/eject','POST',{user_ids:['nous-deux-0','nous-deux-1'],ban:true}],
    ['rooms/'+room,'DELETE',undefined]
   ] as const){try{await api(path,method,body,true);}catch(error){failed=error;}}
   if(failed)throw failed; // Keep retry pending even if a later cleanup step succeeds.
  }
 };
}
