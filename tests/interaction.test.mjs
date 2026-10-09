import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
async function bundle(path){const b=await build({entryPoints:[path],bundle:true,platform:'node',format:'esm',write:false});return import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));}
const {MealQueue}=await bundle('lib/meal-queue.ts');const {swipeAxis,swipeChoice}=await bundle('lib/swipe.ts');
assert.equal(swipeAxis(4,3,'pending'),'pending');assert.equal(swipeAxis(14,3,'pending'),'x');assert.equal(swipeAxis(6,18,'pending'),'y');assert.equal(swipeAxis(50,3,'y'),'y','An established vertical scroll never changes into a vote');
assert.equal(swipeChoice(100,15,200,360,'x'),true);assert.equal(swipeChoice(-100,5,200,360,'x'),false);assert.equal(swipeChoice(30,3,40,360,'x'),true,'Short quick flick');assert.equal(swipeChoice(30,3,300,360,'x'),null);assert.equal(swipeChoice(90,120,200,360,'x'),null);assert.equal(swipeChoice(90,3,200,360,'y'),null);
let sent=[],resolvers=[];const queue=new MealQueue(b=>new Promise(resolve=>{sent.push(b);resolvers.push(resolve);}));
const date='2026-10-09';queue.hydrate({date,myVotes:{},matches:[]});queue.vote('dish-a',true);queue.vote('dish-b',false);queue.vote('dish-a',false);
assert.equal(queue.snapshot().pending,2);assert.deepEqual(queue.snapshot().meals.myVotes,{'dish-a':true,'dish-b':false});assert.deepEqual(queue.snapshot().meals.matches,[],'Never fabricate an optimistic match');assert.equal(sent.length,1,'Serialized requests prevent write races');
const tick=()=>new Promise(r=>setImmediate(r));resolvers.shift()({date,myVotes:{'dish-a':true},matches:[]});await tick();assert.equal(sent.length,2);assert.equal(queue.snapshot().pending,1);
const match={recipeId:'dish-a',chef:2,createdAt:'2026-10-09'};resolvers.shift()({date,myVotes:{'dish-a':true,'dish-b':false},matches:[match]});await tick();assert.equal(queue.snapshot().pending,0);assert.deepEqual(queue.snapshot().meals.matches,[match]);
queue.hydrate({date,myVotes:{},matches:[]});assert.equal(queue.snapshot().meals.myVotes['dish-b'],false,'An older household poll cannot undo a confirmed vote');assert.deepEqual(queue.snapshot().meals.matches,[match]);
let fail=true;const retry=new MealQueue(async b=>{if(fail)throw Error('Offline');return {date,myVotes:{[b.recipeId]:b.like},matches:[]};});retry.hydrate({date,myVotes:{},matches:[]});retry.vote('c',true);await tick();assert.equal(retry.snapshot().pending,1);assert.equal(retry.snapshot().error,'Offline');fail=false;retry.retry();await tick();assert.equal(retry.snapshot().pending,0);
retry.hydrate({date:'2026-10-10',myVotes:{},matches:[]});assert.deepEqual(retry.snapshot().meals.myVotes,{});retry.hydrate({date,myVotes:{c:true},matches:[match]});assert.equal(retry.snapshot().meals.date,'2026-10-10');
const paused=new MealQueue(()=>Promise.reject(Error('no network')));paused.hydrate({date,myVotes:{},matches:[]});paused.stop();paused.vote('secret',true);await tick();assert.equal(paused.snapshot().meals.matches.length,0);
console.log('PASS: gesture axis lock, slow movement vs flick, optimistic private ballots, serial idempotent synchronization, stale polls, retry, midnight and logout.');
