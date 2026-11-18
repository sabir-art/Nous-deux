import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync,readFileSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
async function bundle(path){const b=await build({entryPoints:[path],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'npm',setup(x){x.onResolve({filter:/^npm:zod@/},()=>({path:realpathSync('node_modules/zod/index.js')}));}}]});return import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));}
const {householdMutation:change}=await bundle('supabase/functions/house-api/model.ts');
const {visibleIdeas}=await bundle('supabase/functions/house-api/idea-prep.ts');
const {pushesPartner}=await bundle('supabase/functions/house-api/communication.ts');
const {buildInvitationCard}=await bundle('supabase/functions/house-api/chat-invitation.ts');
const home=()=>({household:{first:'A',second:'B',version:1},entries:[],items:[],appointments:[],activity:[],devices:[],sequence:0});
const uuid=()=>crypto.randomUUID();
const future=(()=>{const d=new Date();d.setUTCDate(d.getUTCDate()+20);return d.toISOString().slice(0,10);})();
const monday=d=>{const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()-(x.getUTCDay()+6)%7);return x.toISOString().slice(0,10);};
const line=(title,kind='buy',extra={})=>({id:uuid(),kind,title,quantity:'',done:false,...extra});
const idea=(extra={})=>({id:uuid(),version:0,title:'Une fondue à la maison',description:'',category:'home',date:future,time:'20:00',location:'',place:null,...extra});

// The author proposes with a preparation; the partner gets it as part of the invitation, nothing more rings.
const s=home(),cheese=line('Fromage à fondue',`buy`,{quantity:'800 g'}),bread=line('Pain de campagne'),wine=line('Vin blanc','buy',{done:true}),table=line('Sortir le caquelon','do');
const i=idea({prep:[cheese,bread,wine,table]});
const note=change(s,{action:'idea',payload:i},0);assert(note,'Proposing still makes the usual invitation note');
let stored=s.ideas[0];assert.equal(stored.prep.version,1);assert.equal(stored.prep.items.length,4);
assert.equal(stored.prep.items.find(x=>x.id===wine.id).doneBy,0,'The author may tick what is already bought');
assert.equal(stored.prep.items.find(x=>x.id===table.id).quantity,'','A thing to do has no quantity');
assert.deepEqual(visibleIdeas(s,1)[0].prep,stored.prep,'The partner reads the preparation');
for(const action of ['idea-prep','idea-prep-check','idea-prep-shopping'])assert.equal(pushesPartner(action),false,action+' never rings the partner');

// Without the box, no preparation at all; a page cached before the feature keeps the stored one.
const plain=idea();change(s,{action:'idea',payload:plain},1);assert.equal(s.ideas[1].prep,undefined);
const {prep:_,...old}=i;change(s,{action:'idea',payload:{...old,version:1,description:'Avec une bougie'}},0);stored=s.ideas[0];
assert.equal(stored.prep.version,1,'No prep field: the preparation stays as it was');const four=stored.prep.items;assert.equal(stored.status,'pending');

// Bounds: 30 lines, 60 characters, 30 for a quantity, unique ids, known kinds.
const tooMany=Array.from({length:31},(_,n)=>line('Article '+n));
assert.throws(()=>change(s,{action:'idea',payload:idea({prep:tooMany})},0));
assert.throws(()=>change(s,{action:'idea-prep',payload:{id:i.id,version:1,items:tooMany}},0));
change(s,{action:'idea-prep',payload:{id:i.id,version:1,items:[...four,...Array.from({length:26},(_,n)=>line('Article '+n))]}},0);assert.equal(s.ideas[0].prep.items.length,30);
change(s,{action:'idea-prep',payload:{id:i.id,version:2,items:four}},0);assert.equal(s.ideas[0].prep.items.length,4);assert.equal(s.ideas[0].prep.version,3);
for(const bad of [[line('x'.repeat(61))],[line('Pain','buy',{quantity:'q'.repeat(31)})],[line('  ')],[line('Pain','shop')],[cheese,cheese],[{...line('Pain'),id:'pas-un-id'}]])
 assert.throws(()=>change(s,{action:'idea-prep',payload:{id:i.id,version:3,items:bad}},0),undefined,JSON.stringify(bad).slice(0,60));
assert.equal(s.ideas[0].prep.version,3,'Refused lists change nothing');

