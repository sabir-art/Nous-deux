import {useState,type PointerEvent} from 'react';
import type {PetMood,PetTone} from '../lib/pets';
// Dog and cat mascots drawn in the PlantBuddy style: flat pastel shapes, big eyes, no outline.
// The eyes look around twice then stop (under 5 s), follow the finger or the mouse, and restart on a tap.
const heart=(x:number,y:number,r:number)=>`M${x} ${y+r*.9}C${x-r*1.6} ${y-r*.2} ${x-r*.8} ${y-r*1.4} ${x} ${y-r*.5}C${x+r*.8} ${y-r*1.4} ${x+r*1.6} ${y-r*.2} ${x} ${y+r*.9}Z`;
export default function PetBuddy({kind,tone='beurre',mood='happy',name='',size=116,onPoke}:{kind:'dog'|'cat';tone?:PetTone;mood?:PetMood;name?:string;size?:number;onPoke?:()=>void}){
 const[pokes,setPokes]=useState(0),[look,setLook]=useState<[number,number]|null>(null);
 const eyeY=56,xs=[44,76];
 const rest:[number,number]=mood==='want'?[0,-3]:mood==='sad'?[0,3]:[0,0];
 const[lx,ly]=look||rest;
 function follow(e:PointerEvent<SVGSVGElement>){const r=e.currentTarget.getBoundingClientRect();const dx=(e.clientX-r.left)/r.width*120-60,dy=(e.clientY-r.top)/r.height*130-eyeY,d=Math.hypot(dx,dy)||1,k=Math.min(3.5,d/8)/d;setLook([dx*k,dy*k]);}
 const eyes=xs.map((x,i)=>mood==='love'?<path key={i} className="heart-eye" d={heart(x,eyeY,6.5)}/>:<g key={i}><circle className="eye" cx={x} cy={eyeY} r={10.5}/><g className={look?'pet-pupil':'pet-pupil pet-look'} style={{transform:`translate(${lx}px,${ly}px)`}}><circle className="pupil" cx={x} cy={eyeY} r={6.2}/><circle className="glint" cx={x-2} cy={eyeY-2.4} r={2}/></g></g>);
 const brows=mood==='sad'?<path className="pet-line" d="M34 41l9 4M86 41l-9 4"/>:mood==='want'?<path className="pet-line" d="M35 41q8-5 16 0M69 41q8-5 16 0"/>:null;
 const cheeks=mood==='happy'||mood==='love'?<><circle className="cheek" cx={30} cy={70} r={6}/><circle className="cheek" cx={90} cy={70} r={6}/></>:null;
 const t=`f-${tone}`;
 const art=kind==='cat'?<>
  <path className={`pet-tail ${t}`} d="M86 112c22 2 28-18 18-30"/>
  <ellipse className={t} cx={60} cy={106} rx={30} ry={21}/>
  <ellipse className="pet-paw" cx={47} cy={124} rx={9} ry={5.5}/><ellipse className="pet-paw" cx={73} cy={124} rx={9} ry={5.5}/>
  <path className={`pet-ear ${t}`} d="M27 46 31 12 55 31Z"/><path className={`pet-ear ${t}`} d="M93 46 89 12 65 31Z"/>
  <path className="pet-inner-ear" d="M33 36 34 21 45 30Z"/><path className="pet-inner-ear" d="M87 36 86 21 75 30Z"/>
  <ellipse className={t} cx={60} cy={60} rx={40} ry={33}/>
  <path className="pet-stripe" d="M54 28q6 5 12 0M56 35q4 3 8 0"/>
  <path className="pet-whisker" d="M30 70 10 66M30 75 11 78M90 70l20-4M90 75l19 3"/>
  {eyes}{brows}{cheeks}
  <path className="pet-nose" d="M55 69h10l-5 5z"/>
  <path className="pet-line" d={mood==='sad'?'M52 82q8-6 16 0':'M52 77q4 5 8 0q4 5 8 0'}/>
 </>:<>
  <path className={`pet-tail ${t}`} d="M88 104q20-6 20-26"/>
  <ellipse className={t} cx={60} cy={106} rx={30} ry={21}/>
  <ellipse className="pet-paw" cx={47} cy={124} rx={9} ry={5.5}/><ellipse className="pet-paw" cx={73} cy={124} rx={9} ry={5.5}/>
  <ellipse className={t} cx={60} cy={60} rx={38} ry={34}/>
  <ellipse className="pet-patch" cx={78} cy={52} rx={13} ry={15}/>
  <g className={mood==='sad'?'pet-ears droop':'pet-ears'}><ellipse className={`pet-ear-dog ${t}`} cx={23} cy={52} rx={12} ry={24} transform="rotate(18 23 52)"/><ellipse className="pet-shade" cx={23} cy={52} rx={12} ry={24} transform="rotate(18 23 52)"/><ellipse className={`pet-ear-dog ${t}`} cx={97} cy={52} rx={12} ry={24} transform="rotate(-18 97 52)"/><ellipse className="pet-shade" cx={97} cy={52} rx={12} ry={24} transform="rotate(-18 97 52)"/></g>
  {eyes}{brows}{cheeks}
  <ellipse className="pet-snout" cx={60} cy={76} rx={17} ry={12}/>
  <ellipse className="pet-nose" cx={60} cy={70} rx={6.5} ry={4.5}/>
  <path className="pet-line" d={mood==='sad'?'M53 84q7-5 14 0':'M60 74v4M52 79q4 4 8 0q4 4 8 0'}/>
  {(mood==='happy'||mood==='love')&&<path className="pet-tongue" d="M56 82h8v5a4 4 0 0 1-8 0z"/>}
 </>;
 const label=`${name||(kind==='cat'?'Le chat':'Le chien')}, ${mood==='love'?'ravi':mood==='happy'?'en pleine forme':mood==='ok'?'attend son soin du jour':mood==='want'?'réclame un soin':'se sent oublié'}`;
 return <button type="button" className="nd-plantb-hit pet-hit" aria-label={`Faire coucou à ${label}`} onClick={()=>{setPokes(n=>n+1);setLook(null);onPoke?.();}}>
  <svg key={pokes} className={`pet-buddy pet-${kind} mood-${mood}${pokes?' poked':''}`} viewBox="0 0 120 130" width={size} height={size*130/120} aria-hidden="true" onPointerMove={follow} onPointerLeave={()=>setLook(null)}>
   <ellipse className="pet-shadow" cx={60} cy={128} rx={34} ry={3}/>
   <g className="pet-body">{art}</g>
   {mood==='love'&&<g className="pl-hearts"><path d={heart(98,18,6)}/><path style={{animationDelay:'.3s'}} d={heart(22,24,5)}/></g>}
   {mood==='sad'&&<path className="pet-tear" d="M40 66c2 3 3 5 3 6.5a3 3 0 0 1-6 0c0-1.5 1-3.5 3-6.5z"/>}
  </svg>
 </button>;
}
