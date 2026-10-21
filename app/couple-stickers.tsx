// Stickers exclusifs à Nous deux, composés avec les mascottes de l’application :
// nos deux compagnons (pilule lavande pour le premier compte, fleur pêche pour le second,
// comme MatchSticker), le pot des courses, les plantes du jardin (PlantBuddy), les mascottes
// des moments (resto, maison, escapade, surprise…), le chat et le chien, et le mot en
// Fraunces italique du composant Sticker. Les sources du design system ne sont pas modifiées.
import type {ReactNode} from 'react';
import {Buddy,PlantBuddy,Sticker} from '../design-system/runtime';
import {MomentBuddy,type MomentKind} from './moment-buddy';

type Look='left'|'right'|'up'|'down';
type Tone='citron'|'rose'|'beurre'|'menthe'|'lilas'|'lavande'|'peche';
type PartnerMood='happy'|'love'|'wow'|'sleepy'|'wink'|'kiss'|'sad'|'pout';
type PetMood='happy'|'content'|'love'|'want'|'sad'|'sleepy';
type Place={x:number;b?:number;s:number;r?:number};
type Actor=Place&({t:'a'|'b';mood:PartnerMood;look?:Look}
 |{t:'buddy';shape:'pot'|'blob'|'dome';tone:Tone;mood:'happy'|'love'|'wow'|'sleepy';look?:Look}
 |{t:'plant';species:'feuille'|'monstera'|'cactus'|'pousse';mood:'happy'|'love'|'thirsty'|'sad'|'ok'}
 |{t:'cat'|'dog';tone:Tone;mood:PetMood;flip?:boolean}
 |{t:'moment';kind:MomentKind});
type DecoName='heart'|'sparkle'|'zzz'|'moon'|'sun'|'cup'|'plate'|'veggies'|'can'|'drop'|'confetti'|'rain'|'plane'|'popcorn'|'dash'|'miss'|'grumpy'|'bowl'|'paws'|'purr'|'wave'|'question';
type Deco=[DecoName,number,number,number?];
export type CoupleStickerDef={id:string;word:string;alt:string;tone:Tone;tilt:number;actors:Actor[];back?:Deco[];front?:Deco[]};

const A=(mood:PartnerMood,x:number,s=80,o:Partial<Place&{look:Look}>={}):Actor=>({t:'a',mood,x,s,...o});
const B=(mood:PartnerMood,x:number,s=80,o:Partial<Place&{look:Look}>={}):Actor=>({t:'b',mood,x,s,...o});
const M=(kind:MomentKind,x:number,s:number,o:Partial<Place>={}):Actor=>({t:'moment',kind,x,s,...o});

/** Les identifiants doivent rester alignés avec supabase/functions/house-api/chat-card-input.ts.
 * Les 20 premiers existaient avant la refonte : ne jamais en retirer ni en renommer un. */
