'use client';
import {apiFetch,APP_BASE} from '../lib/api-client';
import {useEffect,useState,useCallback,useRef} from 'react';
import {Bell,BellOff,Check,RefreshCw,Clock} from './icons';
import {defaultPreferences,type Preferences} from '../lib/communication';
import {deviceId} from '../lib/device';
import {endpointHash,isInstalled,keyBytes,localSubscription,permission,platform,pushSupported,sameKey,type Permission} from '../lib/push-client';
import {OFF,defaultReminderTimes,halfHours,reminderRanges,soonChoices,soonLabel,type ReminderTimes} from '../lib/reminder-settings';
type Event={id:number;actor:number;category:string;message:string;createdAt:string};
type Service='apple'|'google'|'mozilla'|'microsoft'|'other';
type TestResult={current:boolean;service:Service;ok:boolean;status:number|null;removed:boolean;reason?:string;error?:'endpoint'|'network'|'config'};
// Only what can still ring: routine changes (expenses, appointment edits…) no longer send a push,
// so their old switches ('expenses', 'calendar') are kept in the data but not shown.
const labels={chat:'Messages privés',calls:'Invitations aux appels',ideas:'Invitations et réponses de « Nos idées »',reminders:'Rappels de l’agenda : la veille, le matin, et avant un rendez-vous santé',tasks:'Missions du jour, le matin',shopping:'Liste de courses terminée',plants:'Entretien des plantes',pets:'Soins de nos compagnons'} as const;
const services:Record<Service,string>={apple:'iPhone ou iPad',google:'Android ou Chrome',mozilla:'Firefox',microsoft:'Edge',other:'Autre navigateur'};
const permissionText:Record<Permission,string>={granted:'Accordée',denied:'Refusée',default:'À demander',unsupported:'Non prise en charge'};
const jsonPost=async<T=Record<string,unknown>,>(body:unknown,path='/api/notifications')=>{const r=await apiFetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json() as T&{error?:string};if(!r.ok)throw new Error(data.error||'Enregistrement impossible.');return data;};
// One readable line per device for « M'envoyer une notification d'essai ».
export function testLine(r:TestResult){
 const code=r.status?` (code ${r.status}${r.reason?' · '+r.reason:''})`:'';
 if(r.ok)return 'Envoyée au service de notification'+code+'.';
 if(r.removed)return `Abonnement expiré${code} : il a été retiré. Réactivez les notifications sur cet appareil.`;
 if(r.error==='network')return 'Le service de notification n’a pas répondu. Réessayez dans un instant.';
 if(r.error==='config')return 'Les clés de notification de la maison sont incomplètes sur le serveur.';
 if(r.error==='endpoint')return 'Adresse de notification non reconnue : désactivez puis réactivez sur cet appareil.';
 if(r.status===401||r.status===403)return `Refusée${code} : cet abonnement ne correspond plus à la clé de la maison. Désactivez puis réactivez sur cet appareil.`;
 if(r.status===429)return `Refusée${code} : trop d’envois, réessayez plus tard.`;
 if(r.status&&r.status>=500)return `Service de notification indisponible${code}. Réessayez plus tard.`;
 return `Refusée par le service de notification${code}.`;
}
const saved='Mes rappels sont enregistrés.';
type Check={permission:Permission;installed:boolean;local:boolean;matches:boolean|null};
export default function HouseNotifications({active,names,petsMode,onNavigate}:{active:number;names:string[];petsMode:boolean;onNavigate:(tab:string)=>void}){
 const [preferences,setPreferences]=useState<Preferences>(defaultPreferences),[enabled,setEnabled]=useState(false),[supported,setSupported]=useState(false),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[message,setMessage]=useState(''),[key,setKey]=useState(''),[events,setEvents]=useState<Event[]>([]),[seen,setSeen]=useState(0);
 const [times,setTimes]=useState<ReminderTimes>(defaultReminderTimes),[draft,setDraft]=useState<ReminderTimes>(defaultReminderTimes),[timesMessage,setTimesMessage]=useState('');
 const [server,setServer]=useState<{service:Service;hash:string}|null>(null),[deviceCount,setDeviceCount]=useState(0),[check,setCheck]=useState<Check>({permission:'unsupported',installed:false,local:false,matches:null});
 const editing=useRef(false);
 const [test,setTest]=useState<{summary:string;results:TestResult[];failed?:boolean}|null>(null);
 // What this browser says about itself, compared with what the server knows (by a short fingerprint only).
 const inspect=useCallback(async(known:{hash:string}|null)=>{const sub=await localSubscription();setCheck({permission:permission(),installed:isInstalled(),local:!!sub,matches:sub&&known?await endpointHash(sub.endpoint)===known.hash:null});},[]);
 const load=useCallback(async()=>{const r=await apiFetch('/api/notifications?device='+deviceId(),{cache:'no-store'});if(!r.ok)throw new Error('Impossible de charger les notifications.');const d=await r.json() as {publicKey:string;enabled:boolean;preferences:Preferences;activity:Event[];times?:ReminderTimes;devices?:number;subscription?:{service:Service;hash:string}|null};
  setKey(d.publicKey);setEnabled(d.enabled);setPreferences({...defaultPreferences,...d.preferences});setEvents(d.activity);setDeviceCount(d.devices||0);setServer(d.subscription||null);
  // The form follows the saved times unless the person is editing them.
  if(d.times){const next={...defaultReminderTimes,...d.times};if(!editing.current)setDraft(next);setTimes(next);}
  setReady(true);await inspect(d.subscription||null);},[inspect]);
 useEffect(()=>{setSupported(pushSupported());try{setSeen(Number(localStorage.getItem('adeux-seen-'+active)||0));}catch{}load().catch(e=>setMessage(e.message));const timer=setInterval(()=>{if(document.visibilityState==='visible')load().catch(()=>{});},15000);return()=>clearInterval(timer);},[load,active]);
 const run=async(fn:()=>Promise<void>)=>{setBusy(true);setMessage('');try{await fn();}catch(e){setMessage(e instanceof Error?e.message:'Action impossible.');}finally{setBusy(false);}};
 async function enable(){
  // The browser permission prompt must follow the user's tap immediately (required on iPhone).
  const answer=await Notification.requestPermission();if(answer!=='granted')throw new Error(answer==='denied'?'Notifications bloquées. Vous pouvez les autoriser dans les réglages de votre appareil.':'Les notifications restent désactivées.');
  if(!key)throw new Error('Le service de notification n’est pas disponible. Réessayez.');
  const registration=await navigator.serviceWorker.register(APP_BASE+'sw.js',{scope:APP_BASE});await navigator.serviceWorker.ready;
  // An old subscription made with another key would be refused by the push service: renew it.
  let sub=await registration.pushManager.getSubscription();if(sub&&!sameKey(sub,key)){await sub.unsubscribe();sub=null;}
  sub??=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(key)});
  await jsonPost({action:'subscribe',deviceId:deviceId(),member:active,preferences,subscription:sub.toJSON()});setEnabled(true);setMessage('Notifications activées pour '+names[active]+' sur cet appareil.');await load();
 }
 async function disable(){await jsonPost({action:'disable',deviceId:deviceId()});setEnabled(false);const registration=await navigator.serviceWorker.getRegistration(APP_BASE);await(await registration?.pushManager.getSubscription())?.unsubscribe();setMessage('Notifications désactivées sur cet appareil.');await load();}
 async function change(next:Preferences){await jsonPost({action:'preferences',deviceId:deviceId(),member:active,preferences:next});setPreferences(next);}
 async function sendTest(){
  // The answer (or the refusal: 5 per hour, trial mode…) stays in this block, next to the button.
  setTest(null);let r:{devices:number;sent:number;results:TestResult[]};try{r=await jsonPost<typeof r>({deviceId:deviceId()},'/api/notification-test');}catch(e){setTest({summary:e instanceof Error?e.message:'Essai impossible.',results:[],failed:true});return;}
  const summary=!r.devices?`Aucun appareil n’est inscrit pour ${names[active]}. Activez les notifications sur cet appareil, puis réessayez.`:`Envoyée à ${r.sent} appareil${r.sent>1?'s':''} sur ${r.devices}.${r.sent?' Elle doit apparaître dans la minute ; sinon, suivez le conseil ci-dessus.':''}`;
  setTest({summary,results:r.results});await load();
 }
 async function saveTimes(){setTimesMessage('');let r:{times:ReminderTimes};try{r=await jsonPost<typeof r>({action:'reminder-times',times:draft});}catch(e){setTimesMessage(e instanceof Error?e.message:'Enregistrement impossible.');return;}editing.current=false;setTimes(r.times);setDraft(r.times);setTimesMessage(saved);}
 const markRead=()=>{const latest=events[0]?.id||0;setSeen(latest);try{localStorage.setItem('adeux-seen-'+active,String(latest));}catch{}};
 const shown=(Object.keys(labels) as (keyof typeof labels)[]).filter(k=>k!=='pets'||petsMode);
 const device=platform();
 const advice=device==='ios'?(check.installed?'Sur iPhone : dans Réglages › Notifications › Nous deux, laissez « Autoriser les notifications » activé (iOS 16.4 ou plus).':'Sur iPhone : ouvrez Nous deux dans Safari, Partager › « Sur l’écran d’accueil », puis rouvrez l’appli depuis son icône pour activer les notifications (iOS 16.4 ou plus).')
  :device==='android'?'Sur Android : autorisez les notifications de Chrome (ou de l’appli installée) et évitez qu’une économie de batterie ne la mette en veille.'
  :'Sur ordinateur : laissez le navigateur autoriser les notifications pour ce site.';
 const registered=enabled?(check.matches===false?'À renouveler':'Oui'):'Non';
 const timeSelect=(k:'eve'|'morning'|'plants'|'pets',label:string)=><label key={k}>{label}<select value={draft[k]} onChange={e=>{editing.current=true;setDraft(d=>({...d,[k]:e.target.value}));}}><option value={OFF}>Pas de rappel</option>{halfHours(reminderRanges[k]).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
 return <div className="communication-grid"><section className="panel settings-panel"><span className="settings-icon"><Bell size={23}/></span><h2>À votre rythme</h2><p>Nous deux vous prévient pour l’essentiel : messages, appels, invitations, liste de courses terminée et rappels. Le reste attend dans « Les nouvelles de la maison ». Ce réglage concerne uniquement cet appareil, identifié comme <strong>{names[active]}</strong>.</p>
 {!supported&&<div className="info-box">Sur iPhone ou iPad, ajoutez Nous deux à l’écran d’accueil depuis Safari, puis ouvrez l’application depuis son icône pour activer les notifications.</div>}
 {supported&&<button className={enabled?'secondary wide':'primary wide'} disabled={busy||!ready||!key} onClick={()=>run(enabled?disable:enable)}>{enabled?<BellOff size={18}/>:<Bell size={18}/>} {enabled?'Désactiver sur cet appareil':'Activer sur cet appareil'}</button>}
 <fieldset className="notification-options" disabled={!enabled||busy}><legend>Je souhaite être prévenu pour</legend>{shown.map(k=><label className="check-label" key={k}><input type="checkbox" checked={preferences[k]} onChange={e=>run(()=>change({...preferences,[k]:e.target.checked}))}/>{labels[k]}</label>)}</fieldset>
 {message&&<p role="status" className="notification-message">{message}</p>}
 <p className="aside-caption">Les alertes ne montrent ni montant, ni lieu, ni note. Les rappels de l’agenda donnent l’heure et le titre de vos rendez-vous et de ceux partagés à deux, jamais un rendez-vous privé de votre moitié. Ajouter un article, une dépense ou un rendez-vous ne prévient plus l’autre : ces nouveautés restent ici.</p>
 </section>
 <section className="panel settings-panel push-check" aria-labelledby="push-check-title"><h2 id="push-check-title">Vérifier mes notifications</h2>
  <dl className="push-status">
   <div><dt>Autorisation</dt><dd className={check.permission==='granted'?'is-ok':check.permission==='default'?'is-todo':'is-ko'}>{permissionText[check.permission]}</dd></div>
   <div><dt>Appli installée</dt><dd className={check.installed?'is-ok':device==='ios'?'is-ko':'is-todo'}>{check.installed?'Oui':'Non, dans le navigateur'}</dd></div>
   <div><dt>Abonnement enregistré</dt><dd className={registered==='Oui'?'is-ok':registered==='Non'?'is-todo':'is-ko'}>{registered}{server&&enabled?` · ${services[server.service]}`:''}</dd></div>
   <div><dt>Appareils de {names[active]}</dt><dd>{deviceCount}</dd></div>
  </dl>
  <p className="push-advice">{check.permission==='denied'?'Les notifications sont bloquées pour Nous deux : autorisez-les dans les réglages du téléphone ou du navigateur, puis appuyez sur « Activer ». ':''}{registered==='À renouveler'?'Cet appareil a changé d’abonnement : appuyez sur « Désactiver » puis « Activer ». ':''}{advice}</p>
  <button className="secondary wide" disabled={busy||!ready} onClick={()=>run(sendTest)}><Bell size={18}/>M’envoyer une notification d’essai</button>
  {test&&<div role="status" className={`push-test${test.failed?' is-ko':''}`}><p>{test.summary}</p>{test.results.length>0&&<ul>{test.results.map((r,i)=><li key={i} className={r.ok?'is-ok':'is-ko'}><strong>{services[r.service]}{r.current?' · cet appareil':''}</strong><span>{testLine(r)}</span></li>)}</ul>}</div>}
  <p className="aside-caption">L’essai part seulement vers vos propres appareils, cinq fois par heure au maximum.</p>
 </section>
 <section className="panel settings-panel reminder-times" aria-labelledby="reminder-times-title"><div className="section-title"><h2 id="reminder-times-title"><Clock size={20}/>Mes rappels</h2></div>
  <p>Pour {names[active]}, sur tous ses appareils. Pour chaque rappel, choisissez l’heure, ou « Pas de rappel » si vous n’en voulez pas.</p>
  <form className="form" onSubmit={e=>{e.preventDefault();void run(saveTimes);}}>
   <fieldset className="reminder-group"><legend>Agenda</legend><div className="form-grid">{timeSelect('eve','La veille')}{timeSelect('morning','Le matin même')}</div>
    <label>Avant un rendez-vous santé<select value={draft.soon} onChange={e=>{editing.current=true;setDraft(d=>({...d,soon:Number(e.target.value)}));}}><option value={0}>Pas de rappel</option>{soonChoices.map(m=><option key={m} value={m}>{soonLabel(m)}</option>)}</select></label>
    <p className="aside-caption">Les missions du jour arrivent avec le rappel du matin, ou à 8 h s’il est coupé.</p></fieldset>
   <div className="form-grid">{timeSelect('plants','Les plantes')}{petsMode&&timeSelect('pets','Nos compagnons')}</div>
   <button className="primary wide" type="submit" disabled={busy||!ready||JSON.stringify(draft)===JSON.stringify(times)}><Check size={18}/>Enregistrer mes rappels</button>
  </form>
  {timesMessage&&<p role="status" className={timesMessage===saved?'notification-message':'form-error'}>{timesMessage}</p>}
  <p className="aside-caption">Les missions du jour arrivent avec le rappel du matin. {petsMode?'Le rappel des compagnons regroupe les soins du jour. ':''}Chaque rappel se coupe dans « Je souhaite être prévenu pour ».</p>
 </section>
 <section className="panel settings-panel"><div className="section-title"><h2>Les nouvelles de la maison</h2><button className="icon-button" disabled={busy} onClick={()=>run(load)} aria-label="Actualiser les nouvelles"><RefreshCw size={17}/></button></div><p>Les 50 dernières nouveautés, conservées pendant 90 jours.</p>{events.some(e=>e.id>seen&&e.actor!==active)&&<button className="text-link" onClick={markRead}><Check size={16}/>Tout marquer comme lu</button>}
 {!events.length&&<p className="activity-empty">Les prochaines dépenses, courses, tâches et modifications de rendez-vous apparaîtront ici.</p>}
 <div className="activity-list">{events.map(e=><button className={`activity-row ${e.id>seen&&e.actor!==active?'unread':''}`} key={e.id} onClick={()=>{markRead();onNavigate(e.category);}}><span><strong>{names[e.actor]||'Votre moitié'}</strong> {e.message}</span><time dateTime={e.createdAt}>{new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(e.createdAt))}</time></button>)}</div></section></div>;
}