// Rights: only the author writes the list, editing it never resets the agreement.
assert.throws(()=>change(s,{action:'idea-prep',payload:{id:i.id,version:3,items:[line('Truffe')]}},1),e=>e.status===403);
change(s,{action:'idea-response',payload:{id:i.id,version:2,status:'accepted'}},1);assert.equal(s.ideas[0].status,'accepted');assert.equal(s.appointments.length,1);
const before=s.activity.length;
change(s,{action:'idea-prep',payload:{id:i.id,version:3,items:[...s.ideas[0].prep.items,line('Cornichons')]}},0);
assert.equal(s.ideas[0].status,'accepted','A preparation change keeps the yes');assert.equal(s.ideas[0].version,3);assert.equal(s.appointments.length,1);
assert.equal(s.activity.length,before,'No activity for a preparation change');
// Retrying the same list is a no-op; a stale version with another list is a conflict.
const retry={id:i.id,version:3,items:s.ideas[0].prep.items};change(s,{action:'idea-prep',payload:retry},0);assert.equal(s.ideas[0].prep.version,4);
assert.throws(()=>change(s,{action:'idea-prep',payload:{id:i.id,version:3,items:[line('Autre chose')]}},0),e=>e.status===409);

// Both can tick; ticking is idempotent; only who ticked (or the author) unticks.
change(s,{action:'idea-prep-check',payload:{id:i.id,item:bread.id,done:true}},1);
let bought=s.ideas[0].prep.items.find(x=>x.id===bread.id);assert.equal(bought.done,true);assert.equal(bought.doneBy,1);
change(s,{action:'idea-prep-check',payload:{id:i.id,item:bread.id,done:true}},0);assert.equal(bought.doneBy,1,'A repeated tick changes nothing');
change(s,{action:'idea-prep-check',payload:{id:i.id,item:table.id,done:true}},0);
assert.throws(()=>change(s,{action:'idea-prep-check',payload:{id:i.id,item:table.id,done:false}},1),e=>e.status===403);
change(s,{action:'idea-prep-check',payload:{id:i.id,item:bread.id,done:false}},0);assert.equal(s.ideas[0].prep.items.find(x=>x.id===bread.id).done,false,'The author may untick');
change(s,{action:'idea-prep-check',payload:{id:i.id,item:bread.id,done:true}},1);
assert.throws(()=>change(s,{action:'idea-prep-check',payload:{id:i.id,item:uuid(),done:true}},1),e=>e.status===404);
// The author's later edit keeps the partner's ticks (server side) instead of the author's stale view.
const stale=s.ideas[0].prep.items.map(x=>x.id===bread.id?{...x,done:false}:x);change(s,{action:'idea-prep',payload:{id:i.id,version:4,items:[...stale,line('Bougies','do')]}},0);
assert.equal(s.ideas[0].prep.items.find(x=>x.id===bread.id).done,true);assert.equal(s.ideas[0].prep.items.find(x=>x.id===bread.id).doneBy,1);

// « Ajouter le reste aux courses » : what is left to buy, in the week of the moment, once per operation.
const op=uuid(),count=s.items.length;change(s,{action:'idea-prep-shopping',payload:{id:i.id,operationId:op}},1);
const added=s.items.slice(count);assert.deepEqual(added.map(x=>x.title).sort(),['Cornichons','Fromage à fondue']);
assert(added.every(x=>x.kind==='shopping'&&x.weekStart===monday(future)&&x.owner===1&&!x.done));assert.equal(added.find(x=>x.title==='Fromage à fondue').quantity,'800 g');
change(s,{action:'idea-prep-shopping',payload:{id:i.id,operationId:op}},1);assert.equal(s.items.length,count+2,'A retry adds nothing');
assert.throws(()=>change(s,{action:'idea-prep-shopping',payload:{id:i.id,operationId:uuid()}},0),e=>e.status===400,'Nothing left: a clear message');
assert(s.ideas[0].prep.items.filter(x=>x.shoppingItem).every(x=>s.items.some(y=>y.id===x.shoppingItem)));
// A past moment goes to this week's list, never to a closed week.
const past=idea({date:'2025-01-10',time:'',prep:[line('Chocolat')]});change(s,{action:'idea',payload:past},0);change(s,{action:'idea-prep-shopping',payload:{id:past.id,operationId:uuid()}},0);
assert(s.items.at(-1).weekStart>=monday(new Date().toISOString().slice(0,10))||s.items.at(-1).weekStart>=monday(new Date(Date.now()-86400000).toISOString().slice(0,10)));

