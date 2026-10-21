import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync,readFileSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
async function bundle(path){const b=await build({entryPoints:[path],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'npm',setup(b){b.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));}}]});return import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));}

// Server: each person edits only their own diet, with bounds, versions and idempotent retries.
const {householdMutation}=await bundle('supabase/functions/house-api/model.ts');
const {dietKeys,dietProjection}=await bundle('supabase/functions/house-api/diets.ts');
const s={household:{first:'Alex',second:'Camille',name:'Test',budget:0,version:1},entries:[],items:[],appointments:[],activity:[],devices:[],call:null,sequence:0};
const mine={member:1,diets:['sans-gluten','vegetarien'],allergies:'kiwi, céleri',version:0};
assert.equal(householdMutation(s,{action:'diet',payload:mine},1),null);
assert.deepEqual(s.diets[1].diets,['vegetarien','sans-gluten']);assert.equal(s.diets[1].version,1);assert.equal(s.diets[0],undefined);
assert.equal(s.activity.length,0,'a diet change is not broadcast to the activity feed');
householdMutation(s,{action:'diet',payload:mine},1);assert.equal(s.diets[1].version,1,'a retried request does not bump the version twice');
assert.throws(()=>householdMutation(s,{action:'diet',payload:{...mine,allergies:'arachide'}},1),e=>e.status===409);
assert.throws(()=>householdMutation(s,{action:'diet',payload:{...mine,version:1}},0),e=>e.status===403,'the partner cannot edit someone else’s diet');
assert.equal(s.diets[1].allergies,'kiwi, céleri');
householdMutation(s,{action:'diet',payload:{diets:['sans-porc'],allergies:'',version:0}},0);assert.deepEqual(s.diets[0].diets,['sans-porc'],'without member, the session actor is used');assert.deepEqual(s.diets[1].diets,['vegetarien','sans-gluten']);
for(const bad of [{diets:['carnivore'],allergies:'',version:1},{diets:['halal','halal'],allergies:'',version:1},{diets:[],allergies:'x'.repeat(301),version:1},{diets:dietKeys.concat('halal'),allergies:'',version:1},{diets:[],allergies:'',version:-1},{diets:'halal',allergies:'',version:1}])assert.throws(()=>householdMutation(s,{action:'diet',payload:bad},0),undefined,JSON.stringify(bad).slice(0,60));
householdMutation(s,{action:'diet',payload:{diets:[],allergies:'  '+'a'.repeat(300)+'  ',version:1}},0);assert.equal(s.diets[0].allergies.length,300);
// « Je mange de tout » is accepted alone, never with another diet; it does not switch on the « Pour nous deux » sorting.
assert.throws(()=>householdMutation(s,{action:'diet',payload:{diets:['de-tout','halal'],allergies:'',version:2}},0),undefined,'eats everything is exclusive');
householdMutation(s,{action:'diet',payload:{diets:['de-tout'],allergies:'',version:2}},0);assert.deepEqual(s.diets[0].diets,['de-tout']);
householdMutation(s,{action:'diet',payload:{diets:[],allergies:'',version:3}},0);assert.deepEqual(s.diets[0].diets,[]);
assert.throws(()=>householdMutation(s,{action:'diet',payload:{diets:[],allergies:'',version:0}},2),e=>e.status===403);
assert.deepEqual(Object.keys(dietProjection(s)),['0','1']);assert.deepEqual(dietProjection({}),{});
const index=readFileSync('supabase/functions/house-api/index.ts','utf8');assert.match(index,/diets:dietProjection\(s\)/,'the household projection exposes both diets');

