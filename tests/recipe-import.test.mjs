import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
const {build}=createRequire(realpathSync('node_modules/wrangler/package.json'))('esbuild');
const b=await build({entryPoints:['supabase/functions/house-api/recipe-import.ts'],bundle:true,platform:'node',format:'esm',write:false});
const m=await import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));
const {isPrivateAddress,checkImportUrl,fetchRecipePage,jsonLdRecipe,recipeFromJsonLd,finalizeImport,isoMinutes,pageText,importFromUrl,importFromImage,importRequest,validImportImage,cleanText,importMessages,containsPork}=m;
const code=c=>e=>e?.code===c;

// SSRF guard: addresses.
for(const ip of ['127.0.0.1','10.1.2.3','172.16.0.1','172.31.255.255','192.168.1.1','169.254.169.254','100.64.0.1','0.0.0.0','224.0.0.1','255.255.255.255','198.18.0.1','::1','::','fe80::1','fc00::1','fd12:3456::1','ff02::1','::ffff:127.0.0.1','::ffff:7f00:1','64:ff9b::a9fe:a9fe','2001:db8::1','2002:c0a8:0101::1','2001::1','not-an-ip','1.2.3'])assert.equal(isPrivateAddress(ip),true,ip);
for(const ip of ['93.184.216.34','8.8.8.8','172.32.0.1','2606:4700:4700::1111','2a00:1450:4007:80f::200e','2002:5db8:d822::1'])assert.equal(isPrivateAddress(ip),false,ip);
// SSRF guard: URL syntax.
for(const url of ['http://www.marmiton.org/x','ftp://x.org','https://user:pass@site.fr/','https://site.fr:8443/','javascript:alert(1)','','x'.repeat(2001),42])assert.throws(()=>checkImportUrl(url),code('url'),String(url).slice(0,40));
for(const url of ['https://127.0.0.1/','https://2130706433/','https://0x7f.1/','https://[::1]/','https://localhost/','https://intranet/','https://printer.local/','https://metadata.google.internal/','https://router.home.arpa/'])assert.throws(()=>checkImportUrl(url),code('blocked'),url);
assert.equal(checkImportUrl(' https://www.marmiton.org/recettes/x.aspx#avis ').href,'https://www.marmiton.org/recettes/x.aspx');

