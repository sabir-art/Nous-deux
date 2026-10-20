// « Nos émojis » : petits dessins des mascottes de Nous deux, insérés dans un message par un
// code court (:nd-chat:) que house-api valide. Ils restent dans la ligne de texte, comme un émoji,
// et se distinguent des stickers (grands, envoyés seuls). Couleurs : tokens pastel du design system.
import type {ReactNode} from 'react';
import {findNdEmoji,splitNdEmoji} from '../lib/nd-emojis';

const Eyes=({y=14,x1=12.5,x2=19.5,r=2.6,look=0}:{y?:number;x1?:number;x2?:number;r?:number;look?:number})=><>{[x1,x2].map(x=><g key={x}><circle className="ne-eye" cx={x} cy={y} r={r}/><circle className="ne-pupil" cx={x+look} cy={y+.4} r={r*.58}/></g>)}</>;
const Smile=({x=16,y=19,w=4}:{x?:number;y?:number;w?:number})=><path className="ne-line" d={`M${x-w/2} ${y}q${w/2} ${w*.6} ${w} 0`}/>;
const heart=(x:number,y:number,s:number)=>`M${x} ${y+s*.9}C${x-s*1.5} ${y} ${x-s*.8} ${y-s} ${x} ${y-s*.3}C${x+s*.8} ${y-s} ${x+s*1.5} ${y} ${x} ${y+s*.9}z`;

