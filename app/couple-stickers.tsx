// Stickers exclusifs à Nous deux : les deux mascottes du couple (pilule lavande
// pour le premier compte, fleur pêche pour le second, comme MatchSticker), dessinées
// avec les formes et couleurs buddy-* du design system, sans modifier ses sources.
import type {ReactNode} from 'react';
type Mood='happy'|'love'|'wow'|'sleepy'|'wink'|'kiss'|'sad'|'pout';
type Look='left'|'right'|'up'|'down';
type Deco='heart'|'hearts'|'kiss'|'zzz'|'moon'|'sparkles'|'coffee'|'plate'|'basket'|'drops'|'confetti'|'rain'|'plane'|'sun'|'popcorn'|'dash'|'miss'|'cloud'|'stars'|'gift';
type Tone='citron'|'rose'|'beurre'|'menthe'|'lilas'|'lavande'|'peche';
export type CoupleStickerDef={id:string;word:string;alt:string;tone:Tone;a:Mood;b:Mood;lookA?:Look;lookB?:Look;gap?:'close'|'hug'|'apart';deco:Deco[];tilt:number};
/** Les identifiants doivent rester alignés avec supabase/functions/house-api/chat-cards.ts. */
export const coupleStickers:CoupleStickerDef[]=[
 {id:'bisou',word:'bisou !',alt:'Nos deux mascottes se font un bisou',tone:'rose',a:'kiss',b:'love',gap:'close',deco:['kiss'],tilt:-4},
 {id:'calin',word:'câlin',alt:'Nos deux mascottes se serrent fort',tone:'peche',a:'happy',b:'happy',gap:'hug',deco:['heart'],tilt:3},
 {id:'je-t-aime',word:'je t’aime',alt:'Nos deux mascottes ont des cœurs dans les yeux',tone:'rose',a:'love',b:'love',deco:['heart','hearts'],tilt:-3},
 {id:'coucou',word:'coucou !',alt:'Nos deux mascottes disent coucou',tone:'citron',a:'wow',b:'happy',deco:['sparkles'],tilt:4},
 {id:'bonne-nuit',word:'bonne nuit',alt:'Nos deux mascottes s’endorment sous la lune',tone:'lavande',a:'sleepy',b:'sleepy',gap:'close',deco:['moon','zzz'],tilt:-2},
 {id:'cafe',word:'café ?',alt:'Nos deux mascottes partagent un café',tone:'beurre',a:'happy',b:'wow',deco:['coffee'],tilt:3},
 {id:'a-table',word:'à table !',alt:'Nos deux mascottes devant une assiette fumante',tone:'rose',a:'love',b:'happy',deco:['plate'],tilt:-4},
 {id:'courses',word:'courses ?',alt:'Nos deux mascottes avec un panier de courses',tone:'menthe',a:'wow',b:'happy',deco:['basket'],tilt:2},
 {id:'arrosage',word:'on arrose ?',alt:'Nos deux mascottes arrosent une petite pousse',tone:'menthe',a:'happy',b:'wow',lookA:'down',lookB:'down',deco:['drops'],tilt:-3},
 {id:'merci',word:'merci !',alt:'Nos deux mascottes rayonnent de gratitude',tone:'beurre',a:'happy',b:'love',deco:['sparkles','heart'],tilt:4},
 {id:'bravo',word:'bravo !',alt:'Nos deux mascottes célèbrent sous les confettis',tone:'citron',a:'wow',b:'happy',deco:['confetti','stars'],tilt:-4},
 {id:'pardon',word:'pardon…',alt:'Une mascotte s’excuse en offrant un petit cœur',tone:'lilas',a:'sad',b:'wow',deco:['heart'],tilt:3},
 {id:'boude',word:'je boude',alt:'Une mascotte boude, l’autre la regarde',tone:'lavande',a:'pout',b:'sad',lookA:'left',lookB:'left',deco:['cloud'],tilt:-3},
 {id:'j-arrive',word:'j’arrive !',alt:'Une mascotte court rejoindre l’autre',tone:'citron',a:'happy',b:'wow',lookB:'left',gap:'apart',deco:['dash'],tilt:2},
 {id:'tu-me-manques',word:'tu me manques',alt:'Nos deux mascottes éloignées, reliées par un cœur',tone:'lilas',a:'sad',b:'sad',gap:'apart',deco:['miss'],tilt:-2},
 {id:'fete',word:'c’est la fête !',alt:'Nos deux mascottes font la fête',tone:'citron',a:'love',b:'wink',deco:['confetti','gift'],tilt:3},
 {id:'film',word:'soirée film ?',alt:'Nos deux mascottes avec du pop-corn',tone:'beurre',a:'wow',b:'happy',deco:['popcorn'],tilt:-3},
 {id:'pluie',word:'il pleut…',alt:'Nos deux mascottes sous un nuage de pluie',tone:'lavande',a:'sleepy',b:'sad',gap:'close',deco:['rain'],tilt:2},
 {id:'vacances',word:'vacances !',alt:'Nos deux mascottes partent en voyage au soleil',tone:'peche',a:'happy',b:'wink',deco:['sun','plane'],tilt:-4},
 {id:'courage',word:'courage !',alt:'Une mascotte fait un clin d’œil pour encourager l’autre',tone:'citron',a:'wink',b:'happy',deco:['stars'],tilt:4},
];
export const coupleStickerIds=coupleStickers.map(s=>s.id);
export const findSticker=(id:string)=>coupleStickers.find(s=>s.id===id);