// Client helper: the same keys as the server, and conservative keyword matching.
const lib=await bundle('lib/diets.ts');const {recipes}=await bundle('lib/recipes.ts');
assert.deepEqual(lib.diets.map(d=>d.key),[...dietKeys]);
const who=(...keys)=>({0:{diets:keys,allergies:'',version:1}});const recipe=(ingredients,group='Végétarien')=>({id:'x',title:'Plat',group,minutes:10,photo:'',servings:2,ingredients,steps:['Cuire']});
assert.ok(lib.compatibleWithUs(recipe(['1 laitue','Huile d’olive']),who('sans-lactose')),'laitue is not lait');
assert.ok(!lib.compatibleWithUs(recipe(['20 cl de crème fraîche']),who('sans-lactose')));
assert.ok(lib.compatibleWithUs(recipe(['400 ml de lait de coco']),who('sans-lactose','vegetalien')));
assert.ok(!lib.compatibleWithUs(recipe(['250 g de spaghetti']),who('sans-gluten')));
assert.ok(lib.compatibleWithUs(recipe(['100 g de farine de riz','1 c. à soupe de pâte de curry']),who('sans-gluten')));
assert.ok(!lib.compatibleWithUs(recipe(['2 filets de poulet'],'Poulet'),who('vegetarien')));
assert.ok(!lib.compatibleWithUs(recipe(['Un ingrédient'],'Poisson'),who('vegetarien')),'the recipe group also counts');
assert.ok(lib.compatibleWithUs(recipe(['1 oignon haché','Persil']),who('vegetarien')));
assert.ok(!lib.compatibleWithUs(recipe(['2 œufs']),who('vegetalien')));assert.ok(lib.compatibleWithUs(recipe(['2 œufs']),who('vegetarien')));
assert.ok(!lib.compatibleWithUs(recipe(['50 g de noisettes']),who('sans-fruits-a-coque')));assert.ok(lib.compatibleWithUs(recipe(['Noix de muscade','Lait de coco']),who('sans-fruits-a-coque')));
assert.ok(!lib.compatibleWithUs(recipe(['10 cl de vin blanc']),who('halal')));assert.ok(lib.compatibleWithUs(recipe(['Vinaigre de cidre doux']),who('halal')));
const halalMeat=lib.recipeIssues(recipe(['300 g de bœuf'],'Bœuf'),who('halal'));assert.equal(halalMeat.length,1);assert.equal(halalMeat[0].hard,false,'meat for halal is a gentle reminder, not an exclusion');
assert.ok(!lib.compatibleWithUs(recipe(['300 g de bœuf','Fromage râpé'],'Bœuf'),who('casher')));assert.ok(!lib.compatibleWithUs(recipe(['Crevettes']),who('casher')));
assert.ok(!lib.compatibleWithUs(recipe(['Crevettes décortiquées']),who('sans-poisson')));
// Free-text allergies, with both members checked.
assert.deepEqual(lib.allergyTerms('Allergie aux kiwis, céleri et moutarde ; aucune'),['kiwi','celeri','moutarde']);assert.deepEqual(lib.allergyTerms("Les lentilles\nl'ananas"),['lentille','anana']);
const both={0:{diets:['sans-porc'],allergies:'',version:1},1:{diets:['sans-gluten'],allergies:'kiwi',version:1}};
assert.ok(!lib.compatibleWithUs(recipe(['2 kiwis','Sucre']),both));
const issues=lib.recipeIssues(recipe(['Pain de mie']),both);assert.equal(issues.length,1);assert.equal(issues[0].member,1);
assert.equal(lib.issueSentence(issues[0],['Alex','Camille']),'Contient peut-être pain, à éviter pour Camille (sans gluten).');
assert.equal(lib.issueSentence(lib.recipeIssues(recipe(['2 kiwis']),both)[0],['Alex','Camille']),'Contient peut-être kiwi : allergie de Camille.');
assert.ok(!lib.hasDiets({0:{diets:['de-tout'],allergies:'',version:1}}),'eating everything sorts nothing');assert.ok(lib.compatibleWithUs(recipe(['Lardons']),who('de-tout')));
assert.ok(!lib.hasDiets({}));assert.ok(!lib.hasDiets({0:{diets:[],allergies:'aucune',version:1}}));assert.ok(lib.hasDiets(both));
// Built-in recipes are all pork-free and some remain for each single diet.
for(const d of lib.diets){const ok=recipes.filter(r=>lib.compatibleWithUs(r,who(d.key)));assert.ok(ok.length>=10,d.key+' keeps choices');}
assert.equal(recipes.filter(r=>!lib.compatibleWithUs(r,who('sans-porc'))).length,0);

// UI wiring: own section in settings, the « Pour nous deux » toggle and the gentle warning.
const settings=readFileSync('app/diet-settings.tsx','utf8'),meals=readFileSync('app/house-meals.tsx','utf8'),detail=readFileSync('app/recipe-detail.tsx','utf8');
assert.match(settings,/Ce que je mange/);assert.match(settings,/key===EATS_EVERYTHING\?\[key\]/,'choosing « Je mange de tout » clears the other diets');assert.match(settings,/aria-pressed=\{selected\.includes/);assert.match(settings,/maxLength=\{allergiesMax\}/);
assert.match(meals,/fits\(r\)\)\.sort/,'the swipe queue skips incompatible recipes when the toggle is on');assert.match(meals,/TogetherToggle/);
assert.match(detail,/Sans porc garanti pour/);assert.match(detail,/issueSentence/);
console.log('PASS: own-diet validation, versions and retries, keyword compatibility, allergies and diet UI wiring.');