// Unchecking the box removes the preparation (author only); deleting the idea removes it too.
change(s,{action:'idea-prep',payload:{id:past.id,version:1,items:null}},0);assert.equal(s.ideas.find(x=>x.id===past.id).prep,undefined);
change(s,{action:'idea',payload:{...i,version:3,prep:null}},0);assert.equal(s.ideas[0].prep,undefined,'Unchecking « Préparer ce moment » on edit drops it');
assert.throws(()=>change(s,{action:'idea-prep',payload:{id:uuid(),version:0,items:[]}},0),e=>e.status===404);

// Confidentiality: a secret or private idea of the partner, and its preparation, stay invisible and untouchable.
const secret={...idea(),id:uuid(),owner:1,version:1,status:'pending',responseNote:'',secret:true,prep:{version:1,items:[{...line('Bague'),doneBy:null}]}};
const hidden={...idea(),id:uuid(),owner:1,version:1,status:'pending',responseNote:'',visibility:'private',prep:{version:1,items:[{...line('Billets'),doneBy:null}]}};
s.ideas.push(secret,hidden);
assert(!visibleIdeas(s,0).some(x=>x.id===secret.id||x.id===hidden.id),'The partner never reads them');assert(visibleIdeas(s,1).some(x=>x.id===secret.id),'Their author does');
for(const target of [secret,hidden]){
 assert.throws(()=>change(s,{action:'idea-prep-check',payload:{id:target.id,item:target.prep.items[0].id,done:true}},0),e=>e.status===404);
 assert.throws(()=>change(s,{action:'idea-prep-shopping',payload:{id:target.id,operationId:uuid()}},0),e=>e.status===404);
 assert.throws(()=>change(s,{action:'idea-prep',payload:{id:target.id,version:1,items:[]}},0),e=>e.status===404);
}
assert.equal(secret.prep.items[0].done,false);
// The chat envelope keeps its minimal snapshot: no preparation inside.
const shared=s.ideas.find(x=>x.id===plain.id);shared.prep={version:1,items:[{...line('Fleurs'),doneBy:null}]};
assert(!JSON.stringify(buildInvitationCard(s,plain.id,0).data).includes('Fleurs'));
assert.throws(()=>change(s,{action:'idea-prep-check',payload:{id:plain.id,item:shared.prep.items[0].id,done:true}},2),e=>e.status===403,'A personal account is required');
console.log('PASS: preparation saved with the idea, kept by cached pages, bounds, author-only list, ticks by both, agreement untouched, retries, shopping once in the right week, removal, secret/private ideas invisible.');

// Interface: the « Je te date » wording and the optional box.

