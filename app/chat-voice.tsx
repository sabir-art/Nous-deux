import {useEffect,useRef,useState} from 'react';
import {Mic,Square,Send,Trash2,Play,RefreshCw} from './icons';
import {apiFetch} from '../lib/api-client';
const MAX_MS=180000,MAX_BYTES=8*1024*1024;
export const voiceTime=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
export function recordingMime(){return ['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'].find(m=>MediaRecorder.isTypeSupported(m));}
function pauseOthers(current:HTMLAudioElement){document.querySelectorAll('audio').forEach(audio=>{if(audio!==current)audio.pause();});}
export function VoiceMessage({id,duration}:{id:string;duration:number}){
 const[url,setUrl]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');const alive=useRef(true),audio=useRef<HTMLAudioElement>(null);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 async function load(){if(busy)return;setBusy(true);setError('');try{const r=await apiFetch('/api/voices?id='+id);const d=await r.json();if(!r.ok)throw Error(d.error||'Lecture indisponible.');if(alive.current)setUrl(d.url);}catch(e){if(alive.current)setError(e instanceof Error?e.message:'Lecture indisponible.');}finally{if(alive.current)setBusy(false);}}
 return <div className="voice-message"><span className="voice-caption"><Mic size={16}/>Message vocal · {voiceTime(duration)}</span>{url&&!error?<audio ref={audio} controls preload="metadata" src={url} aria-label="Écouter le message vocal" onPlay={e=>pauseOthers(e.currentTarget)} onError={()=>setError('La lecture a expiré ou a été interrompue. Rechargez le vocal.')}/>:<button type="button" className="secondary" disabled={busy} onClick={load}>{error?<RefreshCw size={18}/>:<Play size={18}/>} {busy?'Chargement…':error?'Réessayer la lecture':'Écouter le vocal'}</button>}{error&&<p className="helper-copy" role="alert">{error}</p>}</div>;
}
export function VoiceRecorder({onClose,onSent}:{onClose:()=>void;onSent:()=>Promise<void>}){
 const[phase,setPhase]=useState<'starting'|'recording'|'stopping'|'preview'|'sending'|'failed'>('starting'),[elapsed,setElapsed]=useState(0),[preview,setPreview]=useState(''),[error,setError]=useState('');
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),generation=useRef(0),started=useRef(0),blob=useRef<Blob|null>(null),objectUrl=useRef(''),duration=useRef(0),voiceId=useRef(crypto.randomUUID()),messageId=useRef(crypto.randomUUID()),uploaded=useRef(false),uploading=useRef(false);
 const stopTracks=()=>{stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;};
 const stop=()=>{if(recorder.current?.state==='recording'){duration.current=Math.max(300,Math.min(MAX_MS,Date.now()-started.current));setPhase('stopping');recorder.current.stop();stopTracks();}};
 useEffect(()=>{
  const token=++generation.current;let timer:ReturnType<typeof setInterval>|undefined;const chunks:BlobPart[]=[];let bytes=0;
  async function start(){try{
   if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw Error('Ce navigateur ne permet pas l’enregistrement. Ouvrez l’application dans Safari ou Chrome à jour.');
   const input=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
   if(token!==generation.current){input.getTracks().forEach(t=>t.stop());return;}stream.current=input;
   const mimeType=recordingMime(),r=new MediaRecorder(input,{...(mimeType?{mimeType}:{}),audioBitsPerSecond:64000});recorder.current=r;
   r.ondataavailable=e=>{if(token!==generation.current)return;if(e.data.size){chunks.push(e.data);bytes+=e.data.size;if(bytes>MAX_BYTES&&r.state==='recording')stop();}};
   r.onstop=()=>{stopTracks();clearInterval(timer);if(token!==generation.current)return;if(!duration.current)duration.current=Math.max(300,Math.min(MAX_MS,Date.now()-started.current));const audio=new Blob(chunks,{type:r.mimeType||mimeType||'audio/mp4'});if(audio.size<12||audio.size>MAX_BYTES){setError('L’enregistrement est vide ou trop volumineux. Essayez un message plus court.');setPhase('failed');return;}blob.current=audio;objectUrl.current=URL.createObjectURL(audio);setPreview(objectUrl.current);setElapsed(duration.current);setPhase('preview');};
   r.onerror=()=>{if(token===generation.current){setError('Le micro a été interrompu. Vérifiez le vocal avant de l’envoyer.');stop();}};
   started.current=Date.now();r.start(500);setPhase('recording');timer=setInterval(()=>{const ms=Date.now()-started.current;setElapsed(Math.min(ms,MAX_MS));if(ms>=MAX_MS)stop();},200);
   input.getAudioTracks().forEach(t=>t.addEventListener('ended',stop,{once:true}));
  }catch(e){if(token!==generation.current)return;stopTracks();setPhase('failed');setError(e instanceof DOMException&&e.name==='NotAllowedError'?'Autorisez le micro dans les réglages du navigateur pour enregistrer un vocal.':e instanceof Error?e.message:'Micro indisponible.');}}
  const hide=()=>{if(document.visibilityState==='hidden')stop();};const pageHide=()=>stop();
  start();document.addEventListener('visibilitychange',hide);window.addEventListener('pagehide',pageHide);
  return()=>{++generation.current;clearInterval(timer);document.removeEventListener('visibilitychange',hide);window.removeEventListener('pagehide',pageHide);const r=recorder.current;if(r){r.ondataavailable=null;r.onstop=null;r.onerror=null;if(r.state!=='inactive')r.stop();}stopTracks();if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);};
 },[]);
 async function send(){if(uploading.current||!blob.current)return;uploading.current=true;setPhase('sending');setError('');try{
  if(!uploaded.current){const r=await apiFetch('/api/voice-upload?id='+voiceId.current+'&duration='+duration.current,{method:'POST',headers:{'Content-Type':blob.current.type},body:blob.current,signal:AbortSignal.timeout(60000)});const d=await r.json();if(!r.ok)throw Error(d.error||'Le vocal n’a pas été téléversé.');uploaded.current=true;}
  const r=await apiFetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'send',id:messageId.current,voiceId:voiceId.current}),signal:AbortSignal.timeout(20000)});const d=await r.json();if(!r.ok)throw Error(d.error||'Envoi impossible.');await onSent();onClose();
 }catch(e){setError((e instanceof Error?e.message:'Connexion interrompue.')+' Votre vocal est conservé ici.');setPhase('preview');}finally{uploading.current=false;}}
 async function discard(){if(uploading.current)return;if(uploaded.current){try{await apiFetch('/api/voices',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'discard',id:voiceId.current})});}catch{/* An unlinked draft stays private. */}}onClose();}
 return <div className="voice-recorder" aria-label="Enregistrer un message vocal"><div className="voice-record-status"><span className={phase==='recording'?'recording-dot':''} aria-hidden="true"><Mic size={20}/></span><strong>{phase==='starting'?'Ouverture du micro…':phase==='recording'?'Je vous écoute…':phase==='sending'?'Envoi du vocal…':phase==='stopping'?'Préparation…':phase==='failed'?'Micro indisponible':'Votre petit mot, en voix'}</strong><time aria-label="Durée enregistrée">{voiceTime(elapsed)}</time></div>{phase==='recording'&&<p className="helper-copy">3 minutes maximum · Vous pourrez réécouter avant l’envoi.</p>}{preview&&<audio controls src={preview} aria-label="Réécouter mon vocal avant de l’envoyer" onPlay={e=>pauseOthers(e.currentTarget)}/>}<div className="voice-record-actions"><button type="button" className="secondary" disabled={phase==='sending'} onClick={discard}><Trash2 size={18}/>Annuler</button>{phase==='recording'&&<button type="button" className="primary" onClick={stop}><Square size={16}/>Terminer</button>}{(phase==='preview'||phase==='sending')&&<button type="button" className="primary" disabled={phase==='sending'} onClick={send}><Send size={18}/>{phase==='sending'?'Envoi…':'Envoyer'}</button>}</div>{error&&<p className="form-error" role="alert">{error}</p>}</div>;
}
