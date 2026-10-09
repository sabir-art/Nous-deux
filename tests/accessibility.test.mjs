// Regression checks for the design system, NOT a declaration of RGAA compliance.
import assert from 'node:assert/strict';
import {readFileSync,realpathSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),postcss=createRequire(realpathSync('node_modules/next/package.json'))('postcss');
const files=['app/globals.css','app/design.css','app/life.css','app/warm.css','app/polish.css'];
const css=files.map(f=>readFileSync(f,'utf8')).join('\n'),root=postcss.parse(css),tokens={};
root.walkDecls(d=>{if(d.prop.startsWith('--'))tokens[d.prop]=d.value;});
function color(v){v=v.replace(/var\((--[\w-]+)\)/g,(_,n)=>tokens[n]);if(v==='white')v='#ffffff';if(v==='black')v='#000000';if(/^#[0-9a-f]{3}$/i.test(v))v='#'+[...v.slice(1)].map(c=>c+c).join('');assert(/^#[0-9a-f]{6}$/i.test(v),'Opaque sRGB colour expected: '+v);return [1,3,5].map(i=>parseInt(v.slice(i,i+2),16)/255);}
const lum=v=>color(v).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
let count=0,min=99;function check(fg,bg,label,threshold=4.5){const r=contrast(fg,bg);assert(r>=threshold,`${label}: ${r.toFixed(2)} < ${threshold}`);count++;if(threshold===4.5)min=Math.min(min,r);}
const surfaces=['--paper','--bg','--rose','--apricot','--lilac','--leaf'];
for(const surface of surfaces){for(const text of ['--ink','--muted','--berry'])check(tokens[text],tokens[surface],text+' on '+surface);check(tokens['--focus'],tokens[surface],'Focus on '+surface,3);check(tokens['--control-border'],tokens[surface],'Control boundary on '+surface,3);}
check('#ffffff',tokens['--berry'],'Primary button / selected week / tab');check('#ffffff',tokens['--berry-hover'],'Primary hover');check(tokens['--ink'],'#fae9dd','Balance gradient start');check(tokens['--ink'],'#f6e8ee','Balance gradient end');
// All 18 calendar categories: names stay visible, colour is never the only cue.
const categoryPairs=new Map();root.walkRules(rule=>{if(/^\.appointment-[a-z]+$/.test(rule.selector)){const props={};rule.walkDecls(d=>props[d.prop]=d.value);if(props.color&&props.background)categoryPairs.set(rule.selector,props);}});
assert.equal(categoryPairs.size,18);for(const [name,p]of categoryPairs)check(p.color,p.background,name);
for(const [fg,bg,label]of [['#34563e','#edf3e9','Plant status'],['#4d6556','#edf3e9','Plant metadata'],['#665868','#f8f4fa','Calendar row'],['#665868','#fcf3eb','Calendar row alternate'],['#9c2340','#fff0f1','Validation error'],['#59442f','#ffffff','Photo caption'],['#623e58','#f9eff5','Sync status']])check(fg,bg,label);
// Render actual interactive components with synthetic data, without credentials,
// a browser, production household state or any network calls.
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const source=`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import HomeMoments from './app/home-moments';import QuickShopping from './app/quick-shopping';import HouseCalendar from './app/house-calendar';import MealSwipeCard from './app/meal-swipe-card';import HouseShopping from './app/house-shopping';
const noop=()=>{},save=async()=>true;const plant={id:'p',name:'Une plante au nom très long pour vérifier les contraintes',species:'Monstera',location:'Salon',note:'',waterEvery:7,lightEvery:0,feedEvery:0,lastWater:'2026-10-08',lastLight:'2026-10-08',lastFeed:'2026-10-08',careLog:[],owner:0,version:1};
export const views={garden:renderToStaticMarkup(React.createElement(HomeMoments,{plants:[plant,{...plant,id:'q'},{...plant,id:'r'}],appointments:[],onGarden:noop,onCalendar:noop})),shopping:renderToStaticMarkup(React.createElement(QuickShopping,{week:'2026-10-05',items:[],busy:false,save,onClose:noop})),calendar:renderToStaticMarkup(React.createElement(HouseCalendar,{appointments:[],names:['Alex','Camille'],onOpen:noop})),swipe:renderToStaticMarkup(React.createElement(MealSwipeCard,{onVote:noop},React.createElement('h2',null,'Un plat'))),purchased:renderToStaticMarkup(React.createElement(HouseShopping,{items:[{id:'i',title:'Bananes',kind:'shopping',weekStart:'2026-10-05',done:true,owner:0,purchasedBy:0,quantity:'',note:'',version:1}],templates:[],active:0,names:['Alex','Camille'],week:'2026-10-05',setWeek:noop,busy:false,online:true,save,onEdit:noop,onExpense:noop}))};`;
const b=await build({stdin:{contents:source,resolveDir:process.cwd(),loader:'tsx'},bundle:true,platform:'node',format:'cjs',packages:'external',jsx:'automatic',write:false});const mod={exports:{}};new Function('require','module','exports',b.outputFiles[0].text)(require,mod,mod.exports);const views=mod.exports.views;
assert(views.garden.includes('aria-label="Nos plantes, liste défilante" tabindex="0"'));assert.equal((views.garden.match(/<button/g)||[]).length,4);
assert(views.shopping.includes('aria-label="Rechercher un article"'));assert(views.shopping.includes('aria-label="Fermer"'));assert(views.shopping.includes('aria-label="Articles disponibles" tabindex="0"'));
assert(views.calendar.includes('aria-label="Semaine précédente"'));assert(views.calendar.includes('aria-pressed="true"'));assert(views.swipe.includes('aria-keyshortcuts="ArrowLeft ArrowRight"'));assert(views.swipe.includes('Une autre envie')&&views.swipe.includes('Oh oui, miam !'));
assert(views.purchased.includes('lucide-undo-2')||views.purchased.includes('lucide-undo2'));assert(!views.purchased.includes('↩'));
const polish=readFileSync('app/polish.css','utf8');assert(polish.includes('prefers-reduced-motion:reduce'));assert(polish.includes('repeat(2,minmax(0,1fr))'));assert(polish.includes('overscroll-behavior-x:contain'));assert(polish.includes('html[data-modal-open] .workspace{overflow:hidden'));assert(polish.includes('--dialog-viewport'));
const html=readFileSync('index.html','utf8');assert(!/user-scalable=no|maximum-scale=1/.test(html));assert(html.includes('lang="fr"'));assert(readFileSync('app/house-app.tsx','utf8').includes('className="skip-link"'));
console.log(`PASS: ${count} text/control contrast pairs (minimum normal text ${min.toFixed(2)}:1), 18 categories, semantic component rendering, keyboard alternatives and reduced-motion/reflow guards. Manual RGAA audit still required.`);
