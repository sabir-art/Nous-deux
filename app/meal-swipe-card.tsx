import {useEffect,useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {Heart,X} from 'lucide-react';
import {swipeAxis,swipeChoice} from '../lib/swipe';
export default function MealSwipeCard({children,onVote,recipeId,title}:{children:ReactNode;onVote:(like:boolean)=>void;recipeId?:string;title?:string}){
 const card=useRef<HTMLElement>(null),frame=useRef(0),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const gesture=useRef<{x:number;y:number;at:number;axis:'pending'|'x'|'y'}|null>(null),locked=useRef(false);
 const[leaving,setLeaving]=useState(false);
 // Keep the same controls mounted so keyboard focus survives the next card.
 useLayoutEffect(()=>{locked.current=false;gesture.current=null;setLeaving(false);if(card.current){card.current.style.transition='none';card.current.style.transform='translate3d(0,0,0)';card.current.style.opacity='1';card.current.dataset.choice='';}},[recipeId]);
 useEffect(()=>()=>{cancelAnimationFrame(frame.current);clearTimeout(timer.current);},[]);
 function paint(dx:number,instant=false){cancelAnimationFrame(frame.current);frame.current=requestAnimationFrame(()=>{const el=card.current;if(!el)return;el.style.transition=instant?'none':'';el.style.transform=`translate3d(${dx}px,0,0) rotate(${Math.max(-12,Math.min(12,dx/22))}deg)`;el.dataset.choice=dx>25?'yes':dx<-25?'no':'';});}
 function vote(like:boolean){
  if(locked.current)return;locked.current=true;setLeaving(true);gesture.current=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(card.current){card.current.style.transition=reduced?'none':'transform 150ms ease-out, opacity 150ms ease-out';card.current.style.transform=`translate3d(${(like?1:-1)*(card.current.clientWidth+40)}px,0,0) rotate(${like?12:-12}deg)`;card.current.style.opacity='0';}
  cancelAnimationFrame(frame.current);timer.current=setTimeout(()=>onVote(like),reduced?0:150);
 }
 return <><article ref={card} className="swipe-card" tabIndex={0} aria-label={`${title||'Choisir ce plat'}. Flèche gauche pour passer, flèche droite pour aimer.`} aria-keyshortcuts="ArrowLeft ArrowRight" onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();vote(e.key==='ArrowRight');}}}
 onPointerDown={e=>{if(locked.current||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0)||(e.target as HTMLElement).closest('button,a'))return;gesture.current={x:e.clientX,y:e.clientY,at:performance.now(),axis:'pending'};e.currentTarget.setPointerCapture(e.pointerId);}}
 onPointerMove={e=>{const g=gesture.current;if(!g)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;g.axis=swipeAxis(dx,dy,g.axis);if(g.axis==='x')paint(dx,true);}}
 onPointerCancel={()=>{gesture.current=null;paint(0);}}
 onPointerUp={e=>{const g=gesture.current;if(!g)return;gesture.current=null;const choice=swipeChoice(e.clientX-g.x,e.clientY-g.y,performance.now()-g.at,e.currentTarget.clientWidth,g.axis);if(choice!==null)vote(choice);else paint(0);}}>
 {children}<strong className="swipe-stamp stamp-yes" aria-hidden="true">MIAM !</strong><strong className="swipe-stamp stamp-no" aria-hidden="true">UNE AUTRE !</strong></article>
 <div className="swipe-controls"><button className="swipe-pass" disabled={leaving} onClick={()=>vote(false)}><X size={24} aria-hidden="true"/>Une autre envie</button><button className="swipe-like" disabled={leaving} onClick={()=>vote(true)}><Heart size={24} aria-hidden="true"/>Oh oui, miam !</button></div></>;
}
