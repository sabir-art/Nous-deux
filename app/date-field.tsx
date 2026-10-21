import {useEffect,useRef,useState,type ChangeEvent,type InputHTMLAttributes} from 'react';
import {CalendarDays,ChevronLeft,ChevronRight,Clock} from './icons';
type Props=Omit<InputHTMLAttributes<HTMLInputElement>,'type'>&{type:'date'|'time'|'month';displayLabel?:string};
const pad=(n:number)=>String(n).padStart(2,'0');
const iso=(y:number,m:number,d:number)=>`${y}-${pad(m+1)}-${pad(d)}`;
const todayIso=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris'}).format(new Date());
const monthNames=Array.from({length:12},(_,m)=>new Intl.DateTimeFormat('fr-FR',{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2026,m,15))));
const weekdays=['L','M','M','J','V','S','D'];
const labelOf=(type:Props['type'],selected:string)=>!selected?(type==='time'?'Choisir l’heure':type==='month'?'Choisir le mois':'Choisir la date'):type==='time'?selected:new Date(selected+(type==='month'?'-01':'')+'T12:00:00Z').toLocaleDateString('fr-FR',type==='month'?{month:'long',year:'numeric',timeZone:'UTC'}:{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
/** Dates use an in-page calendar: the native iPhone picker did not open reliably inside our dialogs. Times and months keep the native picker. */
export default function DateField({type,value,defaultValue,onChange,className='',displayLabel,...props}:Props){
 const[local,setLocal]=useState(String(defaultValue||''));const selected=String(value??local);
 if(type==='date')return <DatePicker {...props} selected={selected} className={className} label={displayLabel||labelOf(type,selected)} onPick={v=>{setLocal(v);onChange?.({target:{value:v,name:props.name},currentTarget:{value:v,name:props.name}} as unknown as ChangeEvent<HTMLInputElement>);}}/>;
 const Icon=type==='time'?Clock:CalendarDays;
 return <span className={'temporal-field '+className+(props.disabled?' disabled':'')}><span className={selected?'temporal-value':'temporal-placeholder'} aria-hidden="true">{displayLabel||labelOf(type,selected)}</span><Icon size={18} aria-hidden="true"/><input {...props} type={type} value={selected} onChange={e=>{setLocal(e.target.value);onChange?.(e);}}/></span>;
}

function DatePicker({selected,label,className,onPick,name,min,max,required,disabled,id,'aria-label':ariaLabel}:{selected:string;label:string;className:string;onPick:(v:string)=>void}&Omit<InputHTMLAttributes<HTMLInputElement>,'type'>){
 const[open,setOpen]=useState(false);const root=useRef<HTMLSpanElement>(null);
 const start=selected||(max&&todayIso()>String(max)?String(max):min&&todayIso()<String(min)?String(min):todayIso());
 const[view,setView]=useState({y:Number(start.slice(0,4)),m:Number(start.slice(5,7))-1});
 useEffect(()=>{if(!open)return;const away=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};document.addEventListener('pointerdown',away);return()=>document.removeEventListener('pointerdown',away);},[open]);
 const toggle=()=>{if(disabled)return;if(!open)setView({y:Number(start.slice(0,4)),m:Number(start.slice(5,7))-1});setOpen(!open);};
 const allowed=(d:string)=>(!min||d>=String(min))&&(!max||d<=String(max));
 const shift=(step:number)=>setView(v=>{const m=v.m+step;return {y:v.y+Math.floor(m/12),m:((m%12)+12)%12};});
 const first=(new Date(Date.UTC(view.y,view.m,1)).getUTCDay()+6)%7,days=new Date(Date.UTC(view.y,view.m+1,0)).getUTCDate();
 const now=todayIso(),thisYear=Number(now.slice(0,4));
 const fromYear=min?Number(String(min).slice(0,4)):Math.min(thisYear-100,view.y),toYear=max?Number(String(max).slice(0,4)):Math.max(thisYear+10,view.y);
 const years=Array.from({length:toYear-fromYear+1},(_,i)=>toYear-i);
 const pick=(d:string)=>{onPick(d);setOpen(false);};
 return <span className="date-field" ref={root} onKeyDown={e=>{if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();setOpen(false);}}}>
  <button type="button" id={id} aria-label={ariaLabel} className={'temporal-field date-trigger '+className+(disabled?' disabled':'')} disabled={disabled} aria-expanded={open} aria-haspopup="dialog" onClick={toggle}><span className={selected?'temporal-value':'temporal-placeholder'}>{label}</span><CalendarDays size={18} aria-hidden="true"/></button>
  {name&&<input type="hidden" name={name} value={selected}/>}
  {open&&<span className="date-picker" role="dialog" aria-label="Choisir une date" onClick={e=>{if(!(e.target as Element).closest('button,select'))e.preventDefault();}}>
   <span className="date-picker-head"><button type="button" className="icon-button" aria-label="Mois précédent" onClick={()=>shift(-1)}><ChevronLeft size={18}/></button>
    <select aria-label="Mois" value={view.m} onChange={e=>setView(v=>({...v,m:Number(e.target.value)}))}>{monthNames.map((n,m)=><option key={m} value={m}>{n}</option>)}</select>
    <select aria-label="Année" value={view.y} onChange={e=>setView(v=>({...v,y:Number(e.target.value)}))}>{years.map(y=><option key={y} value={y}>{y}</option>)}</select>
    <button type="button" className="icon-button" aria-label="Mois suivant" onClick={()=>shift(1)}><ChevronRight size={18}/></button></span>
   <span className="date-picker-grid" role="grid">{weekdays.map((w,i)=><span key={'w'+i} className="date-picker-weekday" aria-hidden="true">{w}</span>)}{Array.from({length:first},(_,i)=><span key={'e'+i}/>)}
    {Array.from({length:days},(_,i)=>{const d=iso(view.y,view.m,i+1);return <button type="button" key={d} disabled={!allowed(d)} aria-pressed={d===selected} aria-label={new Date(d+'T12:00:00Z').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})} className={d===now?'is-today':''} onClick={()=>pick(d)}>{i+1}</button>;})}</span>
   <span className="date-picker-foot">{allowed(now)&&<button type="button" className="text-link" onClick={()=>pick(now)}>Aujourd’hui</button>}{!required&&selected&&<button type="button" className="text-link" onClick={()=>pick('')}>Effacer</button>}</span>
  </span>}
 </span>;
}
