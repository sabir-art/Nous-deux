// Cartes « maison » partagées dans la discussion : courses, dépense, plante,
// mission, rendez-vous partagé, recette, menu et petits mots doux tout prêts. Le serveur valide la référence
// et fournit l’instantané ; ce module ne fait que l’afficher ou le choisir.
import {useEffect,useMemo,useState,type ReactNode} from 'react';
import {Buddy,PlantBuddy,Sticker,foodEmoji} from '../design-system/runtime';
import {ShoppingBasket,Receipt,Leaf,CheckCheck,CalendarDays,BookOpen,UtensilsCrossed,ArrowRight,ArrowLeft,Send,Paperclip,LockKeyhole,Heart,Plus} from './icons';
import {sweetNotes,sweetNoteTone} from '../lib/sweet-notes';
import {money,today,type Entry,type Item,type Appointment} from '../lib/domain';
import {plantCare,plantMood,plantQuips,careLabels,type Plant} from '../lib/life';
import {weekStart,weekLabel,shiftWeek} from '../lib/shopping';
import {RichText} from './nd-emoji';
import {apiFetch} from '../lib/api-client';
import type {HousePage} from './use-house-navigation';
import LifeDialog from './life-dialog';

export type HouseCardKind='shopping'|'expense'|'plant'|'task'|'appointment'|'recipe'|'menu'|'mot';
export type HouseCard={kind:HouseCardKind;ref:string;data:Record<string,any>;note?:string};
export type HouseCardRef={kind:'shopping';weekStart?:string}|{kind:Exclude<HouseCardKind,'shopping'>;id:string};
/** `create` opens the matching form (empty share list). */
export type HouseOpenTarget={page:HousePage;weekStart?:string;date?:string;create?:'expense'|'task'|'appointment'|'shopping'|'plants'|'recipe'|'menu'};
export type HouseShareData={items?:Item[];entries?:Entry[];plants?:Plant[];appointments?:Appointment[]};
type Recipe={id:string;title:string;archived?:boolean;minutes?:number};
type MealPlan={id:string;weekStart:string;slots:{day:number;meal:'lunch'|'dinner';recipeId:string}[]};

const shortDate=(d:string)=>d?new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'}):'';
const days=['Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.','Dim.'];
const who=(n:number,names:string[])=>n===0||n===1?names[n]:'L’un de nous';
export const shareChoices:{kind:Exclude<HouseCardKind,'mot'>;label:string;hint:string;icon:import('react').ComponentType<import('lucide-react').LucideProps>;tone:string}[]=[
 {kind:'shopping',label:'La liste de courses',hint:'Ce qu’il reste à acheter, la semaine de votre choix',icon:ShoppingBasket,tone:'menthe'},
 {kind:'expense',label:'Une dépense',hint:'Un paiement récent, avec un petit mot',icon:Receipt,tone:'beurre'},
 {kind:'plant',label:'Une plante',hint:'Son humeur et ses soins à faire',icon:Leaf,tone:'menthe'},
 {kind:'task',label:'Une mission',hint:'Un rappel doux pour la maison',icon:CheckCheck,tone:'lavande'},
 {kind:'appointment',label:'Un rendez-vous partagé',hint:'Une date de notre agenda commun',icon:CalendarDays,tone:'lilas'},
 {kind:'recipe',label:'Une recette',hint:'Une idée pour le prochain repas',icon:BookOpen,tone:'rose'},
 {kind:'menu',label:'Un menu de la semaine',hint:'Nos repas déjà prévus',icon:UtensilsCrossed,tone:'rose'},
];
export const openTarget=(card:HouseCard):HouseOpenTarget=>card.kind==='mot'?{page:'chat'}:card.kind==='shopping'?{page:'shopping',weekStart:card.ref}:card.kind==='expense'?{page:'expenses'}:card.kind==='plant'?{page:'plants'}:card.kind==='task'?{page:'tasks'}:card.kind==='appointment'?{page:'calendar',date:String(card.data.date||'')}:{page:'meals'};
const openLabels:Record<HouseCardKind,string>={shopping:'Ouvrir les courses',expense:'Voir notre argent',plant:'Voir le jardin',task:'Voir nos missions',appointment:'Voir dans l’agenda',recipe:'Ouvrir le carnet',menu:'Voir nos menus',mot:''};

