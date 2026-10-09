import {useEffect,type RefObject} from 'react';
let openDialogs=0;
/** Lock the actual page scroller, including iOS scroll chaining behind a modal. */
export function useDialog(ref:RefObject<HTMLDialogElement|null>){
 useEffect(()=>{
  const dialog=ref.current,previous=document.activeElement as HTMLElement|null;
  const viewport=()=>{document.documentElement.style.setProperty('--dialog-viewport',`${window.visualViewport?.height||window.innerHeight}px`);document.documentElement.style.setProperty('--dialog-top',`${window.visualViewport?.offsetTop||0}px`);};
  viewport();window.visualViewport?.addEventListener('resize',viewport);window.visualViewport?.addEventListener('scroll',viewport);
  openDialogs++;document.documentElement.dataset.modalOpen='true';dialog?.showModal();
  return()=>{window.visualViewport?.removeEventListener('resize',viewport);window.visualViewport?.removeEventListener('scroll',viewport);dialog?.close();if(--openDialogs===0){delete document.documentElement.dataset.modalOpen;document.documentElement.style.removeProperty('--dialog-viewport');document.documentElement.style.removeProperty('--dialog-top');}previous?.focus({preventScroll:true});};
 },[ref]);
}
