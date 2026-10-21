// L'invitation en lettre-cœur qui se plie en enveloppe (référence : un cœur rose
// replié en enveloppe). Même dessin pour « Une invitation pour vous », l'envoi
// d'une idée et la carte « invitation » de la discussion.
// Animations courtes (< 2 s), coupées si l'appareil demande moins d'animations.
import {useEffect,useRef,useState} from 'react';
import {Buddy} from '../design-system/runtime';
import {ArrowRight,Check,Heart,MessageCircle} from './icons';
import {apiFetch} from '../lib/api-client';

export type InvitationLetter={title:string;category:string;owner:number;date?:string;time?:string};
export type EnvelopeMode='open'|'closed'|'opening'|'closing';
export const envelopeDurations={opening:1500,closing:1400};
const icons:Record<string,string>={restaurant:'🍽️',outing:'🎟️',home:'🛋️',trip:'🧳',surprise:'🎁'};
const mascots:Record<string,{left:'flower'|'blob'|'pill'|'dome';right:'flower'|'blob'|'pill'|'dome'}>={restaurant:{left:'flower',right:'pill'},outing:{left:'blob',right:'pill'},home:{left:'dome',right:'flower'},trip:{left:'pill',right:'blob'},surprise:{left:'flower',right:'dome'}};
const who=(n:number,names:string[])=>n===0||n===1?names[n]:'L’un de nous';
const fromWho=(name:string)=>(/^[aeiouyhâàéèêëîïôöûüœ]/i.test(name)?'d’':'de ')+name;
const forWho=(n:number,names:string[])=>n===0||n===1?names[1-n]:'nous deux';

export const prefersLessMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
export function letterDate(date?:string,time?:string){
 if(!date)return 'Date à décider ensemble';
 const d=new Date(date+'T12:00:00');if(Number.isNaN(d.getTime()))return 'Date à décider ensemble';
 return new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'numeric',month:'short'}).format(d)+(time?' · '+time.replace(':',' h '):'');
}
export const invitationLabel=(invite:InvitationLetter,names:string[])=>`Invitation de ${who(invite.owner,names)} : ${invite.title}, ${letterDate(invite.date,invite.time)}`;

/** Joue une animation puis passe à l'état final ; immédiat si moins d'animations. */
export function useEnvelope(initial:EnvelopeMode){
 const[mode,setMode]=useState<EnvelopeMode>(initial),timer=useRef<ReturnType<typeof setTimeout>>(undefined);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{if(mode!=='opening'&&mode!=='closing')return;const next=mode==='opening'?'open':'closed';
  timer.current=setTimeout(()=>setMode(next),prefersLessMotion()?0:envelopeDurations[mode]);return()=>clearTimeout(timer.current);},[mode]);
 return [mode,setMode] as const;
}

/** Le dessin seul. Le texte de la lettre est lisible par les lecteurs d'écran via `label`. */
export function InvitationEnvelope({invite,names,mode,label,reserve=false}:{invite:InvitationLetter;names:string[];mode:EnvelopeMode;label?:string;reserve?:boolean}){
 const pair=mascots[invite.category]||mascots.outing;
 // reserve : la place de la lettre est gardée, l'enveloppe ne bouge pas pendant l'animation (fenêtres).
 return <div className={`inv-env is-${mode}${reserve?' reserve':''}`} {...(label===''?{'aria-hidden':true}:{role:'img','aria-label':label||invitationLabel(invite,names)})}>
  <div className="inv-env-body" aria-hidden="true">
   <svg className="inv-env-back" viewBox="0 0 320 200" preserveAspectRatio="none"><rect x="1" y="1" width="318" height="198" rx="16"/></svg>
   <div className="inv-env-letter">
    <svg className="inv-env-paper" viewBox="0 0 86 58" preserveAspectRatio="none"><path vectorEffect="non-scaling-stroke" d="M0 13C0 4.5 6.5 0 16 0c10 0 20 2.5 27 9C50 2.5 60 0 70 0c9.5 0 16 4.5 16 13v45H0z"/></svg>
    <span className="inv-env-mascot left"><Buddy shape={pair.left} tone="rose" mood="love" look="right" size={64}/></span>
    <span className="inv-env-mascot right"><Buddy shape={pair.right} tone="lavande" mood="happy" size={64}/></span>
    <div className="inv-env-text">
     <span className="inv-env-from">{who(invite.owner,names)} vous invite</span>
     <strong className="inv-env-title">{invite.title} <span>{icons[invite.category]||'💌'}</span></strong>
     <span className="inv-env-date">{letterDate(invite.date,invite.time)}</span>
    </div>
   </div>
   <svg className="inv-env-pocket" viewBox="0 0 320 200" preserveAspectRatio="none"><path vectorEffect="non-scaling-stroke" d="M1 5C40 10 112 48 146 120h28C208 48 280 10 319 5v177c0 9-7 17-16 17H17c-9 0-16-8-16-17z"/><path className="inv-env-tab" vectorEffect="non-scaling-stroke" d="M150 120h20"/></svg>
   <div className="inv-env-flap"><svg viewBox="0 0 320 122" preserveAspectRatio="none"><path vectorEffect="non-scaling-stroke" d="M2 2h316L172 114c-7 6-17 6-24 0z"/></svg><span className="inv-env-seal"><Heart size={18}/></span></div>
   <p className="inv-env-address"><span>rendez-vous avec nous</span><b>Pour {forWho(invite.owner,names)}</b></p>
  </div>
 </div>;
}