export const coupleStickers:CoupleStickerDef[]=[
 {id:'bisou',word:'bisou !',alt:'Nos deux mascottes se font un bisou',tone:'rose',tilt:-4,actors:[A('kiss',72,78,{r:6}),B('love',130,80,{r:-6,look:'left'})],front:[['heart',100,74,1],['heart',118,62,.55],['heart',84,62,.45]]},
 {id:'calin',word:'câlin',alt:'Nos deux mascottes se serrent fort',tone:'peche',tilt:3,actors:[B('happy',128,84,{r:-4}),A('happy',80,80,{r:6})],front:[['heart',100,64,.9],['sparkle',30,90,.8],['sparkle',172,92,.7]]},
 {id:'je-t-aime',word:'je t’aime',alt:'Nos deux mascottes amoureuses autour d’un grand cœur',tone:'rose',tilt:-3,actors:[A('love',44,70,{look:'right'}),B('love',156,72,{look:'left'}),M('family',100,64,{b:160})],front:[['heart',26,68,.5],['heart',176,64,.5]]},
 {id:'coucou',word:'coucou !',alt:'Nos deux mascottes disent coucou',tone:'citron',tilt:4,actors:[A('wow',70,84),B('happy',140,76)],front:[['wave',22,100],['sparkle',176,78,.8],['sparkle',104,66,.55]]},
 {id:'bonne-nuit',word:'bonne nuit',alt:'Nos deux mascottes s’endorment sous la lune',tone:'lavande',tilt:-2,actors:[A('sleepy',78,78,{r:6}),B('sleepy',126,80,{r:-4})],back:[['moon',32,70]],front:[['zzz',160,76]]},
 {id:'cafe',word:'café ?',alt:'Nos deux mascottes partagent un café',tone:'beurre',tilt:3,actors:[A('happy',52,76),B('wow',148,76,{look:'left'})],front:[['cup',88,148,.9],['cup',114,150,.9]]},
 {id:'a-table',word:'à table !',alt:'Nos deux mascottes devant une assiette fumante',tone:'rose',tilt:-4,actors:[A('love',50,76),B('happy',150,76)],front:[['plate',100,150]]},
 {id:'courses',word:'courses ?',alt:'Le pot des courses entouré de nos deux mascottes',tone:'menthe',tilt:2,actors:[{t:'buddy',shape:'pot',tone:'beurre',mood:'wow',look:'up',x:100,s:80,b:166},A('happy',34,58),B('happy',166,60)],front:[['veggies',100,108,1.15]]},
 {id:'arrosage',word:'on arrose ?',alt:'Une mascotte arrose une plante qui a soif',tone:'menthe',tilt:-3,actors:[{t:'plant',species:'feuille',mood:'thirsty',x:130,s:72,b:166},A('happy',42,68,{look:'down'})],front:[['can',86,96],['drop',104,112,.7],['drop',114,124,.6]]},
 {id:'merci',word:'merci !',alt:'Nos deux mascottes rayonnent de gratitude',tone:'beurre',tilt:4,actors:[A('happy',66,80),B('love',136,80)],front:[['sparkle',22,80,.9],['sparkle',180,76,.9],['heart',100,70,.55]]},
 {id:'bravo',word:'bravo !',alt:'Nos deux mascottes célèbrent sous les confettis',tone:'citron',tilt:-4,actors:[A('wow',66,80),B('happy',136,80)],front:[['confetti',0,0]]},
 {id:'pardon',word:'pardon…',alt:'Une mascotte s’excuse en offrant un petit cœur',tone:'lilas',tilt:3,actors:[A('sad',66,78,{look:'down'}),B('wow',138,78,{look:'left'})],front:[['heart',102,138,.8]]},
 {id:'boude',word:'je boude',alt:'Une mascotte boude, l’autre la regarde',tone:'lavande',tilt:-3,actors:[A('pout',62,80,{look:'left',r:-4}),B('wow',142,74,{look:'left'})],front:[['grumpy',38,70]]},
 {id:'j-arrive',word:'j’arrive !',alt:'Une mascotte court rejoindre l’autre',tone:'citron',tilt:2,actors:[A('happy',50,76,{r:10}),B('wow',154,76,{look:'left'})],front:[['dash',6,112]]},
 {id:'tu-me-manques',word:'tu me manques',alt:'Nos deux mascottes éloignées, reliées par un cœur',tone:'lilas',tilt:-2,actors:[A('sad',38,68),B('sad',162,68)],front:[['miss',100,128]]},
 {id:'fete',word:'c’est la fête !',alt:'Nos deux mascottes font la fête autour d’un cadeau',tone:'citron',tilt:3,actors:[M('surprise',100,70,{b:166}),A('love',36,62),B('wink',166,62)],front:[['confetti',0,0]]},
 {id:'film',word:'soirée film ?',alt:'Nos deux mascottes avec du pop-corn',tone:'beurre',tilt:-3,actors:[A('wow',56,78),B('happy',144,78)],front:[['popcorn',100,146]]},
 {id:'pluie',word:'il pleut…',alt:'Nos deux mascottes sous un nuage de pluie',tone:'lavande',tilt:2,actors:[A('sleepy',80,70),B('sad',124,72,{look:'up'})],front:[['rain',100,78,.9]]},
 {id:'vacances',word:'vacances !',alt:'La valise de l’escapade part au soleil avec nos deux mascottes',tone:'peche',tilt:-4,actors:[M('trip',104,78,{b:166}),A('wink',36,60),B('happy',168,58)],back:[['sun',24,84,.85]],front:[['plane',174,86,.9]]},
 {id:'courage',word:'courage !',alt:'Une mascotte fait un clin d’œil pour encourager l’autre',tone:'citron',tilt:4,actors:[A('wink',66,80),B('happy',136,80)],front:[['sparkle',22,74,1],['sparkle',180,70,1],['sparkle',100,150,.6]]},
 {id:'chat-faim',word:'le chat a faim',alt:'Le chat réclame devant sa gamelle vide',tone:'beurre',tilt:-3,actors:[{t:'cat',tone:'peche',mood:'want',x:82,s:94,b:166}],front:[['bowl',152,156],['question',150,96]]},
 {id:'ronron',word:'ronron…',alt:'Le chat ronronne, plein de cœurs',tone:'rose',tilt:3,actors:[{t:'cat',tone:'beurre',mood:'content',x:96,s:96,b:166}],front:[['purr',160,84],['heart',36,78,.6],['heart',166,124,.45]]},
 {id:'sieste',word:'sieste ?',alt:'Le chat fait la sieste sous la lune',tone:'lavande',tilt:-2,actors:[{t:'cat',tone:'lilas',mood:'sleepy',x:100,s:98,b:166}],back:[['moon',30,68]],front:[['zzz',156,74]]},
 {id:'balade',word:'balade ?',alt:'Le chien attend sa promenade avec une mascotte',tone:'menthe',tilt:2,actors:[{t:'dog',tone:'beurre',mood:'want',x:76,s:92,b:166},A('happy',166,60)],front:[['paws',116,160,.85]]},
 {id:'ouaf',word:'ouaf !',alt:'Le chien remue la queue de bonheur',tone:'peche',tilt:-3,actors:[{t:'dog',tone:'peche',mood:'happy',x:100,s:98,b:166}],front:[['sparkle',30,84,.9],['sparkle',172,80,.9],['heart',160,124,.5]]},
 {id:'ca-pousse',word:'ça pousse !',alt:'Une jeune pousse ravie entre nos deux mascottes',tone:'menthe',tilt:3,actors:[{t:'plant',species:'pousse',mood:'love',x:100,s:76,b:166},A('wow',34,56),B('love',166,58)]},
 {id:'bisou-piquant',word:'bisou piquant',alt:'Une mascotte fait un bisou au cactus amoureux',tone:'rose',tilt:-4,actors:[{t:'plant',species:'cactus',mood:'love',x:126,s:74,b:166},A('kiss',58,72,{r:10})],front:[['heart',92,84,.7]]},
 {id:'resto',word:'resto ce soir ?',alt:'La mascotte du restaurant avec nos deux compagnons',tone:'rose',tilt:2,actors:[M('restaurant',100,84,{b:166}),A('wow',32,56),B('love',168,58)]},
 {id:'je-rentre',word:'je rentre !',alt:'Une mascotte court vers la petite maison',tone:'lavande',tilt:-2,actors:[M('home',132,82,{b:166}),A('happy',52,70,{r:10})],front:[['dash',8,114]]},
 {id:'surprise',word:'surprise !',alt:'Le paquet surprise étonne une mascotte',tone:'rose',tilt:4,actors:[M('surprise',112,84,{b:166}),A('wow',38,62,{look:'right'})],front:[['sparkle',176,70,.9],['sparkle',60,72,.6]]},
 {id:'anniv',word:'joyeux anniv !',alt:'Le gâteau d’anniversaire entouré de nos deux mascottes',tone:'peche',tilt:-3,actors:[M('birthday',100,80,{b:166}),A('love',34,56),B('happy',166,58)],front:[['confetti',0,0]]},
 {id:'rendez-vous',word:'rendez-vous ?',alt:'Le petit calendrier propose un rendez-vous à nos deux mascottes',tone:'lilas',tilt:3,actors:[M('event',100,76,{b:166}),A('wow',34,56,{look:'right'}),B('love',166,58)],front:[['sparkle',22,84,.7],['sparkle',180,84,.7]]},
];
export const coupleStickerIds=coupleStickers.map(s=>s.id);
export const findSticker=(id:string)=>coupleStickers.find(s=>s.id===id);

