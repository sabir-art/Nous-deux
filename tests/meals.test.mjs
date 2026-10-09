import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync,readFileSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
async function bundle(path){const b=await build({entryPoints:[path],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'npm',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));}}]});return import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));}
const {mealProjection,mealVote,drawChef}=await bundle('supabase/functions/house-api/meals.ts');const {householdMutation}=await bundle('supabase/functions/house-api/model.ts');const {recipes}=await bundle('lib/recipes.ts');const {recipePhotos}=await bundle('lib/recipe-photos.ts');for(const r of recipes){const p=recipePhotos[r.photo];assert(p,'Every recipe has an illustration: '+r.id);assert(new URL(p.url).hostname==='upload.wikimedia.org');assert(p.author&&p.license&&p.source&&p.licenseUrl);}
const {recipeIds}=await bundle('supabase/functions/house-api/recipe-ids.ts');const {parisDate}=await bundle('lib/life.ts');
const date=parisDate(),s={household:{first:'A',second:'B'},items:[],appointments:[],entries:[],activity:[],devices:[],sequence:0};
assert.equal(recipes.length,40);assert.deepEqual(recipes.map(r=>r.id),recipeIds);assert.equal(new Set(recipeIds).size,recipeIds.length);
for(const r of recipes){assert(r.ingredients.length>=3&&r.steps.length>=3);assert(!r.ingredients.some(i=>/\b(porc|lardons?|bacon|jambon|chorizo|vin)\b/i.test(i)));assert.equal(r.servings,2);}
const originalPartner=mealProjection(s,1,date);
assert.equal(householdMutation(s,{action:'meal-vote',payload:{date,recipeId:recipeIds[0],like:true,actor:1,chef:1}},0),null);
assert.deepEqual(mealProjection(s,1,date),originalPartner,'Single like reveals nothing to partner');assert.equal(mealProjection(s,0,date).myVotes[recipeIds[0]],true);assert.equal(s.activity.length,0);assert.equal(s.sequence,0);
mealVote(s,{date,recipeId:recipeIds[1],like:false},0);assert.deepEqual(mealProjection(s,1,date),originalPartner,'Dislikes also stay private');
mealVote(s,{date,recipeId:recipeIds[0],like:true,chef:99},1);assert.equal(s.mealRounds[date].matches.length,1);const match=s.mealRounds[date].matches[0];assert([0,1,2].includes(match.chef));
assert.deepEqual(mealProjection(s,0,date).matches,mealProjection(s,1,date).matches);assert(!Object.hasOwn(mealProjection(s,1,date).myVotes,recipeIds[1]));
mealVote(s,{date,recipeId:recipeIds[0],like:true},1);assert.equal(s.mealRounds[date].matches.length,1);assert.equal(s.mealRounds[date].matches[0].chef,match.chef,'Retry cannot reroll');
assert.throws(()=>mealVote(s,{date,recipeId:recipeIds[0],like:false},1));assert.throws(()=>mealVote(s,{date,recipeId:'unknown',like:true},0));assert.throws(()=>mealVote(s,{date:'2001-01-01',recipeId:recipeIds[0],like:true},0));assert.throws(()=>mealVote(s,{date,recipeId:recipeIds[0],like:'yes'},0));assert.throws(()=>mealVote(s,{date,recipeId:recipeIds[0],like:true},2));
assert.deepEqual(mealProjection(s,0,'2001-01-01'),{date:'2001-01-01',myVotes:{},matches:[]});
// Cover all outcomes plus rejection of the single biased uint32 value.
const native=globalThis.crypto;let samples=[4294967295,0,1,2];Object.defineProperty(globalThis,'crypto',{configurable:true,value:{getRandomValues(a){a[0]=samples.shift();return a;}}});assert.equal(drawChef(),0);assert.equal(drawChef(),1);assert.equal(drawChef(),2);Object.defineProperty(globalThis,'crypto',{configurable:true,value:native});
const id=crypto.randomUUID();householdMutation(s,{action:'profile-photo',payload:{photoId:id,member:1}},0);assert.equal(s.profiles[0],id);assert.equal(s.profiles[1],undefined);
s.items.push({id,kind:'shopping',done:true,version:1,purchasedBy:null});householdMutation(s,{action:'shopping-check',payload:{id,version:1,done:false}},1);assert.equal(s.items[0].done,false,'Legacy unattributed purchase can be undone');
const old='2020-01-01';s.plants=[{id,version:1,waterEvery:7,lightEvery:0,feedEvery:30,lastWater:old,lastLight:old,lastFeed:old,careLog:[]}];householdMutation(s,{action:'plant-care-all',payload:{id,version:1,actor:0}},1);assert.equal(s.plants[0].version,2);assert.equal(s.plants[0].careLog.length,2);assert(s.plants[0].careLog.every(c=>c.actor===1&&c.date===date));assert.equal(s.plants[0].lastLight,old);assert.throws(()=>householdMutation(s,{action:'plant-care-all',payload:{id,version:2}},1),e=>e.status===409);
console.log('PASS: 40 pork-free recipes; secret votes, reciprocal matches, stable fair server draw, actor spoofing, daily sessions, legacy purchase undo, own profile and all due plant care.');
