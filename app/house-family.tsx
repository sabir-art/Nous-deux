import DateField from './date-field';
import {HeroCard} from '../design-system/runtime';
import {useEffect,useState,type FormEvent} from 'react';
import {CalendarDays,Check,CheckCheck,Plus,Settings2,ShoppingBasket,Trash2,Repeat2} from './icons';
import {childAge,money,today,type Appointment,type Child,type Entry,type Item,type PersonTone,type Renewal} from '../lib/domain';
import {freeTones,toneLabels} from '../lib/tones';
import {addDays,appointmentCategories,occurrences} from '../lib/calendar';
import {weekStart} from '../lib/shopping';
import type {OpenAppointment} from './house-calendar';
import LifeDialog from './life-dialog';
type Save=(a:string,p:unknown,m?:string)=>Promise<boolean>;
const renewalStatus:Record<Renewal['status'],string>={ok:'Ça va',soon:'Bientôt',now:'À racheter'};
const nextStatus:Record<Renewal['status'],Renewal['status']>={ok:'soon',soon:'now',now:'ok'};
const rhythm=(a:Appointment)=>a.recurrence==='weekly'?'Chaque semaine':a.recurrence==='monthly'?'Chaque mois':a.recurrence==='yearly'?'Chaque année':`Tous les ${a.intervalDays} jours`;
const shortDate=(date:string)=>new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
// One optional space per child, next to (never instead of) the couple's own spaces.
export default function HouseFamily({create=false,onCreated,focus,kids,parents,appointments,tasks,entries,active,names,busy,error,save,onAppointment,onTask,onCheckTask,onAgenda}:{create?:boolean;onCreated?:()=>void;focus?:string;kids:Child[];parents:PersonTone[];appointments:Appointment[];tasks:Item[];entries:Entry[];active:number;names:string[];busy:boolean;error:string;save:Save;onAppointment:(o:OpenAppointment)=>void;onTask:(o:{item?:Item;child:string})=>void;onCheckTask:(item:Item)=>void;onAgenda:(child:string)=>void}){
 const[editing,setEditing]=useState<Child|null|undefined>(undefined),[selected,setSelected]=useState(focus||kids[0]?.id||'');
 useEffect(()=>{if(focus)setSelected(focus);},[focus]);
 useEffect(()=>{if(create){setEditing(null);onCreated?.();}},[create,onCreated]);
 useEffect(()=>{if(!kids.some(k=>k.id===selected))setSelected(kids[0]?.id||'');},[kids,selected]);
 const child=kids.find(k=>k.id===selected);
 return <div className="family-space"><HeroCard tone="menthe" title={<>Notre petite<br/><em>tribu.</em></>} text="Un espace pour chaque enfant, à côté du nôtre. Leurs dates rejoignent notre agenda." action="Ajouter un enfant" onAction={()=>setEditing(null)} buddy={{shape:'blob',tone:'beurre',mood:'love'}}/>
  {kids.length>1&&<div className="life-filters" aria-label="Choisir un enfant">{kids.map(k=><button key={k.id} className={`child-pill child-tone-${k.tone}${k.id===selected?' selected':''}`} aria-pressed={k.id===selected} onClick={()=>setSelected(k.id)}><i aria-hidden="true"/>{k.name}</button>)}</div>}
  {child?<ChildSpace key={child.id} child={child} appointments={appointments} tasks={tasks.filter(t=>t.child===child.id)} entries={entries} active={active} names={names} busy={busy} save={save} onEdit={()=>setEditing(child)} onAppointment={onAppointment} onTask={onTask} onCheckTask={onCheckTask} onAgenda={()=>onAgenda(child.id)}/>:<div className="panel empty"><span className="meal-empty" aria-hidden="true">🧸</span><h2>Un espace pour chaque enfant</h2><p>C’est facultatif. Quand la famille s’agrandit, ajoutez un profil : ses infos utiles, ses besoins, ses rendez-vous, ses activités et les affaires à renouveler. Vos espaces à deux ne changent pas.</p><button className="primary" onClick={()=>setEditing(null)}><Plus size={18}/>Ajouter un enfant</button></div>}
  {editing!==undefined&&<LifeDialog title={editing?`Le profil de ${editing.name}`:'Un nouvel enfant'} onClose={()=>setEditing(undefined)} busy={busy}><ChildForm key={editing?.id||'new'} child={editing} tones={freeTones(parents,kids.filter(k=>k.id!==editing?.id).map(k=>k.tone),editing?.tone)} busy={busy} error={error} onSave={async c=>{if(await save('child',c,'Profil enregistré.')){setEditing(undefined);setSelected((c as Child).id);}}} onDelete={editing&&editing.owner===active?async()=>{if(window.confirm(`Supprimer le profil de ${editing.name} ? Ses rendez-vous et dépenses restent dans l’agenda et le budget.`)&&await save('delete-child',{id:editing.id,version:editing.version},'Profil supprimé.'))setEditing(undefined);}:undefined}/></LifeDialog>}
 </div>;
}
function ChildSpace({child,appointments,tasks,entries,active,names,busy,save,onEdit,onAppointment,onTask,onCheckTask,onAgenda}:{child:Child;appointments:Appointment[];tasks:Item[];entries:Entry[];active:number;names:string[];busy:boolean;save:Save;onEdit:()=>void;onAppointment:(o:OpenAppointment)=>void;onTask:(o:{item?:Item;child:string})=>void;onCheckTask:(item:Item)=>void;onAgenda:()=>void}){
 const date=today(),mine=appointments.filter(a=>a.child===child.id);
 const upcoming=occurrences(mine.filter(a=>a.status==='scheduled'),date,addDays(date,366)).slice(0,5),toBook=mine.filter(a=>a.status==='to_book');
 const todo=tasks.filter(t=>!t.done).sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')),doneCount=tasks.length-todo.length;
 const activities=mine.filter(a=>a.status!=='done'&&a.recurrence&&a.recurrence!=='none');
 const month=date.slice(0,7),spent=entries.filter(e=>e.kind==='expense'&&e.child===child.id&&e.date.startsWith(month)).reduce((n,e)=>n+e.cents,0);
 const[title,setTitle]=useState(''),[size,setSize]=useState('');
 const setRenewals=(renewals:Renewal[],message:string)=>save('child',{...child,renewals},message);
 async function addRenewal(e:FormEvent){e.preventDefault();if(!title.trim())return;if(await setRenewals([...child.renewals,{id:crypto.randomUUID(),title:title.trim(),size:size.trim(),status:'ok'}],'Ajouté à la liste.')){setTitle('');setSize('');}}
 async function toShopping(r:Renewal){await save('item',{id:crypto.randomUUID(),version:0,kind:'shopping',title:r.title,quantity:r.size,note:`Pour ${child.name}`,photoId:null,assignee:-1,due:'',priority:0,done:false,weekStart:weekStart()},`${r.title} est dans la liste de courses.`);}
 const info:[string,string][]=[['École, crèche ou garde',child.school],['Santé, allergies',child.health],['Contacts utiles',child.contacts],['À savoir',child.notes]];
 return <div className="child-space">
  <section className={`child-card child-tone-${child.tone}`}><div><h2>{child.name}</h2><p>{[childAge(child.birthDate,date),child.birthDate&&`né·e le ${new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(child.birthDate+'T12:00:00Z'))}`].filter(Boolean).join(' · ')||'Profil partagé par vous deux'}</p></div><button className="icon-button" aria-label={`Modifier le profil de ${child.name}`} onClick={onEdit}><Settings2 size={18}/></button></section>
  <button className="secondary child-agenda-link" onClick={onAgenda}><CalendarDays size={18}/>Voir l’agenda de {child.name}</button>
  <div className="child-grid">
   <section className="panel child-section"><h3>Infos utiles</h3>{info.some(([,v])=>v)?<dl className="child-info">{info.filter(([,v])=>v).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>:<p className="helper-copy">École, médecin, allergies, numéros utiles : tout ce qu’on cherche toujours au mauvais moment.</p>}<button className="text-link" onClick={onEdit}>Compléter</button></section>
   <section className="panel child-section"><h3>Ses besoins du moment</h3>{child.needs?<p className="child-text">{child.needs}</p>:<p className="helper-copy">Sommeil, repas, propreté, devoirs… ce qui compte en ce moment.</p>}<button className="text-link" onClick={onEdit}>Modifier</button></section>
   <section className="panel child-section"><div className="section-title"><h3>Ses rendez-vous</h3><button className="text-link" onClick={()=>onAppointment({initialStatus:'scheduled',initialDate:date,initialChild:child.id})}><Plus size={15}/>Ajouter</button></div>
    {upcoming.length||toBook.length?<ul className="child-list">{upcoming.map(a=><li key={a.id+a.date}><button onClick={()=>onAppointment({appointment:a})}><CalendarDays size={16} aria-hidden="true"/><span><strong>{a.title}</strong><small>{shortDate(a.date)}{a.time?` · ${a.time}`:''} · {appointmentCategories[a.category]}</small></span></button></li>)}{toBook.map(a=><li key={a.id}><button onClick={()=>onAppointment({appointment:a})}><CalendarDays size={16} aria-hidden="true"/><span><strong>{a.title}</strong><small>À prendre{a.bookBy?` avant le ${shortDate(a.bookBy)}`:''}</small></span></button></li>)}</ul>:<p className="helper-copy">Pédiatre, vaccins, réunion d’école… Ils apparaissent aussi dans notre agenda, à sa couleur.</p>}</section>
   <section className="panel child-section"><div className="section-title"><h3>Ses activités</h3><button className="text-link" onClick={()=>onAppointment({initialStatus:'scheduled',initialDate:date,initialChild:child.id,initialRecurrence:'weekly'})}><Plus size={15}/>Ajouter</button></div>
    {activities.length?<ul className="child-list">{activities.map(a=><li key={a.id}><button onClick={()=>onAppointment({appointment:a})}><Repeat2 size={16} aria-hidden="true"/><span><strong>{a.title}</strong><small>{rhythm(a)}{a.time?` · ${a.time}`:''}{a.location?` · ${a.location}`:''}</small></span></button></li>)}</ul>:<p className="helper-copy">Piscine, musique, foot… une activité qui se répète chaque semaine.</p>}</section>
   <section className="panel child-section"><div className="section-title"><h3>Missions pour {child.name}</h3><button className="text-link" onClick={()=>onTask({child:child.id})}><Plus size={15}/>Confier</button></div>
    {todo.length?<ul className="child-list child-tasks">{todo.map(t=>{const can=t.owner===active||t.assignee===active;return <li key={t.id}><button className="checkbox" disabled={busy||!can} aria-label={`Terminer : ${t.title}`} aria-pressed={false} onClick={()=>onCheckTask(t)}/><button onClick={()=>onTask({item:t,child:child.id})}><CheckCheck size={16} aria-hidden="true"/><span><strong>{t.title}</strong><small>{t.assignee>=0?`Confiée à ${t.assignee===active?'moi':names[t.assignee]}`:'L’un de nous'}{t.due?` · pour le ${shortDate(t.due)}`:''}</small></span></button></li>;})}</ul>:<p className="helper-copy">Inscription à la cantine, rappel de vaccin, photos de classe… confiez-la à l’un de vous deux.</p>}
    {doneCount>0&&<p className="helper-copy">{doneCount} mission{doneCount>1?'s':''} terminée{doneCount>1?'s':''}, à retrouver dans Nos missions.</p>}</section>
   <section className="panel child-section child-renewals"><h3>Affaires à renouveler</h3>
    {child.renewals.length>0&&<ul className="renewal-list">{child.renewals.map(r=><li key={r.id} className={`renewal-${r.status}`}><span><strong>{r.title}</strong>{r.size&&<small>{r.size}</small>}</span><button className="renewal-status" disabled={busy} aria-label={`${r.title} : ${renewalStatus[r.status]}. Passer à « ${renewalStatus[nextStatus[r.status]]} »`} onClick={()=>void setRenewals(child.renewals.map(x=>x.id===r.id?{...x,status:nextStatus[r.status]}:x),`${r.title} : ${renewalStatus[nextStatus[r.status]].toLowerCase()}.`)}>{renewalStatus[r.status]}</button>{r.status!=='ok'&&<button className="icon-button" disabled={busy} aria-label={`Ajouter ${r.title} aux courses`} onClick={()=>void toShopping(r)}><ShoppingBasket size={18}/></button>}<button className="icon-button" disabled={busy} aria-label={`Retirer ${r.title}`} onClick={()=>void setRenewals(child.renewals.filter(x=>x.id!==r.id),'Retiré de la liste.')}><Trash2 size={16}/></button></li>)}</ul>}
    <form className="renewal-form" onSubmit={addRenewal}><label>Affaire<input value={title} maxLength={80} onChange={e=>setTitle(e.target.value)} placeholder="Chaussures, body, cartable…"/></label><label>Taille <span className="optional">(facultatif)</span><input value={size} maxLength={40} onChange={e=>setSize(e.target.value)} placeholder="Pointure 24, 18 mois…"/></label><button className="secondary" disabled={busy||!title.trim()}><Plus size={17}/>Ajouter</button></form>
    <p className="helper-copy">Touchez l’état pour passer de « Ça va » à « Bientôt » puis « À racheter ». Le panier l’ajoute à la liste de courses.</p></section>
   <section className="panel child-section"><h3>Ce mois-ci</h3><p className="child-cost">{money(spent)}</p><p className="helper-copy">Les dépenses de la catégorie « Enfants » notées pour {child.name}. Le détail reste dans Notre argent, avec le reste de nos dépenses.</p></section>
  </div>
 </div>;
}
function ChildForm({child,tones,busy,error,onSave,onDelete}:{child:Child|null;tones:PersonTone[];busy:boolean;error:string;onSave:(c:unknown)=>Promise<void>;onDelete?:()=>void}){
 const[id]=useState(()=>child?.id||crypto.randomUUID()),[tone,setTone]=useState<PersonTone>(child?.tone||tones[0]||'ciel');
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const v=(k:string)=>String(f.get(k)||'').trim();
  await onSave({id,version:child?.version||0,name:v('name'),birthDate:v('birthDate'),tone,school:v('school'),health:v('health'),contacts:v('contacts'),notes:v('notes'),needs:v('needs'),renewals:child?.renewals||[]});}
 return <form className="form" onSubmit={submit}>
  <div className="form-grid"><label>Prénom<input name="name" required autoFocus maxLength={60} defaultValue={child?.name||''}/></label><label>Date de naissance <span className="optional">(facultatif)</span><DateField name="birthDate" type="date" max={today()} defaultValue={child?.birthDate||''}/></label></div>
  <fieldset><legend>Sa couleur dans l’agenda</legend><div className="tone-swatches">{tones.map(t=><button type="button" key={t} className={`tone-swatch child-tone-${t}`} aria-pressed={tone===t} onClick={()=>setTone(t)}>{toneLabels[t]}</button>)}</div><p className="helper-copy">Les couleurs déjà prises par vous deux, par « nous deux », par les fêtes ou par un autre enfant ne sont pas proposées.</p></fieldset>
  <label>École, crèche ou garde<input name="school" maxLength={150} defaultValue={child?.school||''} placeholder="Crèche des Lilas, nounou, CP de Mme Martin…"/></label>
  <label>Santé, allergies<textarea name="health" rows={2} maxLength={500} defaultValue={child?.health||''} placeholder="Allergies, traitement, groupe sanguin…"/></label>
  <label>Contacts utiles<textarea name="contacts" rows={2} maxLength={500} defaultValue={child?.contacts||''} placeholder="Pédiatre, nounou, école…"/></label>
  <label>Ses besoins du moment<textarea name="needs" rows={2} maxLength={700} defaultValue={child?.needs||''} placeholder="Sieste à 13 h, apprend à lire, mange sans gluten…"/></label>
  <label>À savoir<textarea name="notes" rows={2} maxLength={700} defaultValue={child?.notes||''}/></label>
  <p className="helper-copy">Le profil est partagé : vous pouvez tous les deux le compléter.</p>
  {error&&<p className="form-error" role="alert">{error}</p>}
  <div className="dialog-actions">{onDelete&&<button type="button" className="icon-button delete-button" aria-label="Supprimer le profil" disabled={busy} onClick={onDelete}><Trash2 size={18}/></button>}<button className="primary grow" disabled={busy} type="submit"><Check size={18}/>{busy?'Enregistrement…':'Enregistrer'}</button></div>
 </form>;
}