const heartPath=(x:number,y:number,s:number)=>`M${x} ${y+s*.9}C${x-s*1.5} ${y} ${x-s*.8} ${y-s} ${x} ${y-s*.3}C${x+s*.8} ${y-s} ${x+s*1.5} ${y} ${x} ${y+s*.9}z`;
const LOOK:Record<Look,[number,number]>={left:[-4,1],right:[4,1],up:[0,-4],down:[0,4]};

/** Mascottes du couple : le composant Buddy du design system, et le même dessin pour les
 * expressions qu’il ne propose pas (clin d’œil, bisou, tristesse, bouderie). */
function Partner({who,mood,look,size}:{who:'a'|'b';mood:PartnerMood;look?:Look;size:number}){
 const shape=who==='a'?'pill':'flower',tone=who==='a'?'lavande':'peche';
 if(mood==='happy'||mood==='love'||mood==='wow'||mood==='sleepy')return <Buddy shape={shape} tone={tone} mood={mood} look={look} size={size}/>;
 const ey=shape==='pill'?50:58,r=14,xs=[43,77],[lx,ly]=LOOK[look||(mood==='sad'?'down':'right')],face:ReactNode[]=[];
 xs.forEach((x,i)=>{
  if(mood==='kiss'||(mood==='wink'&&i===0)){face.push(<path key={'l'+i} className="lid" d={`M${x-9} ${ey+3}q9-11 18 0`}/>);return;}
  face.push(<circle key={'w'+i} className="eye" cx={x} cy={ey} r={r}/>,<circle key={'p'+i} className="pupil" cx={x+lx} cy={ey+ly} r={r*.58}/>,<circle key={'g'+i} className="glint" cx={x+lx-r*.22} cy={ey+ly-r*.25} r={r*.2}/>);
  if(mood==='sad')face.push(<path key={'b'+i} className="brow" d={i===0?`M${x-9} ${ey-r-3}l16 -6`:`M${x-7} ${ey-r-9}l16 6`}/>);
  if(mood==='pout')face.push(<path key={'b'+i} className="brow" d={i===0?`M${x-9} ${ey-r-9}l16 6`:`M${x-7} ${ey-r-3}l16 -6`}/>);
 });
 const m=ey+18;
 if(mood==='wink')face.push(<path key="m" className="mouth" d={`M51 ${m}q9 10 18 0`}/>);
 if(mood==='kiss')face.push(<path key="m" className="mouth" d={`M58 ${m-3}q8 3 0 7q8 3 0 7`}/>);
 if(mood==='pout')face.push(<path key="m" className="mouth" d={`M54 ${m+2}h12`}/>);
 if(mood==='sad')face.push(<path key="m" className="mouth" d={`M52 ${m+6}q8-8 16 0`}/>,<path key="t" className="cs-tear" d={`M${xs[1]+12} ${ey+8}c3 5 5 8 5 10a5 5 0 0 1-10 0c0-2 2-5 5-10z`}/>);
 if(mood!=='sad')face.push(<circle key="c1" className="cheek" cx={xs[0]-8} cy={ey+14} r={mood==='pout'?9:7}/>,<circle key="c2" className="cheek" cx={xs[1]+8} cy={ey+14} r={mood==='pout'?9:7}/>);
 return <svg className="nd-buddy" viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
  {shape==='pill'?<rect className={'body f-'+tone} x={16} y={4} width={88} height={112} rx={44}/>:<g>{[[38,38],[82,38],[38,82],[82,82],[60,60]].map(([cx,cy],i)=><circle key={i} className={'body f-'+tone} cx={cx} cy={cy} r={30}/>)}</g>}{face}
 </svg>;
}