// « T’inquiète, je m’occupe de tout » (author, with or without a list) and « Je m’occupe du reste » (either of us).
{const h=home(),bread2=line('Pain'),cheese2=line('Fromage');
 const a=idea({prep:null,allMine:true});change(h,{action:'idea',payload:a},0);
 assert.deepEqual(h.ideas[0].prep,{version:1,items:[],allMine:true},'only the promise, no list');
 assert.deepEqual(visibleIdeas(h,1)[0].prep.allMine,true,'the partner reads it');
 assert.throws(()=>change(h,{action:'idea-prep-rest',payload:{id:a.id,take:true}},1),e=>e.status===400,'nothing left to take');
 // Unticking with no list removes the preparation; a cached page (no allMine field) keeps it.
 const {allMine:_a,...cached}=a;change(h,{action:'idea',payload:{...cached,version:1,description:'Bougies'}},0);assert.equal(h.ideas[0].prep.allMine,true,'cached page keeps the promise');
 change(h,{action:'idea-prep',payload:{id:a.id,version:1,items:null,allMine:false}},0);assert.equal(h.ideas[0].prep,undefined,'unticked without a list: no preparation');
 // A list without the promise: the partner takes the rest, only they let it go; the author cannot take it for them.
 const b=idea({prep:[bread2,cheese2],allMine:false});change(h,{action:'idea',payload:b},0);const stored=()=>h.ideas.find(x=>x.id===b.id).prep;
 assert.equal(stored().allMine,undefined);assert.equal(stored().restBy,undefined);
 change(h,{action:'idea-prep-rest',payload:{id:b.id,take:true}},1);assert.equal(stored().restBy,1);
 change(h,{action:'idea-prep-rest',payload:{id:b.id,take:true}},1);assert.equal(stored().restBy,1,'twice: same');
 assert.throws(()=>change(h,{action:'idea-prep-rest',payload:{id:b.id,take:true}},0),e=>e.status===409);
 assert.throws(()=>change(h,{action:'idea-prep-rest',payload:{id:b.id,take:false}},0),e=>e.status===403);
 assert.equal(pushesPartner('idea-prep-rest'),false,'never rings');
 // Editing the list keeps who takes the rest; the promise clears it.
 change(h,{action:'idea-prep',payload:{id:b.id,version:1,items:[bread2]}},0);assert.equal(stored().restBy,1);assert.equal(stored().version,2);
 change(h,{action:'idea-prep',payload:{id:b.id,version:2,items:[bread2],allMine:true}},0);assert.equal(stored().allMine,true);assert.equal(stored().restBy,undefined);assert.equal(stored().items.length,1,'the list stays with the promise');
 change(h,{action:'idea-prep',payload:{id:b.id,version:3,items:[bread2],allMine:true}},0);assert.equal(stored().version,3,'same request twice: nothing changes');
 change(h,{action:'idea-prep',payload:{id:b.id,version:3,items:[bread2],allMine:false}},0);assert.equal(stored().allMine,undefined);
 change(h,{action:'idea-prep-rest',payload:{id:b.id,take:true}},1);change(h,{action:'idea-prep-rest',payload:{id:b.id,take:false}},1);assert.equal(stored().restBy,undefined,'let go');
 assert.equal(h.ideas.find(x=>x.id===b.id).status,'pending','agreement untouched');
 assert.throws(()=>change(h,{action:'idea',payload:idea({allMine:'oui'})},0),undefined,'allMine is a boolean');}
// A little note on the preparation, by the author only, kept by cached pages, bounded.
{const h=home(),it=line('Jus'),n=idea({prep:[it],prepNote:'Il ne restait que celui-là'});change(h,{action:'idea',payload:n},0);
 assert.equal(h.ideas[0].prep.note,'Il ne restait que celui-là');assert.equal(visibleIdeas(h,1)[0].prep.note,'Il ne restait que celui-là');
 const {prepNote:_n,...cached}=n;change(h,{action:'idea',payload:{...cached,version:1}},0);assert.equal(h.ideas[0].prep.note,'Il ne restait que celui-là','cached page keeps the note');
 change(h,{action:'idea-prep',payload:{id:n.id,version:1,items:[it],note:''}},0);assert.equal(h.ideas[0].prep.note,undefined,'note cleared');
 change(h,{action:'idea-prep',payload:{id:n.id,version:2,items:[it],note:'Bio'}},0);assert.equal(h.ideas[0].prep.note,'Bio');assert.equal(h.ideas[0].prep.version,3);
 assert.throws(()=>change(h,{action:'idea-prep',payload:{id:n.id,version:3,items:[it],note:'x'.repeat(281)}},0));
 assert.throws(()=>change(h,{action:'idea-prep',payload:{id:n.id,version:3,items:[it],note:'Moi'}},1),e=>e.status===403,'only the author writes it');
 assert.throws(()=>change(h,{action:'idea',payload:idea({prep:[line('A')],prepNote:'y'.repeat(281)})},0));}
const ideas=readFileSync('app/house-ideas.tsx','utf8'),app=readFileSync('app/house-app.tsx','utf8'),cards=readFileSync('app/chat-house-cards.tsx','utf8');
assert(app.includes("'Je te date',Heart"),'The + menu offers « Je te date » with its heart');
assert(!app.includes("'Une idée'"));assert(!/Proposer une idée/.test(ideas+cards));
for(const text of ['Préparer ce moment','Ajouter le reste aux courses','Je te date','Je m’occupe du reste','T’inquiète, je m’occupe de tout'])assert(ideas.includes(text),text);
console.log('PASS: « Je te date » in the + menu, the ideas page and the chat, « Préparer ce moment » and its shopping button.');