/** Après l'envoi : la lettre se plie dans l'enveloppe, qui se referme. */
export function InvitationSent({invite,names,onDone}:{invite:InvitationLetter;names:string[];onDone:()=>void}){
 const[mode,setMode]=useEnvelope('open'),done=useRef(onDone);done.current=onDone;
 useEffect(()=>{const start=setTimeout(()=>setMode('closing'),prefersLessMotion()?0:250);return()=>clearTimeout(start);},[setMode]);
 useEffect(()=>{if(mode!=='closed')return;const t=setTimeout(()=>done.current(),prefersLessMotion()?1600:900);return()=>clearTimeout(t);},[mode]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')done.current();};addEventListener('keydown',key);return()=>removeEventListener('keydown',key);},[]);
 return <div className="inv-sent" onClick={()=>done.current()}>
  <div className="inv-sent-card" role="status">
   <InvitationEnvelope invite={invite} names={names} mode={mode}/>
   <p className="inv-sent-caption">{mode==='closed'?<>Invitation envoyée à {forWho(invite.owner,names)} <Heart size={16} aria-hidden="true"/></>:'On plie la lettre…'}</p>
  </div>
 </div>;
}

/** Carte « invitation » de la discussion. Le partenaire la voit s'ouvrir une seule fois (mémorisé sur l'appareil). */
const seenKey=(id:string)=>'nd-invitation-ouverte:'+id;
function wasOpened(id?:string){if(!id)return false;try{return localStorage.getItem(seenKey(id))==='1';}catch{return false;}}
function rememberOpened(id?:string){if(!id)return;try{localStorage.setItem(seenKey(id),'1');}catch{/* stockage indisponible : l'animation pourra revenir */}}
export function InvitationChatCard({invite,names,mine,messageId,note,onOpen}:{invite:InvitationLetter;names:string[];mine?:boolean;messageId?:string;note?:string;onOpen?:()=>void}){
 const[mode,setMode]=useEnvelope(mine||!messageId||wasOpened(messageId)||prefersLessMotion()?'open':'closed');
 const box=useRef<HTMLDivElement>(null);
 const open=()=>{if(mode!=='closed')return;rememberOpened(messageId);setMode('opening');};
 useEffect(()=>{if(mode!=='closed'||!box.current||typeof IntersectionObserver!=='function')return;let wait:ReturnType<typeof setTimeout>|undefined;
  const watch=new IntersectionObserver(([e])=>{clearTimeout(wait);if(e.isIntersecting&&document.visibilityState==='visible')wait=setTimeout(()=>{rememberOpened(messageId);setMode('opening');},450);},{threshold:.75});
  watch.observe(box.current);return()=>{clearTimeout(wait);watch.disconnect();};},[mode,messageId,setMode]);
 const closed=mode==='closed';
 return <article className={`house-card house-card-invitation${closed?' is-sealed':''}`} ref={box}>
  <span className="house-card-label">{mine?'Votre invitation':'Une invitation pour vous'}</span>
  {closed?<button type="button" className="inv-env-open" onClick={open} aria-label={`Ouvrir l’enveloppe ${fromWho(who(invite.owner,names))}`}><InvitationEnvelope invite={invite} names={names} mode="closed" label=""/></button>
  :<InvitationEnvelope invite={invite} names={names} mode={mode}/>}
  {note&&!closed&&<p className="house-card-note">« {note} »</p>}
  {closed?<p className="inv-env-hint" aria-hidden="true">Touchez l’enveloppe pour l’ouvrir</p>
  :onOpen&&<button type="button" className="house-card-open" onClick={onOpen}>Ouvrir l’invitation<ArrowRight size={18} aria-hidden="true"/></button>}
 </article>;
}

/** Partage l'invitation dans la discussion : seule la référence part, house-api vérifie l'idée et garde l'instantané. */
export function ShareInvitationButton({id,partner}:{id:string;partner:string}){
 const[state,setState]=useState<'idle'|'busy'|'done'>('idle'),[error,setError]=useState(''),message=useRef(crypto.randomUUID());
 async function share(){if(state!=='idle')return;setState('busy');setError('');
  try{const r=await apiFetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'send',id:message.current,card:{kind:'invitation',id}})});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Partage impossible pour le moment.');setState('done');}
  catch(e){setState('idle');setError(e instanceof Error?e.message:'Connexion perdue.');}}
 return state==='done'?<p className="invitation-shared" role="status"><Check size={16}/>Invitation glissée dans votre discussion avec {partner}.</p>
 :<><button type="button" className="secondary invitation-share" disabled={state==='busy'} onClick={share}><MessageCircle size={17}/>{state==='busy'?'Partage…':'Partager dans la discussion'}</button>{error&&<p className="form-error" role="alert">{error}</p>}</>;
}
