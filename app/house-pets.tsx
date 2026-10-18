import DateField from './date-field';
import PetBuddy from './pet-buddy';
import {HeroCard,Sticker} from '../design-system/runtime';
import {useEffect,useState,type FormEvent} from 'react';
import {CalendarDays,Check,Settings2,Trash2} from './icons';
import {addDays,occurrences} from '../lib/calendar';
import type {Appointment} from '../lib/domain';
import {parisDate} from '../lib/life';
import {petCare,petCareDone,petCareLabels,petCares,petDefaults,petMood,petQuips,type Pet,type PetCare,type PetTone} from '../lib/pets';
import LifeDialog from './life-dialog';
type Save=(a:string,p:unknown,m?:string)=>Promise<boolean>;
const careEmoji:Record<PetCare,string>={food:'🍖',walk:'🦮',litter:'🧺',groom:'🪮',health:'💊'};
const tones:[PetTone,string][]=[['beurre','Miel'],['peche','Roux'],['lavande','Gris'],['rose','Rose'],['menthe','Menthe'],['lilas','Lilas']];
const when=(overdue:number)=>overdue>0?`En retard de ${overdue} jour${overdue>1?'s':''}`:overdue===0?'Aujourd’hui':`Dans ${-overdue} jour${overdue<-1?'s':''}`;
export default function HousePets({create=false,onCreated,pets,appointments=[],onAppointment=()=>{},active,names,busy,error,save}:{create?:boolean;onCreated?:()=>void;pets:Pet[];appointments?:Appointment[];onAppointment?:(o:{appointment?:Appointment;pet?:Pet})=>void;active:number;names:string[];busy:boolean;error:string;save:Save}){
 const[editing,setEditing]=useState<Pet|null|undefined>(undefined),[celebrate,setCelebrate]=useState(''),[history,setHistory]=useState('');
 useEffect(()=>{if(create){setEditing(null);onCreated?.();}},[create,onCreated]);
 const date=parisDate();const waiting=pets.filter(p=>petCare(p,date).some(c=>c.overdue>=0)).length;
 async function care(p:Pet,kind:PetCare){if(await save('pet-care',{id:p.id,version:p.version,kind},`C’est noté pour ${p.name} : ${petCareLabels[kind].toLowerCase()}.`)){setCelebrate(p.id);setTimeout(()=>setCelebrate(''),2500);}}
 return <div className="pets-space"><HeroCard tone="peche" title={<>Nos boules<br/>de <em>poils.</em></>} text={waiting?`${waiting} compagnon${waiting>1?'s attendent':' attend'} un petit soin.`:'Câlins, gamelles et balades : on s’organise à deux.'} action="Ajouter un animal" onAction={()=>setEditing(null)} buddy={{shape:'blob',tone:'beurre',mood:'love'}}/>
 {pets.length?<div className="pets-grid">{pets.map(p=>{const mood=celebrate===p.id?'love':petMood(p,date);const cares=petCare(p,date);return <section className={`pet-card pet-tone-${p.tone}`} key={p.id}>
  <header><div><span>{p.breed||(p.kind==='cat'?'Notre chat':'Notre chien')}</span><h2>{p.name}</h2></div>{p.owner===active&&<button className="icon-button" aria-label={`Modifier ${p.name}`} onClick={()=>setEditing(p)}><Settings2 size={18}/></button>}</header>
  <div className="pet-visual"><p className={`nd-speech nd-speech-${mood==='sad'?'sad':mood==='love'?'love':'happy'}`} role="status">{petQuips[p.kind][mood]}</p><PetBuddy key={p.id+mood} kind={p.kind} tone={p.tone} mood={mood} name={p.name}/><div className="pet-tag"><Sticker tone={mood==='happy'||mood==='love'?'citron':mood==='ok'?'menthe':'peche'} size="sm" rotate={-4}>{mood==='love'?'merci !':mood==='happy'?'en forme':mood==='ok'?'c’est l’heure':mood==='want'?'psst…':'au secours !'}</Sticker></div></div>
  <div className="plant-care-list">{cares.map(c=>{const doneToday=p.careLog.some(l=>l.kind===c.kind&&l.date===date);return <div className={`plant-care-row ${c.overdue>=0?'due':''}`} key={c.kind}><span className="care-icon" aria-hidden="true">{careEmoji[c.kind]}</span><div><strong>{petCareLabels[c.kind]}</strong><small>{when(c.overdue)} · {c.interval===1?'tous les jours':`tous les ${c.interval} j`}</small></div><button className={c.overdue>=0&&!doneToday?'primary':'secondary'} disabled={busy||doneToday} onClick={()=>care(p,c.kind)}>{doneToday&&<Check size={16}/>}{doneToday?'Noté':petCareDone[c.kind]}</button></div>;})}</div>
  <button className="secondary plant-all-done" disabled={busy||!cares.some(c=>c.overdue>=0&&!p.careLog.some(l=>l.kind===c.kind&&l.date===date))} onClick={async()=>{if(await save('pet-care-all',{id:p.id,version:p.version},`Tous les soins de ${p.name} sont notés. Merci !`)){setCelebrate(p.id);setTimeout(()=>setCelebrate(''),2500);}}}><Check size={18}/>Tout est fait</button>
  {p.note&&<p className="plant-note">{p.note}</p>}
  {(()=>{const mine=appointments.filter(a=>a.pet===p.id);const next=occurrences(mine.filter(a=>a.status==='scheduled'),date,addDays(date,366)).filter(a=>a.date>=date).slice(0,2);const toBook=mine.filter(a=>a.status==='to_book');return <div className="pet-appointments">{[...next,...toBook].map(a=><button key={a.id+a.date} className="pet-appointment" onClick={()=>onAppointment({appointment:a})}><CalendarDays size={16} aria-hidden="true"/><span><strong>{a.title}</strong><small>{a.status==='to_book'?'À prendre':new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(a.date+'T12:00:00Z'))+(a.time?` · ${a.time}`:'')}</small></span></button>)}<button className="text-link" onClick={()=>onAppointment({pet:p})}><CalendarDays size={16} aria-hidden="true"/>Ajouter un rendez-vous à l’agenda</button></div>;})()}
  <footer><span>Fiche de {names[p.owner]}</span><button className="text-link" onClick={()=>setHistory(history===p.id?'':p.id)} aria-expanded={history===p.id}>Historique</button></footer>
  {history===p.id&&<div className="plant-history">{p.careLog.length?p.careLog.slice(0,12).map((c,i)=><p key={i}><strong>{petCareLabels[c.kind]}</strong> · {names[c.actor]} · {new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short'}).format(new Date(c.date+'T12:00:00'))}</p>):<p>Les prochains soins seront notés ici avec la personne qui s’en est occupée.</p>}</div>}
 </section>;})}</div>:<div className="panel empty pet-empty"><div className="pet-duo"><PetBuddy kind="dog" tone="beurre" size={96}/><PetBuddy kind="cat" tone="lavande" size={96}/></div><h3>Un chien, un chat ?</h3><p>Ajoutez votre compagnon, choisissez ses soins (repas, promenade, litière…) et cochez-les à deux.</p><button className="primary" onClick={()=>setEditing(null)}>Ajouter un animal</button></div>}
 {editing!==undefined&&<LifeDialog title={editing?`La fiche de ${editing.name}`:'Un nouveau compagnon'} onClose={()=>setEditing(undefined)} busy={busy}><PetForm key={editing?.id||'new'} pet={editing} busy={busy} error={error} onSave={async p=>{if(await save('pet',p,'La fiche est enregistrée.'))setEditing(undefined);}} onDelete={editing?async()=>{if(window.confirm(`Supprimer la fiche de ${editing.name} et son historique ?`)&&await save('delete-pet',{id:editing.id,version:editing.version},'Fiche supprimée.'))setEditing(undefined);}:undefined}/></LifeDialog>}
 </div>;
}
function PetForm({pet,busy,error,onSave,onDelete}:{pet:Pet|null;busy:boolean;error:string;onSave:(p:unknown)=>Promise<void>;onDelete?:()=>void}){
 const date=parisDate();
 const[id]=useState(()=>pet?.id||crypto.randomUUID()),[kind,setKind]=useState<'dog'|'cat'>(pet?.kind||'dog'),[tone,setTone]=useState<PetTone>(pet?.tone||'beurre'),[every,setEvery]=useState<Record<PetCare,number>>(pet?.every||petDefaults.dog);
 function pickKind(k:'dog'|'cat'){setKind(k);if(!pet)setEvery(petDefaults[k]);}
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const start=String(f.get('start')||date);
  await onSave({id,version:pet?.version||0,name:String(f.get('name')),kind,breed:String(f.get('breed')||''),tone,note:String(f.get('note')||''),every,last:pet?.last||Object.fromEntries(petCares.map(k=>[k,start]))});}
 return <form className="form" onSubmit={submit}>
  <fieldset><legend>C’est…</legend><div className="person-options">{(['dog','cat'] as const).map(k=><button type="button" key={k} className={kind===k?'selected':''} aria-pressed={kind===k} onClick={()=>pickKind(k)}>{k==='dog'?'Un chien':'Un chat'}{kind===k&&<Check size={15}/>}</button>)}</div></fieldset>
  <div className="pet-preview" aria-hidden="true"><PetBuddy kind={kind} tone={tone} size={84}/></div>
  <div className="form-grid"><label>Son petit nom<input name="name" required autoFocus maxLength={60} defaultValue={pet?.name||''} placeholder={kind==='dog'?'Biscuit':'Moustache'}/></label><label>Race (facultatif)<input name="breed" maxLength={80} defaultValue={pet?.breed||''} placeholder={kind==='dog'?'Golden, croisé…':'Européen, siamois…'}/></label></div>
  <fieldset><legend>Sa couleur</legend><div className="pet-tones">{tones.map(([t,label])=><button type="button" key={t} className={`pet-swatch pet-tone-${t}${tone===t?' selected':''}`} aria-pressed={tone===t} onClick={()=>setTone(t)}>{label}</button>)}</div></fieldset>
  <p className="helper-copy">Choisissez le rythme de chaque soin. 0 = pas suivi.</p>
  <div className="pet-intervals">{petCares.map(k=><label key={k}>{petCareLabels[k]} : tous les … jours<input type="number" min={0} max={365} required value={every[k]} onChange={e=>setEvery(v=>({...v,[k]:Math.max(0,Math.min(365,Number(e.target.value)||0))}))}/></label>)}</div>
  {!pet&&<label>Début du suivi<DateField name="start" type="date" required max={date} defaultValue={date}/></label>}
  <label>Ses petites habitudes<textarea name="note" rows={3} maxLength={700} defaultValue={pet?.note||''} placeholder="Croquettes matin et soir, allergique au poulet, vétérinaire…"/></label>
  {error&&<p className="form-error" role="alert">{error}</p>}
  <div className="dialog-actions">{onDelete&&<button type="button" className="icon-button delete-button" aria-label="Supprimer la fiche" disabled={busy} onClick={onDelete}><Trash2 size={18}/></button>}<button className="primary grow" disabled={busy} type="submit"><Check size={18}/>{busy?'Enregistrement…':pet?'Enregistrer':'Accueillir'}</button></div>
 </form>;
}