function CardShell({card,tone,label,title,children,deco,onOpen}:{card:HouseCard;tone:string;label:string;title:ReactNode;children?:ReactNode;deco?:ReactNode;onOpen?:(t:HouseOpenTarget)=>void}){
 return <article className={`house-card house-card-${card.kind} nd-tone-${tone}`}>
  <span className="house-card-label">{label}</span>
  <h3 className="house-card-title">{title}</h3>
  {children}
  {card.note&&<p className="house-card-note">« <RichText text={card.note}/> »</p>}
  {deco&&<div className="house-card-deco" aria-hidden="true">{deco}</div>}
  {onOpen&&<button type="button" className="house-card-open" onClick={()=>onOpen(openTarget(card))}>{openLabels[card.kind]}<ArrowRight size={18} aria-hidden="true"/></button>}
 </article>;
}
const plantSpecies=(s:string)=>/cactus|succulent/i.test(s)?'cactus':/monstera/i.test(s)?'monstera':/pousse|bouture/i.test(s)?'pousse':'feuille';
const plantFace=(m:string)=>m==='droopy'?'sad':m==='ready'?'ok':m==='thirsty'?'thirsty':'happy';

export function HouseCardMessage({card,names,onOpen}:{card:HouseCard;names:string[];onOpen?:(t:HouseOpenTarget)=>void}){
 const d=card.data||{};
 switch(card.kind){
  case 'shopping':{const items:{title:string;quantity:string}[]=Array.isArray(d.items)?d.items:[];const more=Math.max(0,Number(d.toBuy||0)-items.length);
   return <CardShell card={card} tone="menthe" label={'Courses · '+(d.weekStart?weekLabel(String(d.weekStart)):'cette semaine')} title={<>{Number(d.toBuy||0)} article{Number(d.toBuy)>1?'s':''} <em>à acheter</em></>} onOpen={onOpen} deco={<Buddy shape="pot" tone="beurre" mood="wow" look="up" size={64}/>}>
    <ul className="house-card-list">{items.map((i,n)=><li key={n}><span aria-hidden="true">{foodEmoji(i.title,'🛒')}</span><span>{i.title}</span>{i.quantity&&<small>{i.quantity}</small>}</li>)}</ul>
    {(more>0||Number(d.bought)>0)&&<p className="house-card-meta">{more>0?`+ ${more} autre${more>1?'s':''}`:''}{more>0&&Number(d.bought)>0?' · ':''}{Number(d.bought)>0?`${d.bought} déjà acheté${Number(d.bought)>1?'s':''}`:''}</p>}
   </CardShell>;}
  case 'expense':{const settlement=d.kind==='settlement';
   return <CardShell card={card} tone="beurre" label={settlement?'Remboursement':'Dépense · '+(d.category||'Autre')} title={String(d.title||'Dépense')} onOpen={onOpen} deco={<Buddy shape="blob" tone="peche" mood="happy" size={60}/>}>
    <p className="house-card-amount">{money(Number(d.cents)||0)}</p>
    <p className="house-card-meta">{settlement?'Versé par ':'Payé par '}{who(Number(d.payer),names)}{d.date?' · '+shortDate(String(d.date)):''}{settlement?'':' · partagé 50/50'}</p>
   </CardShell>;}
  case 'plant':{const mood=String(d.mood||'happy'),thirsty=mood==='thirsty'||mood==='droopy',due:string[]=Array.isArray(d.due)?d.due:[];
   return <CardShell card={card} tone="sapin" label="Notre jardin" title={<>{String(d.name||'Notre plante')} {thirsty?<em>a soif !</em>:mood==='ready'?<em>attend son arrosage</em>:<em>va bien</em>}</>} onOpen={onOpen}>
    <div className="house-card-plant-row"><PlantBuddy name={String(d.name||'')} species={plantSpecies(String(d.species||''))} mood={plantFace(mood)} potTone="peche" speech={false} size={84}/><p>{plantQuips[mood as keyof typeof plantQuips]||plantQuips.happy}</p></div>
    {due.length>0?<p className="house-card-meta">À faire : {due.map(k=>careLabels[k as keyof typeof careLabels]||k).join(', ').toLowerCase()}{Number(d.overdue)>0?` · arrosage en retard de ${d.overdue} jour${Number(d.overdue)>1?'s':''}`:''}</p>:<p className="house-card-meta">Prochain arrosage : {shortDate(String(d.waterDue||''))||'bientôt'}</p>}
   </CardShell>;}
  case 'task':return <CardShell card={card} tone="lavande" label={d.priority?'Mission prioritaire':'Mission'} title={String(d.title||'Mission')} onOpen={onOpen} deco={<Buddy shape="pill" tone={d.done?'menthe':'citron'} mood={d.done?'happy':'wow'} size={58}/>}>
   <p className="house-card-meta">Pour : {who(Number(d.assignee),names)}{d.due?' · avant le '+shortDate(String(d.due)):''} · <strong>{d.done?'Faite':'À faire'}</strong></p>
  </CardShell>;
  case 'appointment':{const date=String(d.date||'');
   return <CardShell card={card} tone="lilas" label="Rendez-vous partagé" title={String(d.title||'Rendez-vous')} onOpen={onOpen}>
    <div className="house-card-when">{date?<span className="house-card-day" aria-hidden="true"><b>{new Date(date+'T12:00:00').getDate()}</b><small>{new Date(date+'T12:00:00').toLocaleDateString('fr-FR',{month:'short'})}</small></span>:null}<p className="house-card-meta">{date?shortDate(date):'Date à fixer'}{d.time?' · '+d.time:''}{d.endDate&&d.endDate!==date?' → '+shortDate(String(d.endDate)):''}{d.location?<><br/>{String(d.location)}</>:null}</p></div>
   </CardShell>;}
  case 'recipe':return <CardShell card={card} tone="rose" label="Recette" title={<><span aria-hidden="true">{foodEmoji(String(d.title||''),'🍽️')} </span>{String(d.title||'Recette')}</>} onOpen={onOpen} deco={<Sticker tone="citron" size="sm" rotate={6}>miam !</Sticker>}>
   {(d.minutes||d.servings||d.group)&&<p className="house-card-meta">{[d.minutes&&`${d.minutes} min`,d.servings&&`${d.servings} portions`,d.group].filter(Boolean).join(' · ')}</p>}
  </CardShell>;
  // Petit mot doux : pas de page à ouvrir, juste le message et nos deux mascottes.
  case 'mot':return <SweetNoteCard card={card}/>;
  case 'menu':{const slots:{day:number;meal:string;title:string}[]=Array.isArray(d.slots)?d.slots:[];
   return <CardShell card={card} tone="rose" label={'Menu · '+(d.weekStart?weekLabel(String(d.weekStart)):'semaine')} title={<>Notre menu <em>de la semaine</em></>} onOpen={onOpen}>
    <ul className="house-card-list">{slots.slice(0,6).map((s,n)=><li key={n}><span aria-hidden="true">{foodEmoji(s.title,'🍽️')}</span><span>{s.title}</span><small>{days[s.day]||''} {s.meal==='lunch'?'midi':'soir'}</small></li>)}</ul>
    {slots.length>6&&<p className="house-card-meta">+ {slots.length-6} autres repas</p>}
   </CardShell>;}
 }
 return null;
}

