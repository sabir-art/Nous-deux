import {useRef,type ReactNode} from 'react';
import {X} from './icons';
import {useDialog} from './use-dialog';
export default function LifeDialog({title,children,onClose,busy=false,className=''}:{title:string;children:ReactNode;onClose:()=>void;busy?:boolean;className?:string}){
 const ref=useRef<HTMLDialogElement>(null);
 useDialog(ref);
 return <dialog ref={ref} className={`life-dialog ${className}`} aria-label={title} onCancel={e=>{e.preventDefault();if(!busy)onClose();}}><div className="dialog-inner"><header className="dialog-head"><h2>{title}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer" disabled={busy}><X size={22}/></button></header>{children}</div></dialog>;
}
