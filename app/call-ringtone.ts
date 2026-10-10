import {useCallback,useEffect,useRef,useState} from 'react';
// Foreground ringtone only. iOS still owns notification sound while the PWA sleeps.
export function useCallRingtone(ringing:boolean){
 const ctx=useRef<AudioContext|null>(null),mounted=useRef(true),[unlocked,setUnlocked]=useState(false);
 const unlock=useCallback(async()=>{
  try{
   if(!ctx.current||ctx.current.state==='closed'){
    const ac=new AudioContext();ctx.current=ac;
    ac.onstatechange=()=>{if(mounted.current&&ctx.current===ac)setUnlocked(ac.state==='running');};
   }
   const ac=ctx.current;
   if(ac.state!=='running')await ac.resume();
   if(mounted.current&&ctx.current===ac)setUnlocked(ac.state==='running');
  }catch{if(mounted.current)setUnlocked(false);}
 },[]);
 useEffect(()=>{
  mounted.current=true;
  const gesture=()=>{void unlock();};
  const visible=()=>{if(document.visibilityState==='visible'&&ctx.current)void unlock();};
  // Keep listening: iOS can interrupt the context after the first gesture.
  for(const name of ['pointerdown','touchend','keydown'])document.addEventListener(name,gesture,{passive:true});
  document.addEventListener('visibilitychange',visible);window.addEventListener('pageshow',visible);
  return()=>{mounted.current=false;for(const name of ['pointerdown','touchend','keydown'])document.removeEventListener(name,gesture);document.removeEventListener('visibilitychange',visible);window.removeEventListener('pageshow',visible);const ac=ctx.current;ctx.current=null;if(ac){ac.onstatechange=null;void ac.close().catch(()=>{});}};
 },[unlock]);
 useEffect(()=>{if(ringing)void unlock();},[ringing,unlock]);
 useEffect(()=>{
  if(!ringing||!unlocked)return;
  const playing=new Set<OscillatorNode>();
  const sound=()=>{
   const ac=ctx.current;if(!ac||ac.state!=='running')return;
   for(const delay of [0,.26]){
    const oscillator=ac.createOscillator(),gain=ac.createGain();playing.add(oscillator);
    oscillator.frequency.value=660;oscillator.type='sine';gain.gain.setValueAtTime(0,ac.currentTime+delay);gain.gain.linearRampToValueAtTime(.08,ac.currentTime+delay+.03);gain.gain.linearRampToValueAtTime(0,ac.currentTime+delay+.2);oscillator.connect(gain);gain.connect(ac.destination);oscillator.start(ac.currentTime+delay);oscillator.stop(ac.currentTime+delay+.21);
    oscillator.onended=()=>{playing.delete(oscillator);oscillator.disconnect();gain.disconnect();};
   }
  };
  sound();const timer=setInterval(sound,2300);
  return()=>{clearInterval(timer);for(const oscillator of playing){try{oscillator.stop();}catch{}oscillator.disconnect();}playing.clear();};
 },[ringing,unlocked]);
 return {soundReady:unlocked,unlock};
}