// Petit mot doux en forme d’enveloppe : rabat en V, sceau en cœur, nos deux mascottes en bas.
function SweetNoteCard({card}:{card:HouseCard}){
 const text=String(card.data?.text||'Je pense à toi.');
 return <article className={`house-card house-card-mot nd-tone-${card.ref==='perso'?'rose':sweetNoteTone(card.ref)}`}>
  <svg className="mot-flap" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true"><path className="mot-flap-fill" d="M0 0H300C236 16 186 38 150 56 114 38 64 16 0 0z"/><path className="mot-flap-line" d="M0 0C64 16 114 38 150 56 186 38 236 16 300 0"/></svg>
  <span className="mot-seal" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 20.5C5 16 2.5 12.4 2.5 9a4.6 4.6 0 0 1 9.5-2.4A4.6 4.6 0 0 1 21.5 9c0 3.4-2.5 7-9.5 11.5z"/></svg></span>
  <span className="house-card-label">Un petit mot doux</span>
  <p className="mot-text"><RichText text={text}/></p>
  {card.note&&<p className="house-card-note"><RichText text={card.note}/></p>}
  <div className="house-card-deco" aria-hidden="true"><Buddy shape="pill" tone="lavande" mood="love" look="right" size={34}/><Buddy shape="flower" tone="peche" mood="happy" size={36}/></div>
 </article>;
}

