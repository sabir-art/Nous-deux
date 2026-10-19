import {HeroCard} from '../design-system/runtime';
import {useEffect,useState,type FormEvent} from 'react';
import {Check,Gift as GiftIcon,LockKeyhole,ArrowUpRight,Trash2} from './icons';
import {centsFromInput,money,type Gift} from '../lib/domain';
import LifeDialog from './life-dialog';
type Save=(a:string,p:unknown,m?:string)=>Promise<boolean>;
type Kid={id:string;name:string};type Who=-1|0|1|`child:${string}`|'other';type Target={recipient:-1|0|1;child?:string;other?:string};
// Anyone outside the household (a friend, a cousin) is just a name, grouped under « Pour d’autres ».
const whoOf=(g:Target):Who=>g.other?'other':g.child?`child:${g.child}`:g.recipient;
const forWhom=(g:Target,names:string[],kids:Kid[])=>g.other?`Pour ${g.other}`:g.child?`Pour ${kids.find(k=>k.id===g.child)?.name||'un enfant'}`:g.recipient===-1?'Pour nous deux':`Pour ${names[g.recipient]}`;
// Secret ideas never reach the partner: the API filters them out, this page only labels them for their author.
// Children appear as recipients only when the household has turned family mode on and created a profile.
export default function HouseGifts({create=false,onCreated,gifts,kids=[],active,names,busy,error,save}:{create?:boolean;onCreated?:()=>void;gifts:Gift[];kids?:Kid[];active:number;names:string[];busy:boolean;error:string;save:Save}){
 const[editing,setEditing]=useState<Gift|null|undefined>(undefined),[filter,setFilter]=useState<'all'|Who>('all'),[showBought,setShowBought]=useState(false);
 useEffect(()=>{if(create){setEditing(null);onCreated?.();}},[create,onCreated]);
 const shown=gifts.filter(g=>(filter==='all'||whoOf(g)===filter)&&(showBought||!g.bought)).sort((a,b)=>Number(a.bought)-Number(b.bought)||b.createdAt.localeCompare(a.createdAt));
 const bought=gifts.filter(g=>g.bought&&(filter==='all'||whoOf(g)===filter)).length;
 const toggle=(g:Gift)=>save('gift',{...g,bought:!g.bought},g.bought?'Idée remise dans la liste.':'Offert ! Bien joué.');
 const filters:[typeof filter,string][]=[['all','Toutes'],[-1,'Pour nous deux'],[0,`Pour ${names[0]}`],[1,`Pour ${names[1]}`],...kids.map(k=>[`child:${k.id}`,`Pour ${k.name}`] as [Who,string]),...(gifts.some(g=>g.other)?[['other','Pour d’autres'] as [Who,string]]:[])];
 return <div className="gifts-space"><HeroCard tone="lilas" title={<>Une idée,<br/>un <em>sourire.</em></>} text="Ce qu’on aimerait s’offrir, à deux ou l’un à l’autre. Les surprises restent secrètes." action="Noter une idée" onAction={()=>setEditing(null)} buddy={{shape:'blob',tone:'rose',mood:'love'}}/>
 <div className="life-filters" aria-label="Filtrer les idées">{filters.map(([id,label])=><button key={String(id)} className={filter===id?'selected':''} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label}</button>)}</div>
 {shown.length?<ul className="gift-list">{shown.map(g=>{const mine=g.owner===active;return <li key={g.id} className={`gift-card${g.bought?' bought':''}${g.secret?' secret':''}`}>
  <button className="gift-open" onClick={()=>setEditing(g)} disabled={!mine} aria-label={mine?`Modifier ${g.title}`:undefined}><span className="gift-tags"><span className="gift-for">{forWhom(g,names,kids)}</span>{g.secret&&<span className="gift-secret"><LockKeyhole size={14} aria-hidden="true"/>Secret · visible par toi seulement</span>}{g.bought&&<span className="gift-bought">Offert</span>}</span><strong>{g.title}</strong>{g.note&&<span className="gift-note">{g.note}</span>}<small>{g.price!==null?money(g.price)+' · ':''}Noté par {mine?'toi':names[g.owner]}</small></button>
  <div className="gift-actions">{g.link&&<a className="text-link" href={g.link} target="_blank" rel="noopener noreferrer">Voir le lien <ArrowUpRight size={15} aria-hidden="true"/></a>}{mine&&<button className={g.bought?'secondary':'primary'} disabled={busy} onClick={()=>void toggle(g)} aria-pressed={g.bought}><Check size={17} aria-hidden="true"/>{g.bought?'Offert':'C’est offert'}</button>}</div>
 </li>;})}</ul>:<div className="panel empty"><span className="meal-empty" aria-hidden="true">🎁</span><h2>Pas encore d’idée ici</h2><p>Notez une envie dès qu’elle passe : un livre, une sortie, un petit rien qui fera plaisir.</p><button className="primary" onClick={()=>setEditing(null)}><GiftIcon size={18} aria-hidden="true"/>Noter une idée</button></div>}
 {bought>0&&<button className="text-link" onClick={()=>setShowBought(v=>!v)}>{showBought?'Masquer les idées offertes':`Voir les idées offertes (${bought})`}</button>}
 {editing!==undefined&&<LifeDialog title={editing?'Mon idée cadeau':'Une nouvelle idée cadeau'} onClose={()=>setEditing(undefined)} busy={busy}><GiftForm key={editing?.id||'new'} gift={editing} kids={kids} active={active} names={names} busy={busy} error={error} onSave={async g=>{if(await save('gift',g,'Idée notée.'))setEditing(undefined);}} onDelete={editing?async()=>{if(window.confirm('Supprimer cette idée ?')&&await save('delete-gift',{id:editing.id,version:editing.version},'Idée supprimée.'))setEditing(undefined);}:undefined}/></LifeDialog>}
 </div>;
}
function GiftForm({gift,kids,active,names,busy,error,onSave,onDelete}:{gift:Gift|null;kids:Kid[];active:number;names:string[];busy:boolean;error:string;onSave:(g:unknown)=>Promise<void>;onDelete?:()=>void}){
 const partner=active===0?1:0;
 const[id]=useState(()=>gift?.id||crypto.randomUUID()),[recipient,setRecipient]=useState<Who>(gift?whoOf(gift):partner),[secret,setSecret]=useState(gift?.secret??true),[other,setOther]=useState(gift?.other||''),[touched,setTouched]=useState(!!gift),[localError,setLocalError]=useState('');
 function pick(r:Who){setRecipient(r);if(!touched)setSecret(r===partner);}
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const raw=String(f.get('price')||'').trim();let price:number|null=null;
  if(raw){try{price=centsFromInput(raw);}catch(err){setLocalError((err as Error).message);return;}}setLocalError('');
  await onSave({id,version:gift?.version||0,title:String(f.get('title')),recipient:typeof recipient==='string'?-1:recipient,child:typeof recipient==='string'&&recipient!=='other'?recipient.slice(6):undefined,other:recipient==='other'?other.trim():undefined,note:String(f.get('note')||''),link:String(f.get('link')||'').trim(),price,secret,bought:gift?.bought||false});}
 const options:[Who,string][]=[[partner as 0|1,names[partner]],[active as 0|1,names[active]],[-1,'Nous deux'],...kids.map(k=>[`child:${k.id}`,k.name] as [Who,string]),['other','Quelqu’un d’autre']];
 return <form className="form" onSubmit={submit}><label>L’idée<input name="title" required autoFocus maxLength={100} defaultValue={gift?.title||''} placeholder="Un livre de cuisine, un week-end…"/></label>
 <fieldset><legend>Pour qui ?</legend><div className="person-options gift-recipients">{options.map(([r,label])=><button type="button" key={r} className={recipient===r?'selected':''} aria-pressed={recipient===r} onClick={()=>pick(r)}>{label}{recipient===r&&<Check size={15} aria-hidden="true"/>}</button>)}</div>{recipient==='other'&&<label>Son prénom<input value={other} onChange={e=>setOther(e.target.value)} required maxLength={40} placeholder="Sophie, mon frère, les voisins…"/></label>}</fieldset>
 <label className="check-label"><input type="checkbox" checked={secret} onChange={e=>{setSecret(e.target.checked);setTouched(true);}}/><LockKeyhole size={16} aria-hidden="true"/>Garder secret</label>
 <p className="helper-copy">{secret?`Cette idée reste visible par toi seulement : ${names[partner]} ne la voit pas et ne reçoit aucune notification.`:`${names[partner]} verra aussi cette idée.`}</p>
 <div className="form-grid"><label>Prix (facultatif)<input name="price" inputMode="decimal" maxLength={10} defaultValue={gift?.price!=null?(gift.price/100).toFixed(2).replace('.',','):''} placeholder="25,00"/></label><label>Lien (facultatif)<input name="link" type="url" maxLength={500} defaultValue={gift?.link||''} placeholder="https://…"/></label></div>
 <label>Une note<textarea name="note" maxLength={500} rows={3} defaultValue={gift?.note||''} placeholder="Taille, couleur, où le trouver…"/></label>
 {(localError||error)&&<p className="form-error" role="alert">{localError||error}</p>}
 <div className="dialog-actions">{onDelete&&<button type="button" className="icon-button delete-button" aria-label="Supprimer l’idée" disabled={busy} onClick={onDelete}><Trash2 size={18}/></button>}<button className="primary grow" disabled={busy} type="submit"><Check size={18}/>{busy?'Enregistrement…':'Enregistrer'}</button></div></form>;
}
