import {useEffect,useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {Heart,X} from './icons';
import {swipeAxis,swipeChoice} from '../lib/swipe';
export default function MealSwipeCard({children,onVote,recipeId,title}:{children:ReactNode;onVote:(like:boolean)=>void;recipeId?:string;title?:string}){
 const card=useRef<HTMLElement>(null),frame=useRef(0),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const gesture=useRef<{x:number;y:number;at:number;axis:'pending'|'x'|'y';scroll:HTMLElement|null;top:number}|null>(null),locked=useRef(false),room=useRef(0);
 const[leaving,setLeaving]=useState(false);
 // Keep the same controls mounted so keyboard focus survives the next card.
 useLayoutEffect(()=>{locked.current=false;gesture.current=null;setLeaving(false);if(card.current){card.current.style.transition='none';card.current.style.transform='translate3d(0,0,0)';card.current.style.opacity='1';card.current.dataset.choice='';}},[recipeId]);
 useEffect(()=>()=>{cancelAnimationFrame(frame.current);clearTimeout(timer.current);},[]);
 // While the finger moves, the card shrinks a little, leans and slides only within the free space around it,
 // so it stays whole on screen (no edge cuts it). The decision still follows the finger's real distance.
 function measureRoom(el:HTMLElement){const box=el.getBoundingClientRect();let left=0,right=document.documentElement.clientWidth;for(let p=el.parentElement;p;p=p.parentElement){if(getComputedStyle(p).overflowX!=='visible'){const r=p.getBoundingClientRect();left=Math.max(left,r.left);right=Math.min(right,r.right);}}room.current=Math.max(0,Math.min(box.left-left,right-box.right));}
 function paint(dx:number,instant=false){cancelAnimationFrame(frame.current);frame.current=requestAnimationFrame(()=>{const el=card.current;if(!el)return;el.style.transition=instant?'none':'';el.dataset.choice=dx>25?'yes':dx<-25?'no':'';if(!dx){el.style.transform='translate3d(0,0,0)';return;}
  const scale=.93,w=el.offsetWidth,h=el.offsetHeight,free=Math.max(0,room.current+w*(1-scale)/2-6);
  const lean=Math.min(4*Math.PI/180,Math.asin(Math.min(1,free*.4/(h*scale/2)))),slide=Math.min(140,Math.max(0,free-(h*scale/2)*Math.sin(lean))),k=Math.tanh(dx/140);
  el.style.transform=`translate3d(${(slide*k).toFixed(1)}px,0,0) rotate(${(lean*k*180/Math.PI).toFixed(2)}deg) scale(${scale})`;});}
 function vote(like:boolean){
  if(locked.current)return;locked.current=true;setLeaving(true);gesture.current=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(card.current){card.current.style.transition=reduced?'none':'transform 150ms ease-out, opacity 150ms ease-out';card.current.style.transform=`translate3d(${(like?1:-1)*(card.current.clientWidth+40)}px,0,0) rotate(${like?12:-12}deg)`;card.current.style.opacity='0';}
  cancelAnimationFrame(frame.current);timer.current=setTimeout(()=>onVote(like),reduced?0:150);
 }
 return <><article ref={card} className="swipe-card" tabIndex={0} aria-label={`${title||'Choisir ce plat'}. Flèche gauche pour passer, flèche droite pour aimer.`} aria-keyshortcuts="ArrowLeft ArrowRight" onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();vote(e.key==='ArrowRight');}}}
 onPointerDown={e=>{if(locked.current||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0)||(e.target as HTMLElement).closest('button,a'))return;const scroll=e.currentTarget.closest<HTMLElement>('.workspace');measureRoom(e.currentTarget);gesture.current={x:e.clientX,y:e.clientY,at:performance.now(),axis:'pending',scroll,top:scroll?.scrollTop||0};e.currentTarget.setPointerCapture(e.pointerId);}}
 onPointerMove={e=>{const g=gesture.current;if(!g)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;g.axis=swipeAxis(dx,dy,g.axis);if(g.axis==='x'){if(e.cancelable)e.preventDefault();paint(dx,true);}else if(g.axis==='y'&&g.scroll)g.scroll.scrollTop=g.top-dy;}}
 onPointerCancel={()=>{gesture.current=null;paint(0);}}
 onPointerUp={e=>{const g=gesture.current;if(!g)return;gesture.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);const choice=swipeChoice(e.clientX-g.x,e.clientY-g.y,performance.now()-g.at,e.currentTarget.clientWidth,g.axis);if(choice!==null)vote(choice);else paint(0);}}>
 {children}<strong className="swipe-stamp stamp-yes" aria-hidden="true">Miam !</strong><strong className="swipe-stamp stamp-no" aria-hidden="true">Une autre !</strong></article>
 <div className="swipe-controls nd-swipe"><button className="swipe-pass nd-swipe-btn nd-swipe-no" aria-label="Une autre envie" disabled={leaving} onClick={()=>vote(false)}><X size={24} aria-hidden="true"/><span className="sr-only">Une autre envie</span></button><button className="swipe-like nd-swipe-btn nd-swipe-yes" aria-label="Oh oui, miam !" disabled={leaving} onClick={()=>vote(true)}><Heart size={24} aria-hidden="true"/><span className="sr-only">Oh oui, miam !</span></button></div></>;
}
