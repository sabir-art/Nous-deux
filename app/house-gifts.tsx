import {useEffect,useState,type FormEvent,type ReactNode} from 'react';
import {Check,Gift as GiftIcon,LockKeyhole,ArrowUpRight,Trash2,Plus,ChevronLeft,Cake,X,Users} from './icons';
import {centsFromInput,money,type Appointment,type Gift} from '../lib/domain';
import LifeDialog from './life-dialog';
type Save=(a:string,p:unknown,m?:string)=>Promise<boolean>;
type Kid={id:string;name:string};export type Who=-1|0|1|`child:${string}`|'other';type Target={recipient:-1|0|1;child?:string;other?:string};
// Who a new idea is for, and the birthday it hangs from, when the form is opened from a filter or from a birthday.
export type GiftPreset={who:Who;other?:string;birthday?:string;birthdayName?:string};
// Anyone outside the household (a friend, a cousin) is just a name, grouped under « Pour d’autres ».
const whoOf=(g:Target):Who=>g.other?'other':g.child?`child:${g.child}`:g.recipient;
const forWhom=(g:Target,names:string[],kids:Kid[])=>g.other?`Pour ${g.other}`:g.child?`Pour ${kids.find(k=>k.id===g.child)?.name||'un enfant'}`:g.recipient===-1?'Pour nous deux':`Pour ${names[g.recipient]}`;
// Each recipient keeps a pastel of the design system, so the list reads at a glance without turning pink.
const toneOf=(w:Who)=>w===-1?'lilas':w===0?'menthe':w===1?'beurre':w==='other'?'peche':'citron';
const norm=(v:string)=>v.normalize('NFD').replace(/\p{M}/gu,'').trim().toLowerCase();
export const birthdayName=(a:Appointment)=>a.title.replace(/^Anniversaire (de |d’|d')/,'');
// The person behind a birthday of the agenda: one of us, a child (birthday computed from the profile) or anyone else by name.
export function birthdayPerson(a:Appointment,names:string[]):GiftPreset&{name:string}{
 const name=birthdayName(a);
 if(a.id.startsWith('birthday-')&&a.child)return {who:`child:${a.child}`,name};
 const partner=names.findIndex(n=>norm(n)===norm(name));
 if(partner===0||partner===1)return {who:partner,name};
 // Only a stored birthday can be linked; a pet's birthday is computed, so its ideas are matched by name.
 return {who:'other',other:name,name,...(a.id.startsWith('pet-birthday-')?{}:{birthday:a.id,birthdayName:name})};
}
export const giftsForPerson=(gifts:Gift[],p:GiftPreset)=>gifts.filter(g=>p.birthday&&g.birthday===p.birthday||p.who!=='other'&&whoOf(g)===p.who||p.who==='other'&&!g.birthday&&!!g.other&&!!p.other&&norm(g.other)===norm(p.other));
const sortGifts=(list:Gift[])=>[...list].sort((a,b)=>Number(a.bought)-Number(b.bought)||b.createdAt.localeCompare(a.createdAt));

function GiftCards({gifts,active,names,kids,busy,showFor=true,onEdit,save}:{gifts:Gift[];active:number;names:string[];kids:Kid[];busy:boolean;showFor?:boolean;onEdit:(g:Gift)=>void;save:Save}){
 const toggle=(g:Gift)=>save('gift',{...g,bought:!g.bought},g.bought?'Idée remise dans la liste.':'Offert ! Bien joué.');
 // Only the author sees the bin; house-api checks it again (and a partner's secret stays unknown: 404).
 const remove=(g:Gift)=>{if(window.confirm(`Supprimer l’idée « ${g.title} » ?`))void save('delete-gift',{id:g.id,version:g.version},'Idée supprimée.');};
 return <ul className="gift-list">{gifts.map(g=>{const mine=g.owner===active;return <li key={g.id} className={`gift-card${g.bought?' bought':''}`}>
  <button className="gift-open" onClick={()=>onEdit(g)} disabled={!mine} aria-label={mine?`Modifier ${g.title}`:undefined}>{(showFor||g.secret||g.bought)&&<span className="gift-tags">{showFor&&<span className={'gift-for tone-'+toneOf(whoOf(g))}>{forWhom(g,names,kids)}</span>}{g.secret&&<span className="gift-secret"><LockKeyhole size={14} aria-hidden="true"/>Secret</span>}{g.bought&&<span className="gift-bought">Offert</span>}</span>}<strong>{g.title}</strong>{g.note&&<span className="gift-note">{g.note}</span>}<small>{g.price!==null?money(g.price)+' · ':''}Noté par {mine?'toi':names[g.owner]}{g.secret?' · visible par toi seulement':''}</small></button>
  {(g.link||mine)&&<div className="gift-actions">{g.link&&<a className="text-link" href={g.link} target="_blank" rel="noopener noreferrer">Voir le lien <ArrowUpRight size={15} aria-hidden="true"/></a>}{mine&&<span className="gift-own-actions"><button className="icon-button gift-delete" disabled={busy} onClick={()=>remove(g)} aria-label={`Supprimer ${g.title}`} title="Supprimer"><Trash2 size={18} aria-hidden="true"/></button><button className="secondary gift-done" disabled={busy} onClick={()=>void toggle(g)} aria-pressed={g.bought}><Check size={17} aria-hidden="true"/>{g.bought?'Offert':'C’est offert'}</button></span>}</div>}
 </li>;})}</ul>;
}

// The whole list: for the two of us, for one or the other, for a child or for anyone else. It is opened from the agenda's birthdays.
// Secret ideas never reach the partner: the API filters them out, this page only labels them for their author.
export default function HouseGifts({create=false,onCreated,onBack,gifts,kids=[],active,names,busy,error,save}:{create?:boolean;onCreated?:()=>void;onBack?:()=>void;gifts:Gift[];kids?:Kid[];active:number;names:string[];busy:boolean;error:string;save:Save}){
 const[editing,setEditing]=useState<Gift|null|undefined>(undefined),[filter,setFilter]=useState<'all'|Who>('all'),[showBought,setShowBought]=useState(false);
 useEffect(()=>{if(create){setEditing(null);onCreated?.();}},[create,onCreated]);
 const inFilter=gifts.filter(g=>filter==='all'||whoOf(g)===filter);
 const shown=sortGifts(inFilter.filter(g=>showBought||!g.bought)),bought=inFilter.filter(g=>g.bought).length;
 const filters:[typeof filter,string][]=[['all','Toutes'],[-1,'Pour nous deux'],[0,`Pour ${names[0]}`],[1,`Pour ${names[1]}`],...kids.map(k=>[`child:${k.id}`,`Pour ${k.name}`] as [Who,string]),['other','Pour d’autres']];
 const label=filters.find(([id])=>id===filter)?.[1]||'';
 // A new idea is for the person of the chosen filter; it can still be changed in the form.
 const preset:GiftPreset|undefined=filter==='all'?undefined:{who:filter};
 return <div className="gifts-space">
  <div className="gifts-intro">{onBack&&<button className="text-link gifts-back" onClick={onBack}><ChevronLeft size={17} aria-hidden="true"/>Les anniversaires</button>}<p>Ce qu’on aimerait offrir, à deux, l’un à l’autre ou à nos proches. Les surprises restent secrètes.</p></div>
  <div className="life-filters" aria-label="Filtrer les idées">{filters.map(([id,text])=><button key={String(id)} className={filter===id?'selected':''} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{text}</button>)}</div>
  <button className="primary wide gift-add" onClick={()=>setEditing(null)}><Plus size={18} aria-hidden="true"/>{filter==='all'?'Noter une idée':filter===-1?'Une idée pour nous deux':filter==='other'?'Une idée pour quelqu’un':`Une idée ${label.replace(/^Pour /,'pour ')}`}</button>
  {shown.length?<GiftCards gifts={shown} active={active} names={names} kids={kids} busy={busy} showFor={filter==='all'||filter==='other'} onEdit={setEditing} save={save}/>:<div className="panel empty gift-empty"><GiftIcon size={28} aria-hidden="true"/><p>{bought?'Tout est déjà offert ici.':'Pas encore d’idée ici. Notez une envie dès qu’elle passe : un livre, une sortie, un petit rien qui fera plaisir.'}</p></div>}
  {bought>0&&<button className="text-link" onClick={()=>setShowBought(v=>!v)}>{showBought?'Masquer les idées offertes':`Voir les idées offertes (${bought})`}</button>}
  {editing!==undefined&&<LifeDialog title={editing?'Mon idée cadeau':'Une nouvelle idée cadeau'} onClose={()=>setEditing(undefined)} busy={busy}><GiftForm key={editing?.id||'new'} gift={editing} preset={preset} kids={kids} active={active} names={names} busy={busy} error={error} onSave={async g=>{if(await save('gift',g,'Idée notée.'))setEditing(undefined);}} onDelete={editing?async()=>{if(window.confirm('Supprimer cette idée ?')&&await save('delete-gift',{id:editing.id,version:editing.version},'Idée supprimée.'))setEditing(undefined);}:undefined}/></LifeDialog>}
 </div>;
}

// Opened from a birthday of the agenda: the ideas for that person, and a form to note one more, in the same sheet.
export function PersonGifts({person,gifts,kids=[],active,names,busy,error,save,onClose,onAll}:{person:GiftPreset&{name:string};gifts:Gift[];kids?:Kid[];active:number;names:string[];busy:boolean;error:string;save:Save;onClose:()=>void;onAll:()=>void}){
 const[editing,setEditing]=useState<Gift|null|undefined>(undefined);
 const list=sortGifts(giftsForPerson(gifts,person));
 return <LifeDialog title={editing===undefined?`Idées pour ${person.name}`:editing?'Mon idée cadeau':`Une idée pour ${person.name}`} onClose={editing===undefined?onClose:()=>setEditing(undefined)} busy={busy} className="person-gifts">
  {editing===undefined?<div className="person-gifts-body">
   {list.length?<GiftCards gifts={list} active={active} names={names} kids={kids} busy={busy} showFor={false} onEdit={setEditing} save={save}/>:<p className="helper-copy">Aucune idée pour l’instant. Notez-en une dès qu’elle passe : elle vous attendra ici.</p>}
   <button className="primary wide" onClick={()=>setEditing(null)}><Plus size={18} aria-hidden="true"/>Noter une idée</button>
   <button className="text-link" onClick={onAll}><GiftIcon size={16} aria-hidden="true"/>Toutes nos idées cadeaux</button>
  </div>:<GiftForm key={editing?.id||'new'} gift={editing} preset={person} kids={kids} active={active} names={names} busy={busy} error={error} onSave={async g=>{if(await save('gift',g,'Idée notée.'))setEditing(undefined);}} onDelete={editing?async()=>{if(window.confirm('Supprimer cette idée ?')&&await save('delete-gift',{id:editing.id,version:editing.version},'Idée supprimée.'))setEditing(undefined);}:undefined}/>}
 </LifeDialog>;
}

function GiftForm({gift,preset,kids,active,names,busy,error,onSave,onDelete}:{gift:Gift|null;preset?:GiftPreset;kids:Kid[];active:number;names:string[];busy:boolean;error:string;onSave:(g:unknown)=>Promise<void>;onDelete?:()=>void}){
 const partner=active===0?1:0;
 const first:Who=gift?whoOf(gift):preset?.who??partner;
 const[id]=useState(()=>gift?.id||crypto.randomUUID()),[recipient,setRecipient]=useState<Who>(first),[other,setOther]=useState(gift?.other||preset?.other||''),[birthday,setBirthday]=useState(gift?gift.birthday:preset?.birthday),[localError,setLocalError]=useState('');
 // The secret is asked again on saving; the idea's current choice (or « secret » for the partner) is the one put forward.
 const[secret,setSecret]=useState(gift?.secret??first===partner),[touched,setTouched]=useState(!!gift);
 const linked=birthday?(gift?.other&&gift.birthday===birthday?gift.other:preset?.birthdayName||other):'';
 function pick(r:Who){setRecipient(r);if(r!==first)setBirthday(undefined);if(!touched)setSecret(r===partner);}
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const raw=String(f.get('price')||'').trim();let price:number|null=null;
  if(raw){try{price=centsFromInput(raw);}catch(err){setLocalError((err as Error).message);return;}}setLocalError('');
  const choice=((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement|null)?.value;const keep=recipient===-1?gift?.secret??false:choice==='secret'?true:choice==='shared'?false:secret;
  setSecret(keep);setTouched(true);
  await onSave({id,version:gift?.version||0,title:String(f.get('title')),recipient:typeof recipient==='string'?-1:recipient,child:typeof recipient==='string'&&recipient!=='other'?recipient.slice(6):undefined,other:recipient==='other'?other.trim():undefined,birthday,note:String(f.get('note')||''),link:String(f.get('link')||'').trim(),price,secret:keep,bought:gift?.bought||false});}
 const options:[Who,string][]=[[partner as 0|1,names[partner]],[active as 0|1,names[active]],[-1,'Nous deux'],...kids.map(k=>[`child:${k.id}`,k.name] as [Who,string]),['other','Quelqu’un d’autre']];
 const save=(value:'secret'|'shared',text:string,icon:ReactNode)=><button type="submit" key={value} name="secret" value={value} className={(secret===(value==='secret')?'primary':'secondary')+' gift-save'} disabled={busy}>{icon}{busy?'Enregistrement…':text}</button>;
 return <form className="form gift-form" onSubmit={submit}><label>L’idée<input name="title" required autoFocus maxLength={100} defaultValue={gift?.title||''} placeholder="Un livre de cuisine, un week-end…"/></label>
 <fieldset><legend>Pour qui ?</legend><div className="person-options gift-recipients">{options.map(([r,text])=><button type="button" key={r} className={recipient===r?'selected':''} aria-pressed={recipient===r} onClick={()=>pick(r)}>{text}{recipient===r&&<Check size={15} aria-hidden="true"/>}</button>)}</div>{recipient==='other'&&<label>Son prénom<input value={other} onChange={e=>setOther(e.target.value)} required maxLength={40} placeholder="Ma sœur, un ami, les voisins…"/></label>}
  {birthday&&<p className="gift-linked"><Cake size={16} aria-hidden="true"/><span>Avec l’anniversaire {/^[aeiouyéèêàâîïôûh]/i.test(linked)?'d’':'de '}{linked} dans l’agenda</span><button type="button" className="icon-button" aria-label="Ne plus lier à cet anniversaire" onClick={()=>setBirthday(undefined)}><X size={16}/></button></p>}</fieldset>
 <div className="form-grid"><label>Prix (facultatif)<input name="price" inputMode="decimal" maxLength={10} defaultValue={gift?.price!=null?(gift.price/100).toFixed(2).replace('.',','):''} placeholder="25,00"/></label><label>Lien (facultatif)<input name="link" type="url" maxLength={500} defaultValue={gift?.link||''} placeholder="https://…"/></label></div>
 <label>Une note<textarea name="note" maxLength={500} rows={2} defaultValue={gift?.note||''} placeholder="Taille, couleur, où le trouver…"/></label>
 {(localError||error)&&<p className="form-error" role="alert">{localError||error}</p>}
 {recipient!==-1&&<div className="gift-secret-choice"><p className="gift-secret-question"><LockKeyhole size={16} aria-hidden="true"/>On la garde secrète ?</p><p className="helper-copy">Secrète : {names[partner]} ne la voit pas et n’en sait rien. À deux : {names[partner]} la voit aussi.</p></div>}
 {/* The current choice comes first in the page so that Entrée keeps it; CSS keeps « Secrète » on the left. */}
 <div className="dialog-actions gift-actions-row">{onDelete&&<button type="button" className="icon-button delete-button" aria-label="Supprimer l’idée" disabled={busy} onClick={onDelete}><Trash2 size={18}/></button>}{recipient===-1?<button className="primary grow" disabled={busy} type="submit"><Check size={18}/>{busy?'Enregistrement…':'Enregistrer'}</button>:secret?<>{save('secret','Secrète',<LockKeyhole size={17} aria-hidden="true"/>)}{save('shared','À deux',<Users size={17} aria-hidden="true"/>)}</>:<>{save('shared','À deux',<Users size={17} aria-hidden="true"/>)}{save('secret','Secrète',<LockKeyhole size={17} aria-hidden="true"/>)}</>}</div></form>;
}