/** Le chat et le chien de « Nos compagnons » : mêmes formes plates, grands yeux et palette buddy. */
function Pet({kind,tone,mood,size}:{kind:'cat'|'dog';tone:Tone;mood:PetMood;size:number}){
 const ey=56,xs=[44,76],[lx,ly]:[number,number]=mood==='want'?[0,-3]:mood==='sad'?[0,3]:[0,0],t='f-'+tone;
 const eyes=xs.map((x,i)=>mood==='love'?<path key={i} className="heart-eye" d={heartPath(x,ey,7)}/>
  :mood==='content'?<path key={i} className="pet-line" d={`M${x-8} ${ey+2}q8-9 16 0`}/>
  :mood==='sleepy'?<path key={i} className="pet-line" d={`M${x-8} ${ey}q8 6 16 0`}/>
  :<g key={i}><circle className="eye" cx={x} cy={ey} r={10.5}/><circle className="pupil" cx={x+lx} cy={ey+ly} r={6.2}/><circle className="glint" cx={x+lx-2} cy={ey+ly-2.4} r={2}/></g>);
 const brows=mood==='sad'?<path className="pet-line" d="M34 41l9 4M86 41l-9 4"/>:mood==='want'?<path className="pet-line" d="M35 41q8-5 16 0M69 41q8-5 16 0"/>:null;
 const cheeks=mood!=='sad'&&mood!=='want'?<><circle className="cheek" cx={30} cy={70} r={6}/><circle className="cheek" cx={90} cy={70} r={6}/></>:null;
 return <svg className={`cs-pet cs-pet-${kind}`} viewBox="0 0 120 130" width={size} height={size*130/120} aria-hidden="true">
  {kind==='cat'?<>
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
   <path className="pet-line" d={mood==='sad'?'M52 82q8-6 16 0':mood==='want'?'M55 79q5 4 10 0':'M52 77q4 5 8 0q4 5 8 0'}/>
  </>:<>
   <path className={`pet-tail ${t}`} d="M88 104q20-6 20-26"/>
   <ellipse className={t} cx={60} cy={106} rx={30} ry={21}/>
   <ellipse className="pet-paw" cx={47} cy={124} rx={9} ry={5.5}/><ellipse className="pet-paw" cx={73} cy={124} rx={9} ry={5.5}/>
   <ellipse className={t} cx={60} cy={60} rx={38} ry={34}/>
   <ellipse className="pet-patch" cx={78} cy={52} rx={13} ry={15}/>
   <g transform={mood==='sad'?'translate(0 4)':undefined}><ellipse className={`pet-ear-dog ${t}`} cx={23} cy={52} rx={12} ry={24} transform="rotate(18 23 52)"/><ellipse className="pet-shade" cx={23} cy={52} rx={12} ry={24} transform="rotate(18 23 52)"/><ellipse className={`pet-ear-dog ${t}`} cx={97} cy={52} rx={12} ry={24} transform="rotate(-18 97 52)"/><ellipse className="pet-shade" cx={97} cy={52} rx={12} ry={24} transform="rotate(-18 97 52)"/></g>
   {eyes}{brows}{cheeks}
   <ellipse className="pet-snout" cx={60} cy={76} rx={17} ry={12}/>
   <ellipse className="pet-nose" cx={60} cy={70} rx={6.5} ry={4.5}/>
   <path className="pet-line" d={mood==='sad'?'M53 84q7-5 14 0':'M60 74v4M52 79q4 4 8 0q4 4 8 0'}/>
   {(mood==='happy'||mood==='love'||mood==='content')&&<path className="pet-tongue" d="M56 82h8v5a4 4 0 0 1-8 0z"/>}
  </>}
 </svg>;
}