const drawings:Record<string,ReactNode>={
 'nd-lavande':<><rect className="f-lavande ne-out" x="8" y="3.5" width="16" height="25" rx="8"/><Eyes y={13}/><Smile y={19}/></>,
 'nd-peche':<><path className="f-peche ne-out" d="M16 4.5c2.6 0 4 2 4.6 3.4 1.5-.5 4-.6 5.2 1.6 1.2 2.2-.2 4.3-1.2 5.3 1 1 2.4 3.1 1.2 5.3-1.2 2.2-3.7 2.1-5.2 1.6-.6 1.4-2 3.4-4.6 3.4s-4-2-4.6-3.4c-1.5.5-4 .6-5.2-1.6-1.2-2.2.2-4.3 1.2-5.3-1-1-2.4-3.1-1.2-5.3 1.2-2.2 3.7-2.1 5.2-1.6.6-1.4 2-3.4 4.6-3.4z"/><Eyes y={14.5} r={2.4}/><Smile y={19}/></>,
 'nd-nous':<><rect className="f-lavande ne-out" x="2.5" y="9" width="12" height="19" rx="6"/><circle className="f-peche ne-out" cx="22.5" cy="20" r="7.5"/><Eyes y={16} x1={6.4} x2={10.8} r={1.9}/><Eyes y={19.5} x1={20.3} x2={24.7} r={1.9}/><path className="f-heart ne-out" d={heart(16,5.5,3.2)}/></>,
 'nd-bisou':<><rect className="f-lavande ne-out" x="8" y="3.5" width="16" height="25" rx="8"/><path className="ne-line" d="M10.5 13.5q2-2 4 0M17.5 13.5q2-2 4 0"/><path className="ne-line" d="M15 18.5q2.2-.8 1.2 1.2q1.6.8-.6 1.6"/><path className="f-heart ne-out" d={heart(25.5,7,3)}/></>,
 'nd-coeur':<><path className="f-rose ne-out" d={heart(16,13,11)}/><Eyes y={14} x1={12.5} x2={19.5} r={2.3}/><Smile y={18.6} w={3.6}/></>,
 'nd-chat':<><path className="f-beurre ne-out" d="M6.5 13 6 4.5l6.2 4.4q3.8-1.2 7.6 0L26 4.5l-.5 8.5q2 2.6 2 6c0 5.5-5.2 8.5-11.5 8.5S4.5 24.5 4.5 19q0-3.4 2-6z"/><Eyes y={16.5} x1={11.5} x2={20.5} r={2.4}/><path className="ne-pupil" d="M14.8 20.5h2.4l-1.2 1.3z"/><path className="ne-line ne-thin" d="M3 19.5l5 .6M3.5 23l4.7-1.3M29 19.5l-5 .6M28.5 23l-4.7-1.3"/></>,
 'nd-chien':<><ellipse className="f-peche ne-out" cx="16" cy="17.5" rx="10" ry="10"/><path className="f-beurre ne-out" d="M7.5 9.5C4 8.5 2.5 12 3.2 17c.4 2.6 3 2.8 4.3.8M24.5 9.5c3.5-1 5 2.5 4.3 7.5-.4 2.6-3 2.8-4.3.8"/><Eyes y={15.5} r={2.3}/><ellipse className="ne-pupil" cx="16" cy="20.3" rx="2.2" ry="1.5"/><path className="ne-line" d="M16 21.8v1.6m-2.2.2q2.2 1.6 4.4 0"/></>,
 'nd-plante':<><path className="f-leaf ne-out" d="M16 14C15 9 11 5.5 6 6c-.2 4.6 3.5 8 10 8zM16 14c1-5 5-8.5 10-8-.2 4.6-3.5 8-10 8z"/><path className="f-peche ne-out" d="M7 14h18l-2.2 13.5H9.2z"/><Eyes y={19.5} r={2.1}/><Smile y={23.4} w={3}/></>,
 'nd-cactus':<><path className="f-menthe ne-out" d="M12 22V9.5a4 4 0 0 1 8 0V22zM12 16H9a2.5 2.5 0 0 1-2.5-2.5V11a1.6 1.6 0 0 1 3.2 0v2H12M20 14.5h2.3V10a1.6 1.6 0 0 1 3.2 0v2.5a4 4 0 0 1-4 4H20"/><path className="f-peche ne-out" d="M9 21.5h14l-1.8 6.5H10.8z"/><Eyes y={12.5} x1={14.2} x2={17.8} r={1.7}/><Smile y={16.2} w={2.6}/></>,
 'nd-courses':<><path className="f-leaf ne-out" d="M16 9c-1-3-3.5-4.8-6-4.5.2 2.6 2.4 4.6 6 4.5zM16 9c.8-3 3-4.8 5.6-4.6-.2 2.6-2.2 4.6-5.6 4.6z"/><rect className="f-beurre ne-out" x="5" y="9" width="22" height="19" rx="7"/><Eyes y={16.5} r={2.6} look={0}/><path className="ne-line" d="M14 22.2q2 1.6 4 0"/></>,
 'nd-maison':<><path className="f-lilas ne-out" d="M5.5 14 16 5l10.5 9v13.5h-21z"/><path className="f-eye ne-out" d="M13.5 27.5v-6a2.5 2.5 0 0 1 5 0v6"/><Eyes y={15.5} r={2.2}/><path className="f-heart" d={heart(16,10.3,1.6)}/></>,
 'nd-cafe':<><path className="ne-line ne-steam" d="M12.5 8.5c-1.5-1.6 1.4-2.6 0-4.4M18 8.5c-1.5-1.6 1.4-2.6 0-4.4"/><path className="f-eye ne-out" d="M6 11h17v8a7 7 0 0 1-7 7h-3a7 7 0 0 1-7-7z"/><path className="ne-out" fill="none" d="M23 13.5h1.8a3.2 3.2 0 0 1 0 6.4H22.6"/><Eyes y={16.5} x1={11.8} x2={17.2} r={2}/><path className="ne-line" d="M13.2 21q1.3 1.1 2.6 0"/></>,
 'nd-soleil':<><path className="ne-line ne-ray" d="M16 2.5v3.5M16 26v3.5M2.5 16H6M26 16h3.5M6.5 6.5l2.4 2.4M23.1 23.1l2.4 2.4M6.5 25.5l2.4-2.4M23.1 8.9l2.4-2.4"/><circle className="f-beurre ne-out" cx="16" cy="16" r="8.5"/><Eyes y={15} x1={13} x2={19} r={1.9}/><Smile y={18.8} w={3.4}/></>,
 'nd-lune':<><path className="f-beurre ne-out" d="M20.5 4.5A11.5 11.5 0 1 0 27.5 22 9.5 9.5 0 0 1 20.5 4.5z"/><path className="ne-line" d="M10 16.5q1.6 1.4 3.2 0"/><path className="ne-line" d="M12 21.4q1.4 1 2.8 0"/><path className="f-citron ne-out ne-thin" d="M25 7.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/></>,
 'nd-etoile':<><path className="f-citron ne-out" d="M16 3.5c1 6.5 3.3 9 12.5 12.5-9.2 3.5-11.5 6-12.5 12.5-1-6.5-3.3-9-12.5-12.5C12.7 12.5 15 10 16 3.5z"/><Eyes y={15.5} x1={13.6} x2={18.4} r={1.6}/></>,
 'nd-cadeau':<><rect className="f-rose ne-out" x="5" y="12" width="22" height="16" rx="3.5"/><rect className="f-lavande ne-out" x="3.5" y="8.5" width="25" height="5.5" rx="2.5"/><path className="f-lavande ne-out" d="M14 8.5h4V28h-4z"/><path className="ne-out" fill="none" d="M16 8.5c-2-4-6.5-4.5-6.5-2.3S13 8.5 16 8.5zm0 0c2-4 6.5-4.5 6.5-2.3S19 8.5 16 8.5z"/><Eyes y={20} x1={9.5} x2={22.5} r={1.8}/></>,
};

/** Un émoji Nous deux, dans la ligne de texte. */
export function NdEmojiIcon({id,label}:{id:string;label?:string}){
 const e=findNdEmoji(id);if(!e)return null;
 // An empty label marks a decorative copy (inside a button that already names it).
 return <span className="nd-emoji" {...(label===''?{'aria-hidden':true}:{role:'img','aria-label':label??e.label})}><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">{drawings[id]}</svg></span>;
}

/** Texte d’un message avec nos émojis dessinés ; un message fait seulement de 1 à 3 émojis s’affiche en grand. */
export function RichText({text}:{text:string}){
 const parts=splitNdEmoji(text);
 if(!parts.some(p=>typeof p!=='string'))return <>{text}</>;
 return <>{parts.map((p,i)=>typeof p==='string'?p:<NdEmojiIcon key={i} id={p.id}/>)}</>;
}
export const ndEmojiOnly=(text:string)=>{const parts=splitNdEmoji(text).filter(p=>typeof p!=='string'||p.trim());return parts.length>0&&parts.length<=3&&parts.every(p=>typeof p!=='string');};
