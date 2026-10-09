'use client';
import {apiFetch,APP_BASE} from '../lib/api-client';
import {useState,useEffect,useRef} from 'react';
import {Phone,PhoneOff,Mic,MicOff,Volume2} from 'lucide-react';
type Call={id:string;caller:number;callerDevice:string;calleeDevice:string;offer:string;answer:string;state:string;expiresAt:number};
const iceServers=[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}];
export default function HouseCalls({active,names,expanded,onOpen}:{active:number;names:string[];expanded:boolean;onOpen:()=>void}){
 const [call,setCall]=useState<Call|null>(null),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[muted,setMuted]=useState(false),[connected,setConnected]=useState(false),[elapsed,setElapsed]=useState(0),[audioBlocked,setAudioBlocked]=useState(false),[available,setAvailable]=useState(false);
 const session=useRef(''),peer=useRef<RTCPeerConnection|null>(null),stream=useRef<MediaStream|null>(null),audio=useRef<HTMLAudioElement|null>(null),current=useRef<Call|null>(null),localId=useRef(''),localMember=useRef(active),generation=useRef(0),operation=useRef(false),lastHeartbeat=useRef(0),connectionTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const post=async(action:string,id:string,extra:Record<string,unknown>={})=>{const r=await apiFetch('/api/calls',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,id,session:session.current,member:localMember.current,...extra})});const d=await r.json() as {error?:string;call:Call|null};if(!r.ok)throw new Error(d.error||'Appel indisponible.');return d;};
 const cleanup=()=>{generation.current++;if(connectionTimer.current)clearTimeout(connectionTimer.current);connectionTimer.current=null;const pc=peer.current;peer.current=null;pc?.close();stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;if(audio.current)audio.current.srcObject=null;localId.current='';setConnected(false);setMuted(false);setElapsed(0);setAudioBlocked(false);};
 const end=async()=>{const id=localId.current||current.current?.id;cleanup();current.current=null;setCall(null);setStatus('Appel terminé.');if(id)try{await post('end',id);}catch(e){setStatus(e instanceof Error?e.message:'Appel arrêté sur cet appareil.');}};
 const fail=(message:string)=>{const id=localId.current;cleanup();setStatus(message);if(id)void post('end',id).catch(()=>{});};
 useEffect(()=>{
  session.current=crypto.randomUUID();setAvailable(!!navigator.mediaDevices?.getUserMedia&&'RTCPeerConnection'in window);
  let stopped=false,polling=false;
  const poll=async()=>{if(polling||operation.current||document.visibilityState!=='visible'&&!peer.current)return;polling=true;try{
   const r=await apiFetch('/api/calls',{cache:'no-store'});if(!r.ok)throw new Error();const d=await r.json() as {error?:string;call:Call|null};if(stopped||operation.current)return;
   const next:Call|null=d.call;current.current=next;setCall(next);
   if(localId.current&&(!next||next.id!==localId.current)){cleanup();setStatus('Appel terminé ou sans réponse.');}
   if(next&&peer.current&&next.id===localId.current&&next.callerDevice===session.current&&next.answer&&!peer.current.currentRemoteDescription){await peer.current.setRemoteDescription({type:'answer',sdp:next.answer});}
   if(next&&localId.current===next.id&&next.state==='connected'&&Date.now()-lastHeartbeat.current>12000){lastHeartbeat.current=Date.now();await post('heartbeat',next.id);}
  }catch{if(!stopped&&peer.current)setStatus('Connexion interrompue. Tentative de reconnexion…');}finally{polling=false;}};
  void poll();const timer=setInterval(poll,3000);document.addEventListener('visibilitychange',poll);
  return()=>{stopped=true;clearInterval(timer);document.removeEventListener('visibilitychange',poll);const id=localId.current;if(id)void post('end',id).catch(()=>{});cleanup();};
 // This component stays mounted across tabs so calls continue inside the application.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{if(active!==localMember.current){const id=localId.current;cleanup();if(id)void post('end',id).catch(()=>{});localMember.current=active;setStatus('');}},[active]);
 useEffect(()=>{if(!connected)return;const t=setInterval(()=>setElapsed(s=>s+1),1000);return()=>clearInterval(t);},[connected]);
 async function prepare(){
  const attempt=generation.current;
  const media=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
  if(attempt!==generation.current){media.getTracks().forEach(t=>t.stop());throw new Error('Appel annulé.');}
  stream.current=media;const pc=new RTCPeerConnection({iceServers});peer.current=pc;media.getTracks().forEach(t=>pc.addTrack(t,media));
  pc.ontrack=e=>{if(audio.current){audio.current.srcObject=e.streams[0]||new MediaStream([e.track]);audio.current.play().catch(()=>setAudioBlocked(true));}};
  pc.onconnectionstatechange=()=>{if(peer.current!==pc)return;if(pc.connectionState==='connected'){if(connectionTimer.current)clearTimeout(connectionTimer.current);setConnected(true);setStatus('Vous êtes en ligne.');}else if(pc.connectionState==='failed'){fail('La liaison audio n’a pas pu être établie sur ce réseau. Essayez un autre Wi-Fi.');}else if(pc.connectionState==='disconnected'){setStatus('Liaison audio interrompue…');if(connectionTimer.current)clearTimeout(connectionTimer.current);connectionTimer.current=setTimeout(()=>fail('Appel interrompu par le réseau.'),15000);}};
  return pc;
 }
 const gather=(pc:RTCPeerConnection)=>new Promise<void>(resolve=>{if(pc.iceGatheringState==='complete'){resolve();return;}const finished=()=>{clearTimeout(timer);pc.removeEventListener('icegatheringstatechange',changed);resolve();};const changed=()=>{if(pc.iceGatheringState==='complete')finished();};const timer=setTimeout(finished,7000);pc.addEventListener('icegatheringstatechange',changed);});
 async function dial(answer=false){
  if(operation.current)return;const attempt=generation.current;operation.current=true;setBusy(true);setStatus('Autorisez le microphone pour préparer l’appel.');
  try{
   const incoming=current.current;if(answer&&(!incoming||incoming.caller===active))throw new Error('Cet appel n’est plus disponible.');
   const pc=await prepare();const id=answer?incoming!.id:crypto.randomUUID();localId.current=id;
   if(answer){await pc.setRemoteDescription({type:'offer',sdp:incoming!.offer});await pc.setLocalDescription(await pc.createAnswer());}else{await pc.setLocalDescription(await pc.createOffer());}
   await gather(pc);if(peer.current!==pc)throw new Error('Appel annulé.');
   const d=await post(answer?'answer':'start',id,{[answer?'answer':'offer']:pc.localDescription?.sdp});if(attempt!==generation.current){await post('end',id).catch(()=>{});return;}current.current=d.call;setCall(d.call);setStatus(answer?'Connexion audio en cours…':'Invitation envoyée. En attente de réponse…');
   if(pc.connectionState!=='connected')connectionTimer.current=setTimeout(()=>fail('Sans réponse ou liaison impossible. Vous pouvez réessayer.'),answer?40000:125000);
  }catch(e){const message=e instanceof DOMException&&e.name==='NotAllowedError'?'Microphone refusé. Autorisez-le dans les réglages du navigateur.':e instanceof Error?e.message:'Impossible de démarrer l’appel.';fail(message);}finally{operation.current=false;setBusy(false);}
 }
 const mine=!!call&&(call.callerDevice===session.current||call.calleeDevice===session.current),incoming=!!call&&call.caller!==active&&call.state==='ringing';
 const time=`${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}`;
 return <><audio ref={audio} autoPlay playsInline/>{!expanded&&(incoming||mine)&&<div className="call-banner" role="status"><Phone size={18}/><span>{incoming?`${names[call!.caller]} vous appelle`:connected?`Appel · ${time}`:'Appel en cours'}</span><button className="secondary" onClick={onOpen}>{incoming?'Répondre':'Ouvrir'}</button></div>}
 {expanded&&<section className="panel call-panel"><div className="call-avatar"><Phone size={35}/></div><span className="eyebrow">JUSTE ENTRE VOUS DEUX · BÊTA</span><h2>{incoming?`${names[call!.caller]} vous appelle`:connected?names[1-active]:`Un appel à ${names[1-active]}`}</h2><p role="status">{connected?time:status||'Un moment pour se parler, directement dans votre maison.'}</p>
 {!available&&<p className="form-error">Les appels audio ne sont pas disponibles dans ce navigateur. Ouvrez À deux dans Safari ou Chrome.</p>}
 <div className="call-actions">{incoming&&!mine?<><button className="primary" disabled={busy||!available} onClick={()=>dial(true)}><Phone size={19}/>Répondre</button><button className="danger" disabled={busy} onClick={end}><PhoneOff size={19}/>Refuser</button></>:mine||busy?<><button className="secondary" disabled={!stream.current} aria-pressed={muted} onClick={()=>{stream.current?.getAudioTracks().forEach(t=>t.enabled=muted);setMuted(!muted);}}>{muted?<MicOff size={19}/>:<Mic size={19}/>} {muted?'Réactiver le micro':'Couper le micro'}</button><button className="danger" onClick={end}><PhoneOff size={19}/>Raccrocher</button></>:<button className="primary" disabled={!available||!!call||busy} onClick={()=>dial()}><Phone size={19}/>{call?'Appel ouvert sur un autre appareil':`Appeler ${names[1-active]}`}</button>}</div>
 {audioBlocked&&<button className="secondary" onClick={()=>audio.current?.play().then(()=>setAudioBlocked(false)).catch(()=>setStatus('Touchez à nouveau pour activer le son.'))}><Volume2 size={19}/>Activer le son</button>}
 <div className="call-help"><p>Gardez l’application ouverte pendant l’appel. Si votre moitié a activé les invitations aux appels, une notification lui propose d’ouvrir À deux.</p><p>Cette première version utilise une connexion directe : certains réseaux mobiles ou Wi-Fi peuvent empêcher l’appel. La sonnerie sur écran verrouillé n’est pas prise en charge. Aucun son n’est enregistré.</p></div></section>}</>;
}