// Fetch: DNS checked on every hop, ≤3 redirects, HTML only, bounded size, no credentials.
const html=`<html><head><title>Curry doux</title><meta property="og:site_name" content="Cuisine &amp; Co"><script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebPage"},{"@type":["Recipe"],"name":"Curry de pois chiches &amp; épinards","recipeYield":"4 personnes","totalTime":"PT35M","image":"https://cdn.example.org/unlicensed.jpg","recipeIngredient":["400 g de pois chiches","<b>200 g</b> d’épinards","1 oignon"],"recipeInstructions":[{"@type":"HowToSection","name":"Préparation","itemListElement":[{"@type":"HowToStep","text":"Émincer l’oignon."},{"@type":"HowToStep","text":"Faire revenir 5 minutes."}]},"Ajouter le reste et mijoter 20 minutes."]}]}</script></head><body><p>Hello</p></body></html>`;
const resolveTo=map=>async host=>map[host]??['93.184.216.34'];
const page=(body,headers={})=>new Response(body,{status:200,headers:{'content-type':'text/html; charset=utf-8',...headers}});
let seen=[];
const ok=await fetchRecipePage(new URL('https://a.cuisine.fr/r'),async(url,init)=>{seen.push(url);assert.equal(init.redirect,'manual');assert.equal(init.credentials,'omit');assert(!('cookie'in(init.headers||{})));if(url==='https://a.cuisine.fr/r')return new Response(null,{status:301,headers:{location:'/r2'}});return page(html);},resolveTo({}));
assert.equal(ok.url,'https://a.cuisine.fr/r2');assert.deepEqual(seen,['https://a.cuisine.fr/r','https://a.cuisine.fr/r2']);
await assert.rejects(fetchRecipePage(new URL('https://a.cuisine.fr/r'),async()=>new Response(null,{status:302,headers:{location:'https://evil.cuisine.fr/'}}),resolveTo({'evil.cuisine.fr':['169.254.169.254']})),code('blocked'),'Redirect target is resolved and re-checked');
await assert.rejects(fetchRecipePage(new URL('https://a.cuisine.fr/r'),async()=>new Response(null,{status:302,headers:{location:'http://a.cuisine.fr/plain'}}),resolveTo({})),code('url'),'No downgrade to http');
await assert.rejects(fetchRecipePage(new URL('https://a.cuisine.fr/r'),async()=>new Response(null,{status:302,headers:{location:'https://127.0.0.1/'}}),resolveTo({})),code('blocked'));
let hops=0;await assert.rejects(fetchRecipePage(new URL('https://a.cuisine.fr/0'),async()=>{hops++;return new Response(null,{status:302,headers:{location:'/'+hops}});},resolveTo({})),code('fetch'));assert.equal(hops,4,'Initial request plus at most 3 redirects');
await assert.rejects(fetchRecipePage(new URL('https://rebind.cuisine.fr/'),async()=>assert.fail('never fetched'),resolveTo({'rebind.cuisine.fr':['93.184.216.34','10.0.0.5']})),code('blocked'),'Any private answer blocks the host');
await assert.rejects(fetchRecipePage(new URL('https://a.cuisine.fr/'),async()=>assert.fail('never fetched'),resolveTo({'a.cuisine.fr':[]})),code('fetch'));
await assert.rejects(fetchRecipePage(new URL('https://a.cuisine.fr/'),async()=>assert.fail('never fetched'),async()=>{throw Error('dns unavailable');}),code('fetch'),'Fails closed without DNS');
await assert.rejects(fetchRecipePage(new URL('https://a.cuisine.fr/'),async()=>new Response('{}',{headers:{'content-type':'application/json'}}),resolveTo({})),code('not-html'));
await assert.rejects(fetchRecipePage(new URL('https://a.cuisine.fr/'),async()=>page('x'.repeat(3000001)),resolveTo({})),code('too-large'));
await assert.rejects(fetchRecipePage(new URL('https://a.cuisine.fr/'),async()=>new Response('nope',{status:404,headers:{'content-type':'text/html'}}),resolveTo({})),code('fetch'));

// JSON-LD first.
const node=jsonLdRecipe(html);assert.equal(node.name,'Curry de pois chiches &amp; épinards');
const draft=recipeFromJsonLd(node);assert.equal(draft.title,'Curry de pois chiches & épinards');assert.deepEqual(draft.ingredients,['400 g de pois chiches','200 g d’épinards','1 oignon']);assert.deepEqual(draft.steps,['Émincer l’oignon.','Faire revenir 5 minutes.','Ajouter le reste et mijoter 20 minutes.']);assert.equal(draft.minutes,35);assert.equal(draft.servings,4);
assert.equal(isoMinutes('PT1H15M'),75);assert.equal(isoMinutes('P1DT2H'),1560);assert.equal(isoMinutes('20 min'),null);assert.equal(jsonLdRecipe('<script type="application/ld+json">{not json</script>'),null);
assert.equal(recipeFromJsonLd(jsonLdRecipe('<script type=application/ld+json>[{"@type":"Recipe","name":"Soupe","recipeIngredient":"1 poireau","recipeInstructions":"Couper.<br>Cuire."}]</script>')).steps.length,2);
let aiCalls=0;const noModel=async(url,init)=>{if(String(url).startsWith('https://api.openai.com')){aiCalls++;throw Error('no model for structured pages');}return page(html);};
const structured=await importFromUrl('https://www.cuisine.fr/curry',{key:'',model:'m',fetcher:noModel,resolve:resolveTo({})});
assert.equal(structured.method,'structured');assert.equal(aiCalls,0,'JSON-LD needs no AI and no key');assert.equal(structured.recipe.sourceUrl,'https://www.cuisine.fr/curry');assert.equal(structured.recipe.sourceTitle,'Cuisine & Co');assert(!JSON.stringify(structured).includes('unlicensed.jpg'),'Page images are never hotlinked');
await assert.rejects(importFromUrl('https://www.cuisine.fr/curry',{key:'',model:'m',fetcher:async()=>page(html.replace('400 g de pois chiches','200 g de lardons fumés')),resolve:resolveTo({})}),code('pork'));