const heartPath=(x:number,y:number,s:number)=>`M${x} ${y+s*.9}C${x-s*1.5} ${y} ${x-s*.8} ${y-s} ${x} ${y-s*.3}C${x+s*.8} ${y-s} ${x+s*1.5} ${y} ${x} ${y+s*.9}z`;
const LOOK:Record<Look,[number,number]>={left:[-4,1],right:[4,1],up:[0,-4],down:[0,4]};
// Même construction que les mascottes Buddy : yeux à 43/77, paupières, joues et sourire.
function face(shape:'pill'|'flower',mood:Mood,look:Look):ReactNode[]{
 const ey=shape==='pill'?50:58,r=14,xs=[43,77],[lx,ly]=LOOK[look],out:ReactNode[]=[];
 xs.forEach((x,i)=>{
  const closed=mood==='happy'||mood==='kiss'||(mood==='wink'&&i===0);
  if(closed)out.push(<path key={'l'+i} className="cs-line" d={`M${x-9} ${ey+3}q9-11 18 0`}/>);
  else if(mood==='sleepy')out.push(<path key={'l'+i} className="cs-line" d={`M${x-9} ${ey}q9 7 18 0`}/>);
  else{
   out.push(<circle key={'w'+i} className="cs-eye" cx={x} cy={ey} r={r}/>);
   if(mood==='love')out.push(<path key={'h'+i} className="cs-heart" d={heartPath(x+lx*.5,ey+ly*.5,r*.55)}/>);
   else out.push(<circle key={'p'+i} className="cs-pupil" cx={x+lx} cy={ey+ly} r={r*.58}/>,<circle key={'g'+i} className="cs-eye" cx={x+lx-r*.22} cy={ey+ly-r*.25} r={r*.2}/>);
   if(mood==='wow')out.push(<path key={'b'+i} className="cs-line" d={`M${x-8} ${ey-r-7}q8-6 16 0`}/>);
   if(mood==='sad')out.push(<path key={'b'+i} className="cs-line" d={i===0?`M${x-9} ${ey-r-3}l16 -6`:`M${x-7} ${ey-r-9}l16 6`}/>);
   if(mood==='pout')out.push(<path key={'b'+i} className="cs-line" d={i===0?`M${x-9} ${ey-r-9}l16 6`:`M${x-7} ${ey-r-3}l16 -6`}/>);
  }
 });
 const m=ey+18;
 if(mood==='happy'||mood==='love'||mood==='wink')out.push(<path key="m" className="cs-line" d={`M51 ${m}q9 10 18 0`}/>);
 if(mood==='kiss')out.push(<path key="m" className="cs-line" d={`M58 ${m-2}q7 3 0 6q7 3 0 6`}/>);
 if(mood==='wow')out.push(<ellipse key="m" className="cs-pupil" cx={60} cy={m+2} rx={5} ry={6}/>);
 if(mood==='sleepy'||mood==='pout')out.push(<path key="m" className="cs-line" d={`M55 ${m}h10`}/>);
 if(mood==='sad')out.push(<path key="m" className="cs-line" d={`M52 ${m+5}q8-8 16 0`}/>,<path key="t" className="cs-water" d={`M${xs[1]+10} ${ey+8}c3 5 5 8 5 10a5 5 0 0 1-10 0c0-2 2-5 5-10z`}/>);
 if(mood!=='sleepy'&&mood!=='sad')out.push(<circle key="c1" className="cs-cheek" cx={xs[0]-8} cy={ey+14} r={7}/>,<circle key="c2" className="cs-cheek" cx={xs[1]+8} cy={ey+14} r={7}/>);
 return out;
}
function Mascot({who,mood,look,x,y}:{who:'a'|'b';mood:Mood;look:Look;x:number;y:number}){
 const shape=who==='a'?'pill':'flower',fill=who==='a'?'cs-lavande':'cs-peche';
 return <g transform={`translate(${x} ${y}) scale(.7)`}>{shape==='pill'?<rect className={'cs-body '+fill} x={16} y={4} width={88} height={112} rx={44}/>:[[38,38],[82,38],[38,82],[82,82],[60,60]].map(([cx,cy],i)=><circle key={i} className={'cs-body '+fill} cx={cx} cy={cy} r={30}/>)}{face(shape,mood,look)}</g>;
}
const drop=(x:number,y:number,k='')=><path key={k||`d${x}-${y}`} className="cs-water" d={`M${x} ${y}c4 6 7 10 7 13a7 7 0 0 1-14 0c0-3 3-7 7-13z`}/>;
const sparkle=(x:number,y:number,s:number,k:string)=><path key={k} className="cs-citron-deep" d={`M${x} ${y-s}q${s*.15} ${s*.85} ${s} ${s}q${-s*.85} ${s*.15} ${-s} ${s}q${-s*.15} ${-s*.85} ${-s} ${-s}q${s*.85} ${-s*.15} ${s} ${-s}z`}/>;
function decoration(d:Deco):ReactNode{
 switch(d){
  case 'heart':return <path key={d} className="cs-heart" d={heartPath(100,70,13)}/>;
  case 'hearts':return <g key={d}><path className="cs-heart" d={heartPath(22,62,7)}/><path className="cs-heart" d={heartPath(180,58,8)}/><path className="cs-heart" d={heartPath(186,140,6)}/></g>;
  case 'kiss':return <g key={d}><path className="cs-heart" d={heartPath(100,66,9)}/><path className="cs-heart" d={heartPath(116,52,6)}/><path className="cs-heart" d={heartPath(88,48,5)}/></g>;
  case 'zzz':return <text key={d} className="cs-zzz" x={150} y={66}>z<tspan dx={2} dy={-8}>z</tspan><tspan dx={2} dy={-8}>z</tspan></text>;
  case 'moon':return <path key={d} className="cs-beurre" d="M30 46a16 16 0 1 0 16 22a13 13 0 1 1-16-22z"/>;
  case 'sparkles':return <g key={d}>{sparkle(18,70,9,'s1')}{sparkle(184,74,8,'s2')}{sparkle(100,62,6,'s3')}</g>;
  case 'coffee':return <g key={d}>{[64,122].map(x=><g key={x}><path className="cs-cup" d={`M${x} 130h22v14a9 9 0 0 1-9 9h-4a9 9 0 0 1-9-9z`}/><path className="cs-stroke" d={`M${x+22} 135h4a4 4 0 0 1 0 8h-4`}/><path className="cs-steam" d={`M${x+7} 125q-4-5 0-10M${x+15} 125q-4-5 0-10`}/></g>)}</g>;
  case 'plate':return <g key={d}><ellipse className="cs-plate" cx={100} cy={146} rx={30} ry={9}/><ellipse className="cs-peche-fill" cx={100} cy={142} rx={18} ry={7}/><path className="cs-steam" d="M92 132q-4-6 0-12M100 130q-4-6 0-12M108 132q-4-6 0-12"/></g>;
  case 'basket':return <g key={d}><path className="cs-stroke" d="M84 128q16-22 32 0"/><path className="cs-basket" d="M76 128h48l-6 24h-36z"/><circle className="cs-red" cx={92} cy={124} r={6}/><circle className="cs-leaf" cx={104} cy={122} r={6}/></g>;
  case 'drops':return <g key={d}><path className="cs-leaf-deep-stroke" d="M100 156v-14"/><path className="cs-leaf" d="M100 144q-12-2-12-12q12 0 12 12z"/><path className="cs-leaf" d="M100 146q12-2 12-12q-12 0-12 12z"/>{drop(92,104,'d1')}{drop(106,114,'d2')}</g>;
  case 'confetti':return <g key={d}>{[[20,60,'cs-heart'],[178,56,'cs-citron-deep'],[30,150,'cs-water'],[170,146,'cs-heart'],[100,58,'cs-water'],[60,48,'cs-citron-deep'],[146,44,'cs-peche-fill']].map(([x,y,c],i)=><rect key={i} className={String(c)} x={Number(x)} y={Number(y)} width={8} height={5} rx={2} transform={`rotate(${i*37} ${x} ${y})`}/>)}</g>;
  case 'rain':return <g key={d}><path className="cs-cloud" d="M140 56a12 12 0 0 1 19-12a15 15 0 0 1 27 4a10 10 0 0 1 2 20h-44a10 10 0 0 1-4-12z"/>{drop(152,74,'r1')}{drop(170,80,'r2')}{drop(186,72,'r3')}<path className="cs-cloud" d="M8 60a10 10 0 0 1 16-10a13 13 0 0 1 23 3a9 9 0 0 1 1 17h-36a9 9 0 0 1-4-10z"/>{drop(20,78,'r4')}{drop(36,84,'r5')}</g>;
  case 'plane':return <path key={d} className="cs-plane" d="M150 54l30-10-6 8 8 2-4 4-10-1-14 7 4-7z"/>;
  case 'sun':return <g key={d}><circle className="cs-sun" cx={30} cy={56} r={12}/>{[0,45,90,135,180,225,270,315].map(a=><path key={a} className="cs-sun-ray" d="M30 38v-6" transform={`rotate(${a} 30 56)`}/>)}</g>;
  case 'popcorn':return <g key={d}><path className="cs-popcorn" d="M84 128h32l-5 26h-22z"/><path className="cs-red-stroke" d="M92 130l2 22M100 130v22M108 130l-2 22"/>{[[88,124],[98,120],[108,124],[94,116],[104,116]].map(([x,y],i)=><circle key={i} className="cs-cream" cx={x} cy={y} r={6}/>)}</g>;
  case 'dash':return <path key={d} className="cs-dash" d="M8 92h16M4 106h20M8 120h14"/>;
  case 'miss':return <g key={d}><path className="cs-dotted" d="M80 108h40"/><path className="cs-heart" d={heartPath(100,104,9)}/></g>;
  case 'cloud':return <g key={d}><path className="cs-scribble" d="M28 52q6-10 12 0t12 0t12 0"/></g>;
  case 'stars':return <g key={d}>{sparkle(22,64,10,'t1')}{sparkle(180,66,10,'t2')}{sparkle(100,150,7,'t3')}</g>;
  case 'gift':return <g key={d}><rect className="cs-heart" x={88} y={132} width={24} height={20} rx={3}/><path className="cs-cream-stroke" d="M100 132v20M88 140h24"/><path className="cs-stroke" d="M100 132q-8-10-12-2q4 4 12 2q8-10 12-2q-4 4-12 2"/></g>;
 }
}
const BACK:Deco[]=['moon','sun'];
export function CoupleSticker({id,size=148,className=''}:{id:string;size?:number;className?:string}){
 const s=findSticker(id);if(!s)return null;
 const gap=s.gap||'normal',[ax,bx]=gap==='close'?[30,86]:gap==='hug'?[40,76]:gap==='apart'?[0,116]:[14,102];
 const long=s.word.length>10,w=Math.min(196,s.word.length*(long?10.2:11.5)+30);
 return <span className={`couple-sticker ${className}`} role="img" aria-label={'Sticker Nous deux : '+s.word+'. '+s.alt+'.'} style={{['--sticker-tilt' as string]:s.tilt+'deg'}}>
  <svg viewBox="0 0 200 168" width={size} height={size*168/200} aria-hidden="true" focusable="false">
   {s.deco.filter(d=>BACK.includes(d)).map(decoration)}
   {gap==='hug'?<><Mascot who="b" mood={s.b} look={s.lookB||'left'} x={bx} y={64}/><Mascot who="a" mood={s.a} look={s.lookA||'right'} x={ax} y={62}/></>:<><Mascot who="a" mood={s.a} look={s.lookA||'right'} x={ax} y={62}/><Mascot who="b" mood={s.b} look={s.lookB||'left'} x={bx} y={64}/></>}
   {s.deco.filter(d=>!BACK.includes(d)).map(decoration)}
   <g transform="rotate(-3 100 22)"><rect className={'cs-word-bg cs-'+s.tone} x={100-w/2} y={6} width={w} height={32} rx={16}/><text className="cs-word" x={100} y={28} textAnchor="middle" style={long?{fontSize:16}:undefined}>{s.word}</text></g>
  </svg>
 </span>;
}
