'use client';
import {apiFetch,APP_BASE} from '../lib/api-client';
import {useEffect,useState,useCallback} from 'react';
import {Bell,BellOff,Check,RefreshCw} from './icons';
import {defaultPreferences,notificationCategories,type Preferences} from '../lib/communication';
import {deviceId} from '../lib/device';
type Event={id:number;actor:number;category:string;message:string;createdAt:string};
const labels={shopping:'Courses',tasks:'Tâches',expenses:'Dépenses et remboursements',calendar:'Rendez-vous',calls:'Invitations aux appels',ideas:'Idées et invitations',plants:'Entretien des plantes'};
const jsonPost=async(body:unknown)=>{const r=await apiFetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json() as {error?:string};if(!r.ok)throw new Error(data.error||'Enregistrement impossible.');return data;};
export default function HouseNotifications({active,names,onNavigate}:{active:number;names:string[];onNavigate:(tab:string)=>void}){
 const [preferences,setPreferences]=useState<Preferences>(defaultPreferences),[enabled,setEnabled]=useState(false),[supported,setSupported]=useState(false),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[message,setMessage]=useState(''),[key,setKey]=useState(''),[events,setEvents]=useState<Event[]>([]),[seen,setSeen]=useState(0);
 const load=useCallback(async()=>{const r=await apiFetch('/api/notifications?device='+deviceId(),{cache:'no-store'});if(!r.ok)throw new Error('Impossible de charger les notifications.');const d=await r.json() as {publicKey:string;enabled:boolean;preferences:Preferences;activity:Event[]};setKey(d.publicKey);setEnabled(d.enabled);setPreferences({...defaultPreferences,...d.preferences});setEvents(d.activity);setReady(true);},[]);
 useEffect(()=>{setSupported('serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window);try{setSeen(Number(localStorage.getItem('adeux-seen-'+active)||0));}catch{}load().catch(e=>setMessage(e.message));const timer=setInterval(()=>{if(document.visibilityState==='visible')load().catch(()=>{});},15000);return()=>clearInterval(timer);},[load,active]);
 const run=async(fn:()=>Promise<void>)=>{setBusy(true);setMessage('');try{await fn();}catch(e){setMessage(e instanceof Error?e.message:'Action impossible.');}finally{setBusy(false);}};
 async function enable(){
  // The browser permission prompt must follow the user's tap immediately.
  const permission=await Notification.requestPermission();if(permission!=='granted')throw new Error(permission==='denied'?'Notifications bloquées. Vous pouvez les autoriser dans les réglages de votre appareil.':'Les notifications restent désactivées.');
  if(!key)throw new Error('Le service de notification n’est pas disponible. Réessayez.');
  const registration=await navigator.serviceWorker.register(APP_BASE+'sw.js',{scope:APP_BASE});await navigator.serviceWorker.ready;
  const bytes=Uint8Array.from(atob(key.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-key.length%4)%4)),c=>c.charCodeAt(0));
  const sub=await registration.pushManager.getSubscription()||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes});
  await jsonPost({action:'subscribe',deviceId:deviceId(),member:active,preferences,subscription:sub.toJSON()});setEnabled(true);setMessage('Notifications activées pour '+names[active]+' sur cet appareil.');
 }
 async function disable(){await jsonPost({action:'disable',deviceId:deviceId()});setEnabled(false);const registration=await navigator.serviceWorker.getRegistration(APP_BASE);await(await registration?.pushManager.getSubscription())?.unsubscribe();setMessage('Notifications désactivées sur cet appareil.');}
 async function change(next:Preferences){await jsonPost({action:'preferences',deviceId:deviceId(),member:active,preferences:next});setPreferences(next);}
 const markRead=()=>{const latest=events[0]?.id||0;setSeen(latest);try{localStorage.setItem('adeux-seen-'+active,String(latest));}catch{}};
 return <div className="communication-grid"><section className="panel settings-panel"><span className="settings-icon"><Bell size={23}/></span><h2>À votre rythme</h2><p>Recevez les nouveautés ajoutées par votre moitié. Ce réglage concerne uniquement cet appareil, identifié comme <strong>{names[active]}</strong>.</p>
 {!supported&&<div className="info-box">Sur iPhone ou iPad, ajoutez Nous deux à l’écran d’accueil depuis Safari, puis ouvrez l’application depuis son icône pour activer les notifications.</div>}
 {supported&&<button className={enabled?'secondary wide':'primary wide'} disabled={busy||!ready||!key} onClick={()=>run(enabled?disable:enable)}>{enabled?<BellOff size={18}/>:<Bell size={18}/>} {enabled?'Désactiver sur cet appareil':'Activer sur cet appareil'}</button>}
 <fieldset className="notification-options" disabled={!enabled||busy}><legend>Je souhaite être prévenu pour</legend>{notificationCategories.map(k=><label className="check-label" key={k}><input type="checkbox" checked={preferences[k]} onChange={e=>run(()=>change({...preferences,[k]:e.target.checked}))}/>{labels[k]}</label>)}</fieldset>
 {enabled&&<button className="text-link" disabled={busy} onClick={()=>run(async()=>{await jsonPost({action:'test',deviceId:deviceId()});setMessage('Notification de test envoyée. Vérifiez votre centre de notifications.');})}><Bell size={16}/>Envoyer une notification de test</button>}
 {message&&<p role="status" className="notification-message">{message}</p>}
 <p className="aside-caption">Les alertes masquent les montants et les détails personnels. Les rendez-vous déclenchent une alerte lors d’un ajout ou d’une modification ; il ne s’agit pas encore de rappels automatiques avant leur date.</p>
 </section><section className="panel settings-panel"><div className="section-title"><h2>Les nouvelles de la maison</h2><button className="icon-button" disabled={busy} onClick={()=>run(load)} aria-label="Actualiser les nouvelles"><RefreshCw size={17}/></button></div><p>Les 50 dernières nouveautés, conservées pendant 90 jours.</p>{events.some(e=>e.id>seen&&e.actor!==active)&&<button className="text-link" onClick={markRead}><Check size={16}/>Tout marquer comme lu</button>}
 {!events.length&&<p className="activity-empty">Les prochaines dépenses, courses, tâches et modifications de rendez-vous apparaîtront ici.</p>}
 <div className="activity-list">{events.map(e=><button className={`activity-row ${e.id>seen&&e.actor!==active?'unread':''}`} key={e.id} onClick={()=>{markRead();onNavigate(e.category);}}><span><strong>{names[e.actor]||'Votre moitié'}</strong> {e.message}</span><time dateTime={e.createdAt}>{new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(e.createdAt))}</time></button>)}</div></section></div>;
}
