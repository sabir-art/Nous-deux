import {useEffect,useRef,useState} from 'react';
// Local synthesized sound only; browser gesture/autoplay rules still apply.
export function useCallRingtone(ringing:boolean){
 const ctx=useRef<AudioContext|null>(null),[unlocked,setUnlocked]=useState(false);
 async function unlock(){try{ctx.current??=new AudioContext();await ctx.current.resume();setUnlocked(ctx.current.state==='running');}catch{setUnlocked(false);}}
 useEffect(()=>{const gesture=()=>{void unlock();};document.addEventListener('pointerdown',gesture,{once:true});return()=>{document.removeEventListener('pointerdown',gesture);void ctx.current?.close().catch(()=>{});ctx.current=null;};},[]);
 useEffect(()=>{if(!ringing||!unlocked)return;const sound=()=>{const ac=ctx.current;if(!ac||ac.state!=='running')return;for(const delay of [0,.26]){const oscillator=ac.createOscillator(),gain=ac.createGain();oscillator.frequency.value=660;oscillator.type='sine';gain.gain.setValueAtTime(0,ac.currentTime+delay);gain.gain.linearRampToValueAtTime(.08,ac.currentTime+delay+.03);gain.gain.linearRampToValueAtTime(0,ac.currentTime+delay+.2);oscillator.connect(gain);gain.connect(ac.destination);oscillator.start(ac.currentTime+delay);oscillator.stop(ac.currentTime+delay+.21);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};}};sound();const timer=setInterval(sound,2300);return()=>clearInterval(timer);},[ringing,unlocked]);
 return {soundReady:unlocked,unlock};
}
