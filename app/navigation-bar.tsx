import {useState,type CSSProperties} from 'react';
import {Icon} from '../design-system/runtime';
import type {IconProps} from '../design-system/components/index';
export type NavigationTab={id:string;icon:IconProps['name'];label:string;tone:string;ink?:string};
export type TabBarProps={variant?:'pill'|'classic';active?:string;tabs?:NavigationTab[];onChange?:(id:string)=>void;onAdd?:()=>void};
export const navigationTabs:NavigationTab[]=[{id:'home',icon:'home',label:'Accueil',tone:'rose'},{id:'agenda',icon:'calendar',label:'Agenda',tone:'lavande'},{id:'repas',icon:'meal',label:'Repas',tone:'peche'},{id:'argent',icon:'wallet',label:'Argent',tone:'beurre'},{id:'nous',icon:'chat',label:'Nous',tone:'lilas'}];
// Keep the delivered design bundle intact; this is its new floating navigation variant.
export function TabBar({variant='pill',active,tabs=navigationTabs,onChange,onAdd}:TabBarProps){
 const[local,setLocal]=useState(tabs[0]?.id||'home'),selected=active??local;
 return <nav className={`couple-navigation couple-navigation-${variant}${onAdd?' with-add':''}`} aria-label="Navigation principale"><div className="couple-navigation-pill">{tabs.slice(0,5).map(tab=>{const current=selected===tab.id;return <button type="button" key={tab.id} className={`couple-navigation-tab${current?' is-active':''}`} style={{'--tab-tone':`var(--${tab.tone})`,'--tab-ink':tab.ink?`var(--${tab.ink})`:'var(--heart)'} as CSSProperties} aria-label={tab.label} aria-current={current?'page':undefined} onClick={()=>{setLocal(tab.id);onChange?.(tab.id);}}><span className="couple-navigation-icon" key={current?'active':'inactive'} aria-hidden="true"><Icon name={tab.icon}/></span><span className="couple-navigation-label" aria-hidden="true"><span key={current?'letters':'hidden'}>{Array.from(tab.label).map((letter,i)=><span key={i} style={{'--letter-delay':`${Math.min(i,8)*30}ms`} as CSSProperties}>{letter===' '?'\u00a0':letter}</span>)}</span></span></button>;})}</div>{onAdd&&<button type="button" className="couple-navigation-add" aria-label="Ajouter" onClick={onAdd}><Icon name="plus"/></button>}</nav>;
}