// Fallback: model on page text only, bounded and with untrusted-content instructions.
const plain='<html><head><title>Tarte</title><script>var secret=1</script><style>p{}</style></head><body><nav>Menu</nav><h1>Tarte aux poireaux</h1><p>'+'Ingrédients pour 4 : 3 poireaux, 1 pâte brisée, 2 œufs, 20 cl de crème. '.repeat(5)+'</p></body></html>';
const text=pageText(plain);assert(text.includes('Tarte aux poireaux'));assert(!text.includes('secret')&&!text.includes('Menu')&&!text.includes('<'));assert(pageText('<p>'+'a'.repeat(40000)+'</p>').length<=15000);
await assert.rejects(importFromUrl('https://www.cuisine.fr/tarte',{key:'',model:'m',fetcher:async()=>page(plain),resolve:resolveTo({})}),code('needs-ai'));
const modelDraft={isRecipe:true,containsPork:false,title:'Tarte aux poireaux',group:'Végétarien',difficulty:'Facile',minutes:50,servings:2,ingredients:['1 pâte brisée','2 poireaux','1 œuf','10 cl de crème'],steps:['Émincer les poireaux.','Les faire fondre 10 minutes.','Garnir la pâte et cuire 30 minutes à 180 °C.'],credit:''};
const reply=v=>Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(v)}]}]});
let sent;const viaAI=await importFromUrl('https://www.cuisine.fr/tarte',{key:'test-secret-only',model:'gpt-test',resolve:resolveTo({}),fetcher:async(url,init)=>{if(String(url)==='https://api.openai.com/v1/responses'){sent=JSON.parse(init.body);assert.equal(init.headers.Authorization,'Bearer test-secret-only');assert.equal(init.redirect,'error');return reply(modelDraft);}assert(!JSON.stringify(init).includes('test-secret-only'),'Key never sent to the recipe site');return page(plain);}});
assert.equal(viaAI.method,'ai');assert.equal(viaAI.recipe.servings,2);assert.equal(viaAI.recipe.sourceUrl,'https://www.cuisine.fr/tarte');assert.equal(sent.store,false);assert.equal(sent.max_output_tokens,3000);assert.equal(sent.text.format.strict,true);assert(!sent.tools,'No web tools during import');assert(sent.instructions.includes('non fiable'));assert(!JSON.stringify(sent).includes('secret=1'));
for(const [changes,expected] of [[{containsPork:true},'pork'],[{isRecipe:false},'not-recipe'],[{ingredients:['200 g de jambon','1 pâte']},'pork'],[{steps:['Ajouter la gélatine.']},'pork'],[{title:''},'not-recipe']])await assert.rejects(importFromUrl('https://www.cuisine.fr/tarte',{key:'k',model:'m',resolve:resolveTo({}),fetcher:async url=>String(url).includes('openai')?reply({...modelDraft,...changes}):page(plain)}),code(expected),expected);
// Provider errors become controlled categories without provider details.
for(const [response,expected] of [[new Response('private provider details',{status:401}),'credentials'],[Response.json({error:{code:'insufficient_quota'}},{status:429}),'quota'],[Response.json({error:{code:'rate_limit_exceeded'}},{status:429}),'limited'],[new Response('boom',{status:500}),'upstream'],[Response.json({status:'incomplete'}),'incomplete'],[Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'not json'}]}]}),'format']])await assert.rejects(importFromUrl('https://www.cuisine.fr/tarte',{key:'k',model:'m',resolve:resolveTo({}),fetcher:async url=>String(url).includes('openai')?response.clone():page(plain)}),e=>e.code===expected&&!e.message.includes('private'),expected);

