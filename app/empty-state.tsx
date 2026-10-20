import type {ComponentType,ReactNode} from 'react';
import type {LucideProps} from 'lucide-react';
import {Plus} from './icons';
// One shared « nothing here yet » block: a small picture, a warm sentence and, when it helps,
// the button that opens the matching add form. Used on every page so empty spaces look alike.
type Props={icon?:ComponentType<LucideProps>;art?:ReactNode;title:ReactNode;children?:ReactNode;action?:string;onAction?:()=>void;actionIcon?:ComponentType<LucideProps>;disabled?:boolean;className?:string;heading?:'h2'|'h3';footer?:ReactNode};
export default function EmptyState({icon:Icon,art,title,children,action,onAction,actionIcon:ActionIcon=Plus,disabled=false,className='',heading:Heading='h3',footer}:Props){
 return <div className={`empty empty-state ${className}`.trim()}>{art?<span className="empty-art" aria-hidden="true">{art}</span>:Icon&&<span className="empty-icon" aria-hidden="true"><Icon size={27} strokeWidth={2}/></span>}<Heading>{title}</Heading>{children&&<p>{children}</p>}{action&&onAction&&<button type="button" className="secondary empty-start" disabled={disabled} onClick={onAction}><ActionIcon size={18} aria-hidden="true"/>{action}</button>}{footer}</div>;
}
