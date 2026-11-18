import {useEffect,useState,type CSSProperties} from 'react';
// Confettis décoratifs : une seule pluie courte (moins de 6 s), sans bouton ; coupés si les animations sont réduites.
export default function InvitationCelebration(){
 const[hidden,setHidden]=useState(false);
 useEffect(()=>{const update=()=>setHidden(document.visibilityState!=='visible');update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
 return <div className={`invitation-confetti ${hidden?'paused':''}`} aria-hidden="true">{Array.from({length:16},(_,i)=><i key={i} className={i%3===0?'confetti-heart':'confetti-note'} style={{'--confetti-x':`${(i*29+7)%100}%`,'--confetti-delay':`${((i*7)%16)*.12}s`,'--confetti-time':`${3.2+(i%4)*.5}s`,'--confetti-color':`var(--${['rose','beurre','lavande','menthe'][i%4]})`,'--confetti-turn':`${i%2?190:-160}deg`} as CSSProperties}>{i%3===0?'♥':''}</i>)}</div>;
}
