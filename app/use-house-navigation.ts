import {useCallback,useEffect,useRef,useState,type RefObject} from 'react';
export const housePages=['home','calendar','meals','expenses','chat','shopping','tasks','ideas','plants','family','calls','notifications','settings'] as const;
export type HousePage=typeof housePages[number];
const tabs:HousePage[]=['home','calendar','meals','expenses','chat'];
type Route={page:HousePage;depth:number;exit?:boolean};
const valid=(value:unknown):value is HousePage=>housePages.includes(value as HousePage);
function fromUrl():HousePage{const value=new URLSearchParams(location.search).get('view');return valid(value)?value:'home';}
function routeUrl(page:HousePage){const url=new URL(location.href);url.searchParams.set('view',page);return url;}
function readRoute(state:unknown):Route|undefined{const value=(state as {nousDeuxRoute?:Route}|null)?.nousDeuxRoute;return value&&valid(value.page)&&Number.isInteger(value.depth)?value:undefined;}
function write(route:Route,replace=false){history[replace?'replaceState':'pushState']({...history.state,nousDeuxRoute:route},'',routeUrl(route.page));}
/** One history entry per page; the exit guard is only for installed Android apps. */
export function useHouseNavigation(notify:(message:string)=>void){
 const[page,setPage]=useState<HousePage>(fromUrl),current=useRef(page),depth=useRef(0),direction=useRef(0),notice=useRef(notify),exitTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 notice.current=notify;
 const navigate=useCallback((next:HousePage)=>{if(!valid(next)||next===current.current)return;direction.current=Math.sign(tabs.indexOf(next)-tabs.indexOf(current.current));current.current=next;if(exitTimer.current)clearTimeout(exitTimer.current);const route=readRoute(history.state);if(route?.exit)write({...route,exit:false});depth.current++;write({page:next,depth:depth.current});setPage(next);},[]);
 useEffect(()=>{
  const guarded=/Android/i.test(navigator.userAgent)&&matchMedia('(display-mode: standalone)').matches;
  const saved=readRoute(history.state);let restoring=false;
  if(saved&&!saved.exit){current.current=saved.page;depth.current=saved.depth;setPage(saved.page);}
  else{write({page:current.current,depth:0,exit:guarded},true);if(guarded)write({page:current.current,depth:0});}
  const rearm=()=>{const route=readRoute(history.state);if(route?.exit&&document.visibilityState==='visible')write({...route,exit:false});};
  function pop(event:PopStateEvent){
   if(restoring){restoring=false;return;}
   // Native Back dismisses the top dialog first, preserving its underlying page.
   const dialog=[...document.querySelectorAll<HTMLDialogElement>('dialog[open]')].at(-1);
   if(dialog){restoring=true;history.forward();dialog.dispatchEvent(new Event('cancel',{cancelable:true}));return;}
   const route=readRoute(event.state);
   if(route?.exit&&guarded){
    // Stay on the base entry so the next *native* Back can leave normally.
    // Re-arm after the confirmation window instead of trapping Back in a push loop.
    if(exitTimer.current)clearTimeout(exitTimer.current);exitTimer.current=setTimeout(rearm,2200);notice.current('Appuyez encore sur Retour pour quitter.');return;
   }
   const next=route?.page||fromUrl();direction.current=-1;current.current=next;depth.current=route?.depth||0;setPage(next);
  }
  addEventListener('popstate',pop);document.addEventListener('visibilitychange',rearm);return()=>{removeEventListener('popstate',pop);document.removeEventListener('visibilitychange',rearm);if(exitTimer.current)clearTimeout(exitTimer.current);};
 },[]);
 const back=useCallback(()=>{if(depth.current>0){history.back();return;}current.current='home';direction.current=-1;write({page:'home',depth:0},true);setPage('home');},[]);
 return {page,navigate,direction,back};
}
/** Horizontal swipes belong to the page except on controls, recipe cards and carousels. */
export function usePageSwipe(ref:RefObject<HTMLElement|null>,page:HousePage,navigate:(page:HousePage)=>void){
 const blockClickUntil=useRef(0);
 useEffect(()=>{
  const element=ref.current;if(!element||!tabs.includes(page))return;const node:HTMLElement=element;
  let start:{x:number;y:number;dx:number;axis:''|'x'|'y';target:number}|null=null;
  const clear=()=>{start=null;node.style.removeProperty('translate');};
  function down(e:TouchEvent){
   clear();if(e.touches.length!==1||document.querySelector('dialog[open]')||window.getSelection()?.toString())return;
   const point=e.touches[0],target=e.target instanceof Element?e.target:null;
   if(point.clientX<24||point.clientX>innerWidth-24||!target||target.closest('button,a,input,textarea,select,[contenteditable],audio,video,[role="slider"],.swipe-card,.daily-call-stage,[data-no-page-swipe]'))return;
   for(let el:Element|null=target;el&&el!==node;el=el.parentElement){if(el.scrollWidth>el.clientWidth+2&&['auto','scroll'].includes(getComputedStyle(el).overflowX))return;}
   start={x:point.clientX,y:point.clientY,dx:0,axis:'',target:tabs.indexOf(page)};
  }
  function move(e:TouchEvent){
   if(!start)return;if(e.touches.length!==1){clear();return;}
   const dx=e.touches[0].clientX-start.x,dy=e.touches[0].clientY-start.y;
   if(!start.axis&&Math.max(Math.abs(dx),Math.abs(dy))>10)start.axis=Math.abs(dx)>Math.abs(dy)*1.4?'x':'y';
   if(start.axis!=='x')return;
   if(e.cancelable)e.preventDefault();start.dx=dx;start.target=tabs.indexOf(page)+(dx<0?1:-1);
   if(start.target<0||start.target>=tabs.length)return;
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches)node.style.translate=`${Math.max(-90,Math.min(90,dx*.35))}px 0`;
  }
  function up(e:TouchEvent){const gesture=start;clear();if(!gesture||gesture.axis!=='x')return;if(e.cancelable)e.preventDefault();blockClickUntil.current=Date.now()+400;
   if(Math.abs(gesture.dx)>=Math.min(100,Math.max(60,innerWidth*.2))&&tabs[gesture.target])navigate(tabs[gesture.target]);
  }
  function click(e:MouseEvent){if(Date.now()<blockClickUntil.current){e.preventDefault();e.stopPropagation();}}
  node.addEventListener('touchstart',down,{passive:true});node.addEventListener('touchmove',move,{passive:false});node.addEventListener('touchend',up);node.addEventListener('touchcancel',clear);node.addEventListener('click',click,true);
  return()=>{clear();node.removeEventListener('touchstart',down);node.removeEventListener('touchmove',move);node.removeEventListener('touchend',up);node.removeEventListener('touchcancel',clear);node.removeEventListener('click',click,true);};
 },[ref,page,navigate]);
}