const RATIO={a:1,b:1,buddy:1,plant:140/120,cat:130/120,dog:130/120,moment:136/128} as const;
function ActorArt({a}:{a:Actor}){
 switch(a.t){
  case 'a':case 'b':return <Partner who={a.t} mood={a.mood} look={a.look} size={a.s}/>;
  case 'buddy':return <Buddy shape={a.shape} tone={a.tone} mood={a.mood} look={a.look} size={a.s}/>;
  case 'plant':return <PlantBuddy species={a.species} mood={a.mood} potTone="peche" speech={false} size={a.s}/>;
  case 'cat':case 'dog':return <Pet kind={a.t} tone={a.tone} mood={a.mood} size={a.s}/>;
  case 'moment':return <MomentBuddy kind={a.kind}/>;
 }
}

const drop=(x:number,y:number,k:string)=><path key={k} className="cs-water" d={`M${x} ${y-7}c4 6 7 10 7 13a7 7 0 0 1-14 0c0-3 3-7 7-13z`}/>;
const star=(x:number,y:number,s:number)=>`M${x} ${y-s}q${s*.15} ${s*.85} ${s} ${s}q${-s*.85} ${s*.15} ${-s} ${s}q${-s*.15} ${-s*.85} ${-s} ${-s}q${s*.85} ${-s*.15} ${s} ${-s}z`;
/** Petits éléments dessinés autour de l’origine, puis placés et mis à l’échelle. */
function decoArt(name:DecoName):ReactNode{
 switch(name){
  case 'heart':return <path className="cs-heart" d={heartPath(0,0,12)}/>;
  case 'sparkle':return <path className="cs-sparkle" d={star(0,0,10)}/>;
  case 'zzz':return <text className="cs-zzz" x={0} y={0}>z<tspan dx={2} dy={-9}>z</tspan><tspan dx={2} dy={-9}>z</tspan></text>;
  case 'moon':return <path className="cs-moon" d="M-2-16a16 16 0 1 0 16 22a13 13 0 1 1-16-22z"/>;
  case 'sun':return <g><circle className="cs-sun" r={12}/>{[0,45,90,135,180,225,270,315].map(a=><path key={a} className="cs-ray" d="M0-18v-6" transform={`rotate(${a})`}/>)}</g>;
  case 'cup':return <g><path className="cs-cup" d="M-11-8h22v14a9 9 0 0 1-9 9h-4a9 9 0 0 1-9-9z"/><path className="cs-stroke" d="M11-3h4a4 4 0 0 1 0 8h-4"/><path className="cs-steam" d="M-4-13q-4-5 0-10M4-13q-4-5 0-10"/></g>;
  case 'plate':return <g><ellipse className="cs-plate" cx={0} cy={4} rx={32} ry={9}/><ellipse className="cs-food" cx={0} cy={0} rx={19} ry={7}/><circle className="cs-leaf" cx={-6} cy={-4} r={3.5}/><circle className="cs-red" cx={6} cy={-3} r={3.5}/><path className="cs-steam" d="M-8-12q-4-6 0-12M0-14q-4-6 0-12M8-12q-4-6 0-12"/></g>;
  case 'veggies':return <g><path className="cs-carrot" d="M-20-4l14-8 2 4z"/><path className="cs-leaf-stroke" d="M-6-12l5-5M-6-12l6-1"/><circle className="cs-red" cx={2} cy={-6} r={8}/><path className="cs-leaf" d="M2-14q-6-6-2-8q4 2 2 8z"/><circle className="cs-leaf" cx={18} cy={-6} r={7}/><circle className="cs-leaf" cx={22} cy={-12} r={5}/></g>;
  case 'can':return <g><path className="cs-can" d="M-14-8h22l-2 22h-18z"/><path className="cs-stroke" d="M-12-8q8-12 18 0"/><path className="cs-can" d="M8 0l16-10 3 4-17 12z"/></g>;
  case 'drop':return drop(0,0,'d');
  case 'confetti':return <g>{([[18,64,'cs-heart'],[184,66,'cs-sparkle'],[12,112,'cs-water'],[190,114,'cs-heart'],[40,50,'cs-food'],[160,48,'cs-water'],[26,88,'cs-sparkle'],[178,92,'cs-food']] as const).map(([x,y,c],i)=><rect key={i} className={c} x={x} y={y} width={9} height={5} rx={2} transform={`rotate(${i*37} ${x} ${y})`}/>)}</g>;
  case 'rain':return <g><path className="cs-cloud" d="M-28 6a12 12 0 0 1 10-17a16 16 0 0 1 30-4a12 12 0 0 1 16 21z"/>{drop(-14,22,'r1')}{drop(4,28,'r2')}{drop(20,22,'r3')}</g>;
  case 'plane':return <path className="cs-plane" d="M-16 2l30-10-6 8 8 2-4 4-10-1-14 7 4-7z"/>;
  case 'popcorn':return <g><path className="cs-popcorn" d="M-16-14h32l-5 26h-22z"/><path className="cs-red-stroke" d="M-8-12l2 22M0-12v22M8-12l-2 22"/>{[[-12,-18],[-2,-22],[8,-18],[-6,-26],[4,-26]].map(([x,y],i)=><circle key={i} className="cs-cream" cx={x} cy={y} r={6}/>)}</g>;
  case 'dash':return <path className="cs-dash" d="M4-18h16M0-4h22M4 10h14"/>;
  case 'miss':return <g><path className="cs-dotted" d="M-44 0h88"/><path className="cs-heart" d={heartPath(0,-4,11)}/></g>;
  case 'grumpy':return <g><path className="cs-cloud" d="M-22 6a10 10 0 0 1 8-14a13 13 0 0 1 24-3a10 10 0 0 1 12 17z"/><path className="cs-scribble" d="M-12 0q4-6 8 0t8 0t8 0"/></g>;
  case 'bowl':return <g><path className="cs-bowl" d="M-26-8h52l-6 16h-40z"/><ellipse className="cs-bowl-in" cx={0} cy={-8} rx={26} ry={5}/></g>;
  case 'paws':return <g>{[[0,0],[26,-16]].map(([x,y],i)=><g key={i} className="cs-paw" transform={`translate(${x} ${y}) rotate(${i?20:-10})`}><ellipse cx={0} cy={3} rx={6} ry={5}/><circle cx={-6} cy={-5} r={2.6}/><circle cx={0} cy={-8} r={2.6}/><circle cx={6} cy={-5} r={2.6}/></g>)}</g>;
  case 'purr':return <text className="cs-zzz" x={0} y={0}>rr<tspan dx={2} dy={-8}>r</tspan></text>;
  case 'wave':return <path className="cs-dash" d="M8-14q-8 14 0 28M-2-20q-10 20 0 40"/>;
  case 'question':return <text className="cs-question" x={0} y={0}>?</text>;
 }
}
const decoLayer=(list:Deco[]|undefined,key:string)=>list?.length?<svg key={key} className="cs-layer" viewBox="0 0 200 168" aria-hidden="true">{list.map(([n,x,y,s=1],i)=><g key={i} transform={`translate(${x} ${y}) scale(${s})`}>{decoArt(n)}</g>)}</svg>:null;

