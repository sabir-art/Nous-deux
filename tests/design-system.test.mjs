// Real application data adapters for the supplied design components, without backend I/O.
import assert from 'node:assert/strict';
import {readFileSync,realpathSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const source=`import React from 'react';import {renderToStaticMarkup as render} from 'react-dom/server';import {BudgetOverview} from './app/design-overviews';import {SplitBar,PiggyBank,DayStrip,TabBar} from './design-system/runtime';import HousePlants from './app/house-plants';
const noop=()=>{},names=['Alex','Camille'];
const props={names,entries:[],total:0,paid:[0,0],credit:1234,budget:0,monthPicker:null,onSettle:noop,onSettings:noop};
const h=React.createElement;
export const views={empty:render(h(BudgetOverview,props)),spent:render(h(BudgetOverview,{...props,total:12345,paid:[10000,2345],budget:20000,entries:[{category:'Courses',cents:12345}]})),pig:render(h(PiggyBank,{label:'Budget',value:123.45,goal:200})),zero:render(h(SplitBar,{title:'Contributions',items:names.map(name=>({name,value:0}))})),day:render(h(DayStrip,{days:[{day:3,dow:'Sam.',label:'samedi 3 octobre'}],selected:3})),nav:render(h(TabBar,{active:'argent',onChange:noop,onAdd:noop})),plant:render(h(HousePlants,{plants:[{id:'p',name:'Monstera',species:'monstera',owner:0,waterEvery:7,lastWater:'2026-10-01',lastLight:'2026-10-01',lastFeed:'2026-10-01',lightEvery:0,feedEvery:0,careLog:[],reminders:false}],names,active:1,busy:false,error:'',save:async()=>true,onNotifications:noop}))};`;
const b=await build({stdin:{contents:source,loader:'tsx',resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',packages:'external',jsx:'automatic',write:false});
const mod={exports:{}};new Function('require','module','exports',b.outputFiles[0].text)(require,mod,mod.exports);const v=mod.exports.views;
for(const html of Object.values(v)){assert(!html.includes('NaN'));assert(!html.includes('undefined'));}
assert(v.empty.includes('12,34'));assert(v.empty.includes('Aucune dépense'));assert(v.empty.includes('nd-piggy-bulle'));assert(v.empty.includes('Sans plafond'));assert(!v.empty.includes(' / 1,00'));assert(!v.empty.includes('Tirelire remplie à'));
assert(v.spent.includes('123,45'));assert(v.spent.includes('Tableau'));assert(v.spent.includes('Camille doit 12,34'));
assert(v.pig.includes('123,45'));assert(v.zero.includes('0 %'));assert(v.day.includes('aria-current="date"'));
assert(v.nav.includes('aria-label="Ajouter"'));assert(v.nav.includes('aria-current="page"'));assert(v.nav.includes('Argent'));assert(v.nav.includes('Nous'));
assert(v.plant.includes('nd-plantb'));assert(!v.plant.includes('aria-label="Modifier Monstera"'),'Partner may perform care, but cannot edit ownership-protected plant settings');
assert(readFileSync('app/house-app.tsx','utf8').includes('<HouseCalls active={active} names={names} expanded={tab===\'calls\'}'),'Calls stay mounted during navigation');
assert(!readFileSync('app/house-meals.tsx','utf8').includes('partnerLikes'),'Do not ship the demo client-side partner ballots');
console.log('PASS: zero and nonzero budgets, cents, actual reimbursement balance, chart table, supplied navigation/calendar/plant rendering, plant edit ownership and private meal adapter.');
