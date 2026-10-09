import {useState,type InputHTMLAttributes} from 'react';
import {CalendarDays,Clock} from './icons';
type Props=Omit<InputHTMLAttributes<HTMLInputElement>,'type'>&{type:'date'|'time'|'month';displayLabel?:string};
/** Keep the native picker accessible, but size its hit area independently of WebKit's intrinsic date editor. */
export default function DateField({type,value,defaultValue,onChange,className='',displayLabel,...props}:Props){
 const[local,setLocal]=useState(String(defaultValue||''));const selected=String(value??local);
 const label=!selected?(type==='time'?'Choisir l’heure':type==='month'?'Choisir le mois':'Choisir la date'):type==='time'?selected:new Date(selected+(type==='month'?'-01':'')+'T12:00:00Z').toLocaleDateString('fr-FR',type==='month'?{month:'long',year:'numeric',timeZone:'UTC'}:{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
 const Icon=type==='time'?Clock:CalendarDays;
 return <span className={'temporal-field '+className+(props.disabled?' disabled':'')}><span className={selected?'temporal-value':'temporal-placeholder'} aria-hidden="true">{displayLabel||label}</span><Icon size={18} aria-hidden="true"/><input {...props} type={type} value={selected} onChange={e=>{setLocal(e.target.value);onChange?.(e);}}/></span>;
}