export function CoupleSticker({id,size=148,className=''}:{id:string;size?:number;className?:string}){
 const s=findSticker(id);if(!s)return null;
 return <span className={`couple-sticker ${className}`} role="img" aria-label={'Sticker Nous deux : '+s.word+'. '+s.alt+'.'} style={{width:size,height:size*168/200,['--sticker-tilt' as string]:s.tilt+'deg'}}>
  <span className="cs-stage" aria-hidden="true" style={{transform:`scale(${size/200})`}}>
   <span className="cs-scene">
   {decoLayer(s.back,'back')}
   {s.actors.map((a,i)=>{const h=a.s*RATIO[a.t],flip=(a.t==='cat'||a.t==='dog')&&a.flip;
    return <span key={i} className={'cs-actor cs-actor-'+a.t} style={{left:a.x-a.s/2,top:(a.b??164)-h,width:a.s,height:h,transform:`${a.r?`rotate(${a.r}deg)`:''}${flip?' scaleX(-1)':''}`||undefined}}><ActorArt a={a}/></span>;})}
   {decoLayer(s.front,'front')}
   </span>
   <span className={'cs-word'+(s.word.length>12?' cs-word-long':'')}><Sticker tone={s.tone} size="sm" rotate={-3}>{s.word}</Sticker></span>
  </span>
 </span>;
}