const relativeWeek=(week:string,current:string)=>{const n=Math.round((Date.parse(week)-Date.parse(current))/(7*86400000));return n===0?'Cette semaine':n===1?'La semaine prochaine':n===-1?'La semaine dernière':n>1?`Dans ${n} semaines`:`Il y a ${-n} semaines`;};
type Empty={text:string;action:string;target:HouseOpenTarget;tone:'citron'|'menthe'|'beurre'|'lavande'|'rose'|'peche'|'lilas';shape:'pot'|'blob'|'pill'|'flower'|'dome';buddy:'citron'|'menthe'|'beurre'|'lavande'|'rose'|'peche'};
const empties:Partial<Record<HouseCardKind,Empty>>={
 shopping:{text:'Notre liste de courses est encore toute vide. On y glisse quelques envies ?',action:'Ajouter des courses',target:{page:'shopping',create:'shopping'},tone:'beurre',shape:'pot',buddy:'peche'},
 expense:{text:'Aucune dépense notée pour l’instant. La première sera peut-être un bon resto ?',action:'Noter une dépense',target:{page:'expenses',create:'expense'},tone:'peche',shape:'blob',buddy:'lavande'},
 plant:{text:'Notre jardin attend sa première plante. On en adopte une ?',action:'Ajouter une plante',target:{page:'plants',create:'plants'},tone:'menthe',shape:'flower',buddy:'peche'},
 task:{text:'Pas encore de mission : la maison est bien calme ! On en confie une ?',action:'Créer une mission',target:{page:'tasks',create:'task'},tone:'citron',shape:'pill',buddy:'lavande'},
 appointment:{text:'Pas encore de rendez-vous partagé à venir. On prévoit un moment ensemble ?',action:'Ajouter un rendez-vous',target:{page:'calendar',create:'appointment'},tone:'lilas',shape:'dome',buddy:'beurre'},
 recipe:{text:'Aucune recette ne correspond. Et si on ajoutait la nôtre ?',action:'Ajouter ma recette',target:{page:'meals',create:'recipe'},tone:'rose',shape:'blob',buddy:'citron'},
 menu:{text:'Pas encore de menu de la semaine. On prévoit nos repas ensemble ?',action:'Préparer un menu',target:{page:'meals',create:'menu'},tone:'rose',shape:'pot',buddy:'beurre'},
};
function ShareEmpty({empty,onGo}:{empty:Empty;onGo?:(t:HouseOpenTarget)=>void}){
 return <div className={'house-share-empty nd-tone-'+empty.tone}><Buddy shape={empty.shape} tone={empty.buddy} mood="happy" size={56}/><p>{empty.text}</p>{onGo&&<button type="button" className="primary" onClick={()=>onGo(empty.target)}><Plus size={18} aria-hidden="true"/>{empty.action}</button>}</div>;
}

