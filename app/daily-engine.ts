import type {DailyCall,DailyParticipant} from '@daily-co/daily-js';
import {callFailureMessage} from './call-errors';
export type CallMedia={local?:DailyParticipant;remote?:DailyParticipant};
export type CallEngineCallbacks={media:(m:CallMedia)=>void;network:(state:'connecting'|'connected'|'reconnecting')=>void;error:(message:string,fatal:boolean)=>void;left:()=>void};
export async function createCallEngine(callbacks:CallEngineCallbacks){
 const {default:Daily}=await import('@daily-co/daily-js');
 if(!Daily.supportedBrowser().supported)throw new Error('Ce navigateur ne permet pas les appels. Essayez une version récente de Safari ou Chrome.');
 const call:DailyCall=Daily.createCallObject({dailyConfig:{avoidEval:true},startVideoOff:true});
 let destroyed=false;
 const update=()=>{if(destroyed)return;const participants=Object.values(call.participants());const remote=participants.find(p=>!p.local);callbacks.media({local:participants.find(p=>p.local),remote});if(remote)callbacks.network('connected');};
 call.on('participant-joined',update).on('participant-updated',update).on('participant-left',()=>{update();callbacks.network('reconnecting');}).on('track-started',update).on('track-stopped',update);
 call.on('joined-meeting',()=>{callbacks.network('connecting');update();});
 call.on('network-connection',e=>{if(e?.event==='interrupted')callbacks.network('reconnecting');if(e?.event==='connected')update();});
 call.on('camera-error',()=>callbacks.error('Vérifiez l’accès au microphone et à la caméra dans les réglages du navigateur.',false));
 call.on('error',e=>callbacks.error(callFailureMessage(e),true));
 call.on('left-meeting',()=>{if(!destroyed)callbacks.left();});
 return {
  async prepare(video:boolean){await call.startCamera({startVideoOff:!video,startAudioOff:false});update();},
  async join(url:string,token:string){await call.join({url,token});update();},
  mute(value:boolean){call.setLocalAudio(!value);update();},
  async camera(value:boolean){if(value)await call.startCamera({startVideoOff:false});else call.setLocalVideo(false);update();},
  async flip(){await call.cycleCamera({preferDifferentFacingMode:true});update();},
  async microphone(id:string){await call.setInputDevicesAsync({audioDeviceId:id});},
  async destroy(){if(destroyed)return;destroyed=true;try{await call.leave();}finally{await call.destroy();}}
 };
}
export type CallEngine=Awaited<ReturnType<typeof createCallEngine>>;
