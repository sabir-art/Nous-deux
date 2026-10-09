import {useEffect,useState,type CSSProperties} from 'react';
import {Pause,Play} from './icons';
export default function InvitationCelebration(){
 const[paused,setPaused]=useState(false),[hidden,setHidden]=useState(false);
 useEffect(()=>{const update=()=>setHidden(document.visibilityState!=='visible');update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
 return <><div className={`invitation-confetti ${paused||hidden?'paused':''}`} aria-hidden="true">{Array.from({length:16},(_,i)=><i key={i} className={i%3===0?'confetti-heart':'confetti-note'} style={{'--confetti-x':`${(i*29+7)%100}%`,'--confetti-delay':`${-(i*.71)}s`,'--confetti-time':`${7+i%5}s`,'--confetti-color':`var(--${['rose','beurre','lavande','menthe'][i%4]})`,'--confetti-turn':`${i%2?190:-160}deg`} as CSSProperties}>{i%3===0?'♥':''}</i>)}</div><button type="button" className="celebration-toggle secondary" aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused?<Play size={14}/>:<Pause size={14}/>} {paused?'Relancer les confettis':'Pause des confettis'}</button></>;
}