/** Choix d’un élément de la maison à partager. La confidentialité reste vérifiée par le serveur. */
export function HouseSharePicker({home,names,active,onClose,onSend,onFiles,onOpen}:{home?:HouseShareData;names:string[];active:number;onClose:()=>void;onSend:(ref:HouseCardRef,note:string)=>Promise<true|string|boolean>;onFiles:()=>void;onOpen?:(t:HouseOpenTarget)=>void}){
 const[kind,setKind]=useState<HouseCardKind|null>(null),[pick,setPick]=useState(''),[note,setNote]=useState(''),[withNote,setWithNote]=useState(false),[busy,setBusy]=useState(false),[query,setQuery]=useState(''),[shopWeek,setShopWeek]=useState('');
 const[recipes,setRecipes]=useState<Recipe[]|null>(null),[plans,setPlans]=useState<MealPlan[]|null>(null),[error,setError]=useState('');
 useEffect(()=>{if((kind!=='recipe'&&kind!=='menu')||recipes)return;let alive=true;
  Promise.all([import('../lib/recipes'),apiFetch('/api/recipes').then(r=>r.ok?r.json():Promise.reject()).catch(()=>({recipes:[],plans:[]}))]).then(([lib,d])=>{if(!alive)return;setRecipes([...lib.recipes,...(d.recipes||[]).filter((r:Recipe)=>!r.archived)]);setPlans(d.plans||[]);});
  return()=>{alive=false;};},[kind,recipes]);
 const week=weekStart(),now=today();
 const options=useMemo(()=>{
  const items=home?.items||[];
  switch(kind){
   case 'expense':return [...(home?.entries||[])].sort((a,b)=>b.date.localeCompare(a.date)||(b.createdAt||'').localeCompare(a.createdAt||'')).slice(0,20).map(e=>({id:e.id,title:e.title,meta:`${money(e.cents)} · ${who(e.member,names)} · ${shortDate(e.date)}`}));
   case 'plant':return (home?.plants||[]).map(p=>{const mood=plantMood(p);return {id:p.id,title:p.name,meta:mood==='thirsty'||mood==='droopy'?'A soif !':mood==='ready'?'Arrosage aujourd’hui':'Va bien'+(plantCare(p).some(c=>c.overdue>=0)?' · un soin à faire':'')};});
   case 'task':return items.filter(i=>i.kind==='task').sort((a,b)=>Number(a.done)-Number(b.done)||b.priority-a.priority).slice(0,30).map(t=>({id:t.id,title:t.title,meta:`${who(t.assignee,names)}${t.due?' · '+shortDate(t.due):''} · ${t.done?'Faite':'À faire'}`}));
   case 'appointment':return (home?.appointments||[]).filter(a=>a.visibility==='shared'&&!a.provisional&&(a.status==='to_book'||(a.endDate||a.date)>=now||a.recurrence&&a.recurrence!=='none')).sort((a,b)=>(a.date||'9').localeCompare(b.date||'9')).slice(0,30).map(a=>({id:a.id,title:a.title,meta:a.date?shortDate(a.date)+(a.time?' · '+a.time:''):'Date à fixer'}));
   case 'recipe':{const q=query.trim().toLocaleLowerCase('fr');return (recipes||[]).filter(r=>!q||r.title.toLocaleLowerCase('fr').includes(q)).slice(0,30).map(r=>({id:r.id,title:r.title,meta:r.minutes?`${r.minutes} min`:''}));}
   case 'menu':return [...(plans||[])].sort((a,b)=>b.weekStart.localeCompare(a.weekStart)).slice(0,12).map(p=>({id:p.id,title:'Semaine du '+weekLabel(p.weekStart),meta:`${p.slots.length} repas prévus`}));
  }
  return [];
 },[kind,home,names,recipes,plans,query,now]);
 // Weeks with something left to buy, from last week on: the couple picks the one to share.
 const shopWeeks=useMemo(()=>{const from=shiftWeek(week,-1),set=new Set<string>();for(const i of home?.items||[])if(i.kind==='shopping'&&!i.done&&i.weekStart&&i.weekStart>=from)set.add(i.weekStart);return [...set].sort().slice(0,8);},[home,week]);
 const chosenWeek=shopWeeks.includes(shopWeek)?shopWeek:shopWeeks.includes(week)?week:shopWeeks.find(w=>w>week)||shopWeeks[0]||'';
 const toBuy=(home?.items||[]).filter(i=>i.kind==='shopping'&&i.weekStart===chosenWeek&&!i.done);
 const choice=kind==='mot'?{label:'Un petit mot doux'}:shareChoices.find(c=>c.kind===kind);
 const choose=(next:HouseCardKind|null)=>{setKind(next);setPick('');setError('');setNote('');setWithNote(false);setQuery('');};
 // Ready when something is chosen: a week with items, an element, or (sweet note) a ready-made note or one’s own words.
 const ready=!!kind&&(kind==='shopping'?toBuy.length>0:kind==='mot'?!!pick||!!note.trim():!!pick);
 async function send(){if(!kind||busy)return;if(!ready){setError(kind==='mot'?'Choisissez un mot tout prêt ou écrivez le vôtre.':'Choisissez un élément à partager.');return;}setBusy(true);setError('');
  // Le petit mot reste facultatif : sans texte, seule la carte part. Sans mot tout prêt, le texte devient la carte.
  const ref=(kind==='shopping'?{kind,weekStart:chosenWeek}:kind==='mot'&&!pick?{kind,id:'perso'}:{kind,id:pick}) as HouseCardRef;
  const result=await onSend(ref,note.trim());setBusy(false);if(result===true)onClose();else setError(typeof result==='string'?result:'Envoi impossible pour le moment.');}
 const go=onOpen&&((t:HouseOpenTarget)=>{onClose();onOpen(t);});
 return <LifeDialog title={choice?choice.label:'Partager avec '+names[1-active]} onClose={onClose} busy={busy} className="house-share-dialog">
  {!kind?<>
   <button type="button" className="house-share-files" onClick={()=>{onClose();onFiles();}}><Paperclip size={20}/><span><strong>Photos ou documents</strong><small>Images, PDF, documents · 30 Mo</small></span></button>
   <button type="button" className="house-share-sweet nd-tone-rose" onClick={()=>choose('mot')}><Heart size={22} aria-hidden="true"/><span><strong>Un petit mot doux</strong><small>Le vôtre ou un mot tout prêt, dans une jolie enveloppe</small></span></button>
   <h3 className="house-share-heading">Partager depuis la maison</h3>
   <div className="house-share-grid">{shareChoices.map(c=><button type="button" key={c.kind} className={'nd-tone-'+c.tone} onClick={()=>choose(c.kind)}><c.icon size={22} aria-hidden="true"/><span><strong>{c.label}</strong><small>{c.hint}</small></span></button>)}</div>
  </>:<>
   <button type="button" className="text-link house-share-back" disabled={busy} onClick={()=>choose(null)}><ArrowLeft size={18} aria-hidden="true"/>Autre chose à partager</button>
   {kind==='shopping'?(shopWeeks.length?<>
    <div className="house-share-weeks" role="radiogroup" aria-label="Semaine à partager">{shopWeeks.map(w=><button type="button" role="radio" key={w} aria-checked={w===chosenWeek} onClick={()=>setShopWeek(w)}><strong>{relativeWeek(w,week)}</strong><small>{weekLabel(w)}</small></button>)}</div>
    <HouseCardMessage names={names} card={{kind:'shopping',ref:chosenWeek,data:{weekStart:chosenWeek,toBuy:toBuy.length,bought:(home?.items||[]).filter(i=>i.kind==='shopping'&&i.weekStart===chosenWeek&&i.done).length,items:toBuy.slice(0,12).map(i=>({title:i.title,quantity:i.quantity}))}}}/>
   </>:<ShareEmpty empty={empties.shopping!} onGo={go}/>)
   :kind==='mot'?<>
    <label className="house-share-note"><span>{pick?<>Une ligne en plus <span className="optional">(facultatif)</span></>:'Écrire mon propre mot'}</span><textarea rows={2} maxLength={280} value={note} disabled={busy} onChange={e=>setNote(e.target.value)} placeholder={pick?'Rien que pour toi…':'Tu illumines mes journées…'}/></label>
    <p className="house-share-or">{pick?'Votre mot tout prêt':'Ou choisir un mot tout prêt'}</p>
    <div className="house-share-options house-share-sweet-list" role="radiogroup" aria-label="Choisir un petit mot doux">{sweetNotes.map(n=><button type="button" role="radio" aria-checked={pick===n.id} key={n.id} className={'nd-tone-'+n.tone} onClick={()=>setPick(pick===n.id?'':n.id)}><span>{n.text}</span></button>)}</div>
   </>
   :<>
    {kind==='appointment'&&<p className="helper-copy"><LockKeyhole size={14}/> Seuls les rendez-vous partagés apparaissent. Les privés restent privés.</p>}
    {kind==='recipe'&&<label className="house-share-search">Chercher une recette<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Chakchouka, curry…"/></label>}
    {(kind==='recipe'||kind==='menu')&&!recipes?<p role="status" className="helper-copy">On ouvre le carnet…</p>
    :options.length?<div className="house-share-options" role="radiogroup" aria-label={choice?.label}>{options.map(o=><button type="button" role="radio" aria-checked={pick===o.id} key={o.id} onClick={()=>setPick(o.id)}><strong>{o.title}</strong>{o.meta&&<small>{o.meta}</small>}</button>)}</div>
    :empties[kind]&&<ShareEmpty empty={empties[kind]!} onGo={go}/>}
   </>}
   {kind!=='mot'&&(kind!=='shopping'||shopWeeks.length>0)&&(kind==='shopping'||options.length>0)&&(withNote?<label className="house-share-note"><span>Un petit mot <span className="optional">(facultatif)</span></span><textarea rows={2} maxLength={280} value={note} disabled={busy} autoFocus onChange={e=>setNote(e.target.value)} placeholder={kind==='plant'?'Regarde, elle a soif, tu peux l’arroser ?':kind==='shopping'?'Tu peux passer au marché ?':'Un mot doux…'}/></label>
   :<button type="button" className="text-link house-share-add-note" disabled={busy} onClick={()=>setWithNote(true)}><Plus size={18} aria-hidden="true"/>Ajouter un petit mot<span className="optional">(facultatif)</span></button>)}
   {error&&<p className="form-error" role="alert">{error}</p>}
   <div className="chat-upload-actions"><button type="button" className="secondary" disabled={busy} onClick={onClose}>Annuler</button><button type="button" className="primary" disabled={busy||!ready} onClick={send}><Send size={18}/>{busy?'Envoi…':'Envoyer'}</button></div>
  </>}
 </LifeDialog>;
}