// Images: strict JPEG data URL, high detail, never saved by the import.
const jpeg='data:image/jpeg;base64,'+Buffer.concat([Buffer.from([0xff,0xd8,0xff,0xe0]),Buffer.alloc(2000,1),Buffer.from([0xff,0xd9])]).toString('base64');
assert(validImportImage(jpeg));for(const bad of ['data:image/png;base64,iVBOR','data:image/jpeg;base64,/9j/'+'A'.repeat(1400000),'https://example.org/x.jpg',jpeg.replace('/9j/','/9j/<'),null])assert.equal(validImportImage(bad),false);
await assert.rejects(importFromImage(jpeg,'','m',async()=>assert.fail('no call without key')),code('unconfigured'));
const fromPhoto=await importFromImage(jpeg,'k','m',async(url,init)=>{const body=JSON.parse(init.body);assert.equal(body.input[0].content[0].type,'input_image');assert.equal(body.input[0].content[0].detail,'high');assert.equal(body.input[0].content.length,1,'Only the chosen image is sent');return reply({...modelDraft,credit:'Mon livre <i>de cuisine</i>',group:'Inconnu',minutes:-4,servings:99});});
assert.equal(fromPhoto.sourceTitle,'Mon livre de cuisine');assert.equal(fromPhoto.sourceUrl,'');assert.equal(fromPhoto.group,'Autre');assert.equal(fromPhoto.minutes,30);assert.equal(fromPhoto.servings,2);
// Validation clamps and cleans every field.
const long=finalizeImport({title:'T'.repeat(300),ingredients:Array(60).fill('x'.repeat(400)),steps:Array(50).fill('<script>alert(1)</script> Cuire'),minutes:20,servings:2,group:'Poisson'},{url:'javascript:alert(1)',title:'Site'});
assert.equal(long.title.length,100);assert.equal(long.ingredients.length,40);assert(long.ingredients.every(i=>i.length<=200));assert.equal(long.steps.length,30);assert(long.steps.every(s=>!/[<>]/.test(s)));assert.equal(long.sourceUrl,'');
assert.equal(cleanText('a\u0000b <i>3</i> < 4',20),'a b 3 4');for(const word of ['Chipolatas grillées','gelatin sheets','Rillettes maison','200 g de porc'])assert(containsPork(word),word);assert(!containsPork('Poulet au citron'));
const body=importRequest('m',{text:'x'});assert.equal(body.store,false);assert.equal(body.reasoning.effort,'low');
for(const [status,message] of Object.values(importMessages)){assert.notEqual(status,401,'Never sign the member out');assert(/[a-zé]/.test(message));}
// Web Share Target: manifest params and link extraction from shared title/text/url.
const manifest=JSON.parse((await import('node:fs')).readFileSync('public/manifest.webmanifest','utf8'));
assert.deepEqual(manifest.share_target,{action:'/Nous-deux/',method:'GET',enctype:'application/x-www-form-urlencoded',params:{title:'share_title',text:'share_text',url:'share_url'}});
const share=await build({entryPoints:['app/share-target.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {sharedLink,takeSharedRecipe}=await import('data:text/javascript;base64,'+Buffer.from(share.outputFiles[0].text).toString('base64'));
assert.equal(sharedLink([null,'Regarde ça : https://www.cuisine.fr/tarte-poireaux.html !','Tarte']),'https://www.cuisine.fr/tarte-poireaux.html');
assert.equal(sharedLink(['https://www.cuisine.fr/a?b=1).',null]),'https://www.cuisine.fr/a?b=1');assert.equal(sharedLink(['http://insecure.fr/x','Pas de lien']),'');assert.equal(takeSharedRecipe(),'');
console.log('PASS: import SSRF guard (https, DNS per hop, ≤3 redirects, size/type limits), JSON-LD first, bounded model fallback, pork refusal, field validation, controlled errors and key confinement.');
