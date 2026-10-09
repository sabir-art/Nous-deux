// Targeted accessibility regressions; these checks do not certify RGAA compliance.
import assert from 'node:assert/strict';
import {readFileSync,realpathSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url),postcss=createRequire(realpathSync('node_modules/next/package.json'))('postcss');
const tokenCss=readFileSync('design-system/tokens/tokens.css','utf8'),root=postcss.parse(tokenCss);
let count=0,min=99;
for(const theme of ['light','dark']){
 const tokens={};root.walkRules(rule=>{if(rule.parent.type==='root'&&(theme==='light'?rule.selector.includes('[data-theme="light"]'):rule.selector==='[data-theme="dark"]'))rule.walkDecls(d=>tokens[d.prop]=d.value);});
 function rgb(v){if(v.startsWith('var('))return rgb(tokens[v.slice(4,-1)]);assert(/^#[0-9a-f]{6}$/i.test(v),v);return [1,3,5].map(i=>parseInt(v.slice(i,i+2),16)/255);}
 const lum=v=>rgb(v).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i],0);
 const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
 function check(fg,bg,label,threshold=4.5){const r=contrast(tokens[fg],tokens[bg]);assert(r>=threshold,`${theme}: ${label}: ${r.toFixed(2)} < ${threshold}`);count++;if(threshold===4.5)min=Math.min(min,r);}
 for(const bg of ['--canvas','--surface','--surface-sunken','--action-soft']){for(const fg of ['--ink','--ink-muted'])check(fg,bg,fg+' on '+bg);check('--focus',bg,'Keyboard focus',3);}
 for(const bg of ['--lavande','--rose','--lilas','--menthe','--beurre','--peche','--citron','--heart-soft'])check('--ink',bg,'Text on '+bg);
 check('--on-action','--action','Action button');check('--on-heart','--heart','Love button');check('--on-ink','--ink','Own message');check('--on-sapin','--sapin','Plant card');check('--pupil','--buddy-citron','Plant care button');
 for(const status of ['--success','--warning','--danger'])check(status,'--surface','Status '+status);
}
// Every supplied design file remains byte-for-byte identical, including the logos.
const manifest=JSON.parse(readFileSync('design-system/source-integrity.json','utf8'));
for(const [path,hash] of Object.entries(manifest))assert.equal(createHash('sha256').update(readFileSync('design-system/'+path)).digest('hex'),hash,'Supplied file changed: '+path);
assert.equal(readFileSync('public/favicon.svg','utf8'),readFileSync('design-system/logos/nous-deux-icone-app.svg','utf8'));
const entry=readFileSync('web/main.tsx','utf8');assert(entry.includes('design-system/components/bundle.css'));assert(!/globals\.css|design\.css|warm\.css|polish\.css|life\.css/.test(entry));
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
const integration=readFileSync('app/application.css','utf8');postcss.parse(integration);
assert(integration.includes('prefers-reduced-motion:reduce'));assert(integration.includes('repeat(2,minmax(0,1fr))'));assert(integration.includes('overscroll-behavior-x:contain'));assert(integration.includes('html[data-modal-open] .workspace{overflow:hidden'));assert(integration.includes('--dialog-viewport'));
const html=readFileSync('index.html','utf8');assert(!/user-scalable=no|maximum-scale=1/.test(html));assert(html.includes('lang="fr"'));assert(readFileSync('app/house-app.tsx','utf8').includes('className="skip-link"'));
console.log(`PASS: ${count} text/control contrast pairs (minimum normal text ${min.toFixed(2)}:1), both delivered themes, source fidelity, semantic component rendering, keyboard alternatives and reduced-motion/reflow guards. Manual RGAA audit still required.`);
