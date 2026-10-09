import {recipeTitles} from './recipe-ids.ts';
import {claimDiscovery,finishDiscovery,discoveryProjection,discoverRecipes,DiscoveryError} from './recipe-discovery.ts';
import {mealProjection,mealVote,MealError} from './meals.ts';
import {parisDate} from './life.ts';
import {chatInput,chatCursorInput,photoInput} from './validation.ts';
import {buildPushPayload} from 'npm:@block65/webcrypto-web-push@2.0.0';
import {claimPlantReminders,authorizeChat,visibleAppointments,ApiError,householdMutation,callMutation,deviceMutation,type State} from './model.ts';
import {defaultPreferences,deviceInput,allowedPushEndpoint} from './communication.ts';
const ORIGIN='https://sabir-art.github.io',BASE='/Nous-deux/';
const enc=new TextEncoder();
const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s))),b=>b.toString(16).padStart(2,'0')).join('');
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const equal=(a:string,b:string)=>{let v=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)v|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return v===0;};
const passwordHash=async(p:string,s:string)=>{const k=await crypto.subtle.importKey('raw',enc.encode(p),'PBKDF2',false,['deriveBits']);return Array.from(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(s),iterations:100000,hash:'SHA-256'},k,256)),b=>b.toString(16).padStart(2,'0')).join('');};
// Service credentials only exist inside the Supabase Edge runtime, never in client code.
const secret=()=>{const keys=Deno.env.get('SUPABASE_SECRET_KEYS');return keys?JSON.parse(keys).default:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');};
async function db(path:string,method='GET',body?:unknown,prefer='return=representation'){const key=secret();if(!key)throw new Error('Missing server configuration');const r=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/'+path,{method,headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{}),'Content-Type':'application/json',Prefer:prefer},...(body===undefined?{}:{body:JSON.stringify(body)})});if(!r.ok)throw new Error('Database request failed');const text=await r.text();return text?JSON.parse(text):null;}
async function state(){const rows=await db('nd_state?id=eq.1&select=version,data');if(!rows[0])throw new Error('Household missing');return rows[0] as {version:number;data:State};}
async function mutate<T>(fn:(s:State)=>T){for(let i=0;i<4;i++){const snapshot=await state();const result=fn(snapshot.data);const rows=await db('nd_state?id=eq.1&version=eq.'+snapshot.version,'PATCH',{data:snapshot.data,version:snapshot.version+1});if(rows.length)return {result,data:snapshot.data};}throw new ApiError(409,'Modification simultanée. Réessayez.');}
async function config(){return (await db('nd_config?id=eq.1&select=data'))[0].data;}
async function send(device:any,data:any){if(!allowedPushEndpoint(device.subscription.endpoint))return false;const keys=(await config()).vapid;const payload=await buildPushPayload({data:JSON.stringify({...data,url:BASE+'?view='+(data.category||'settings')}),options:{ttl:data.category==='calls'?90:3600}},device.subscription,{...keys,subject:ORIGIN+BASE});const r=await fetch(device.subscription.endpoint,{...payload,redirect:'manual',signal:AbortSignal.timeout(5000)});if(r.status===404||r.status===410)await mutate(s=>{s.devices=s.devices.filter(d=>d.deviceId!==device.deviceId);});return r.ok;}
async function notify(s:State,actor:number,category:string,message:string,originDevice=''){await Promise.allSettled(s.devices.filter(d=>d.member!==actor&&d.deviceId!==originDevice&&({...defaultPreferences,...d.preferences})[category]).map(d=>send(d,{title:'À deux',body:message,category,tag:category==='calls'?'adeux-call':undefined})));}
const aiKey=()=>Deno.env.get('OPENAI_API_KEY')||'';
async function runDiscovery(){
 const key=aiKey();if(!key)return;
 try{
  const {result:job,data}=await mutate(s=>claimDiscovery(s,true));if(!job)return;
  try{const recipes=await discoverRecipes(key,[...recipeTitles,...(data.generatedRecipes||[]).map(r=>r.title)],Deno.env.get('OPENAI_RECIPE_MODEL')||'gpt-5.4-mini');await mutate(s=>finishDiscovery(s,job,recipes));}
  catch(e){await mutate(s=>finishDiscovery(s,job,[],e instanceof DiscoveryError?e.code:'upstream'));}
 }catch{/* Never log credentials, prompts, household data or provider response bodies. */}
}
function backgroundDiscovery(){const task=runDiscovery();if(typeof EdgeRuntime!=='undefined')EdgeRuntime.waitUntil(task);return task;}
const cors={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'content-type,apikey,x-house-session,x-adeux-member,x-adeux-device','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Vary':'Origin','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export async function handler(req:Request):Promise<Response>{
 const json=(body:unknown,status=200)=>Response.json(body,{status,headers:cors});
 if(req.headers.get('origin')&&req.headers.get('origin')!==ORIGIN)return json({error:'Origine non autorisée.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(!['GET','POST'].includes(req.method))return json({error:'Méthode non autorisée.'},405);
 try{
 const url=new URL(req.url),route=url.searchParams.get('route')||'',token=req.headers.get('x-house-session')||'';
 let p:any={};if(req.method==='POST'){if(!req.headers.get('content-type')?.includes('application/json'))return json({error:'Format invalide.'},415);const raw=await req.text();if(raw.length>(route==='photos'?361000:36000))return json({error:'Contenu trop long.'},413);p=JSON.parse(raw);}
 if(route==='plant-reminders'){
  if(req.method!=='POST')return json({error:'Méthode non autorisée.'},405);
  const credential=req.headers.get('x-plant-reminder')||'';if(!/^[a-f0-9]{64}$/.test(credential))return json({error:'Accès réservé au planificateur.'},401);
  const cfg=await config();if(!cfg.plantReminderHash||!equal(await hash(credential),cfg.plantReminderHash))return json({error:'Accès réservé au planificateur.'},401);
  const now=new Date(),hour=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Paris',hour:'2-digit',hour12:false}).format(now);if(hour!=='09')return json({ok:true,skipped:true});
  backgroundDiscovery();
  const day=parisDate(now);const {result}=await mutate(s=>claimPlantReminders(s,day));
  const results=await Promise.allSettled(result.map(async({device,count})=>{
   try{const ok=await send(device,{title:'Le petit jardin 🌱',body:count===1?'Une plante réclame son petit spa. Vérifiez ses soins du jour !':`${count} plantes attendent leurs soins. La réunion des feuilles a commencé !`,category:'plants',tag:'adeux-plants'});if(ok)return true;}catch{}
   await mutate(s=>{if(s.plantReminderDays?.[device.deviceId]===day)delete s.plantReminderDays[device.deviceId];});return false;
  }));return json({ok:true,attempted:result.length,sent:results.filter(r=>r.status==='fulfilled'&&r.value).length});
 }
 if(route==='access'){
  const selected=Number(url.searchParams.get('member')??p.member);if(selected!==0&&selected!==1)return json({error:'Choisissez votre compte.'},400);const access=(await db('nd_members?member=eq.'+selected))[0];if(!access)return json({error:'Configuration en cours.'},503);
  if(req.method==='GET')return json({configured:!!access.password_hash});
  if(p.action==='logout'){if(/^[a-f0-9]{64}$/.test(token))await db('nd_sessions?token_hash=eq.'+await hash(token),'DELETE');return json({ok:true});}
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';const key=await hash(ip)+':'+Math.floor(Date.now()/900000);const attempts=await db('rpc/nd_rate_hit','POST',{rate_key:key,expiry:Date.now()+1800000});if(attempts>15)return json({error:'Trop de tentatives. Réessayez dans 15 minutes.'},429);
  if(typeof p.password!=='string'||p.password.length<12||p.password.length>128)return json({error:'Utilisez entre 12 et 128 caractères.'},400);
  if(p.action==='setup'){
   if(access.password_hash)return json({error:'Le mot de passe est déjà défini.'},409);
   if(typeof p.setupToken!=='string'||!equal(await hash(p.setupToken),access.setup_hash))return json({error:'Lien de préparation invalide.'},403);
   const salt=random();const rows=await db('nd_members?member=eq.'+selected+'&password_hash=is.null','PATCH',{salt,password_hash:await passwordHash(p.password,salt),setup_hash:''});if(!rows.length)return json({error:'La maison vient d’être configurée.'},409);
  }else if(p.action==='login'){if(!access.password_hash||!equal(await passwordHash(p.password,access.salt),access.password_hash))return json({error:'Mot de passe incorrect.'},401);}else return json({error:'Action inconnue.'},400);
  const session=random();await db('nd_sessions','POST',{member:selected,token_hash:await hash(session),expires_at:Date.now()+90*86400000});await Promise.all([db('nd_sessions?expires_at=lt.'+Date.now(),'DELETE'),db('nd_rate?expires_at=lt.'+Date.now(),'DELETE')]);return json({ok:true,token:session,member:selected});
 }
 if(!/^[a-f0-9]{64}$/.test(token))return json({error:'Connectez-vous à votre maison.'},401);
 const sessions=await db('nd_sessions?token_hash=eq.'+await hash(token)+'&expires_at=gt.'+Date.now()+'&select=token_hash,member');if(!sessions.length||![0,1].includes(sessions[0].member))return json({error:'Votre session a expiré. Reconnectez-vous.'},401);
 const actor=sessions[0].member;
 if(route==='recipes'){
  if(req.method==='POST'){
   if(p.action==='toggle'){
    if(typeof p.enabled!=='boolean')throw new ApiError(400,'Réglage invalide.');
    await mutate(s=>{s.recipeDiscovery={...s.recipeDiscovery,enabled:p.enabled};});
   }else if(p.action!=='discover')throw new ApiError(400,'Action inconnue.');
   backgroundDiscovery();
  }
  const {data}=await state();return json({recipes:data.generatedRecipes||[],discovery:discoveryProjection(data,!!aiKey())});
 }
 if(route==='meals'){

  if(req.method==='GET'){const {data}=await state();return json(mealProjection(data,actor));}
  const {data}=await mutate(s=>mealVote(s,p,actor));return json(mealProjection(data,actor));
 }
 if(route==='household'){
  if(req.method==='GET'){const {data:s}=await state();return json({member:actor,profiles:s.profiles||{},meals:mealProjection(s,actor),household:s.household,entries:s.entries,items:s.items,appointments:visibleAppointments(s,actor),templates:s.templates||[],ideas:s.ideas||[],plants:s.plants||[]});}
  if(['item','profile-photo'].includes(p.action)&&p.payload?.photoId){const photoId=deviceInput.parse(p.payload.photoId);const photos=await db('nd_photos?id=eq.'+photoId+'&select=owner');if(!photos.length||photos[0].owner!==actor)throw new ApiError(403,'Vous ne pouvez joindre que votre propre photo.');}
  const {result,data}=await mutate(s=>householdMutation(s,p,actor));if(result)try{await notify(data,actor,result.category,'Votre moitié '+result.message,req.headers.get('x-adeux-device')||'');}catch{}return json({ok:true});
 }

 if(route==='photos'){
  if(req.method==='GET'){
   const id=deviceInput.parse(url.searchParams.get('id'));const photo=(await db('nd_photos?id=eq.'+id))[0];if(!photo)throw new ApiError(404,'Photo introuvable.');
   if(photo.owner!==actor){const {data:s}=await state();if(!s.items.some(i=>i.kind==='shopping'&&i.photoId===id)&&!Object.values(s.profiles||{}).includes(id))throw new ApiError(403,'Photo non partagée.');}
   return json({data:photo.data});
  }
  const v=photoInput.parse(p);let bytes='';try{bytes=atob(v.data.slice(23));}catch{throw new ApiError(400,'Photo invalide.');}if(bytes.length>270000||!bytes.startsWith('\xff\xd8')||!bytes.endsWith('\xff\xd9'))throw new ApiError(400,'Choisissez une image JPEG valide.');
  const old=(await db('nd_photos?id=eq.'+v.id+'&select=owner'))[0];if(old&&old.owner!==actor)throw new ApiError(403,'Cette photo appartient à un autre compte.');
  if(!old){const photos=await db('nd_photos?owner=eq.'+actor+'&select=id&limit=1000');if(photos.length>=1000)throw new ApiError(400,'Limite de photos atteinte.');}
  await db('nd_photos?on_conflict=id','POST',{id:v.id,data:v.data,owner:actor},'resolution=ignore-duplicates,return=representation');return json({id:v.id});
 }
 if(route==='chat'){
  if(req.method==='GET'){
   const before=url.searchParams.get('before');let filter='';
   if(before){const c=chatCursorInput.parse({before,beforeId:url.searchParams.get('beforeId')});filter='&or='+encodeURIComponent(`(created_at.lt.${c.before},and(created_at.eq.${c.before},id.lt.${c.beforeId}))`);}
   const messages=await db('nd_messages?select=id,member,text,created_at,edited_at,version&order=created_at.desc,id.desc&limit=60'+filter);
   return json({messages:messages.reverse(),hasMore:messages.length===60});
  }
  const v=chatInput.parse(p);
  if(v.action==='send'){
   // Stable client UUID makes retries safe; a duplicate never changes an existing message.
   await db('nd_messages?on_conflict=id','POST',{id:v.id,member:actor,text:v.text},'resolution=ignore-duplicates,return=representation');return json({ok:true});
  }
  const old=(await db('nd_messages?id=eq.'+v.id))[0];authorizeChat(old,actor,v.version);
  const rows=await db('nd_messages?id=eq.'+v.id+'&member=eq.'+actor+'&version=eq.'+v.version,v.action==='delete'?'DELETE':'PATCH',v.action==='delete'?undefined:{text:v.text,edited_at:new Date().toISOString(),version:v.version!+1});
  if(!rows.length)throw new ApiError(409,'Ce message a changé. Actualisez la discussion.');return json({ok:true});
 }
 if(route==='calls'){
  if(req.method==='GET'){const {data:s}=await state();return json({call:s.call&&s.call.state!=='ended'&&s.call.expiresAt>Date.now()?s.call:null});}
  const {result,data}=await mutate(s=>callMutation(s,{...p,member:actor}));if(p.action==='start')try{await notify(data,actor,'calls','Votre moitié vous appelle. Ouvrez À deux pour répondre.');}catch{}return json(result);
 }
 if(route==='notifications'){
  if(req.method==='GET'){const device=deviceInput.parse(url.searchParams.get('device'));const {data:s}=await state();const d=s.devices.find(d=>d.deviceId===device&&d.member===actor);return json({publicKey:(await config()).vapid.publicKey,enabled:!!d,preferences:{...defaultPreferences,...d?.preferences},activity:s.activity.slice(0,50)});}
  if(p.action==='test'){const device=deviceInput.parse(p.deviceId);const {data:s}=await state();const d=s.devices.find(d=>d.deviceId===device&&d.member===actor);if(!d)return json({error:'Activez les notifications.'},400);return await send(d,{title:'À deux',body:'Les notifications de votre maison sont activées.'})?json({ok:true}):json({error:'Le service de notification a refusé le test.'},502);}
  await mutate(s=>{const d=s.devices.find(d=>d.deviceId===p.deviceId);if(d&&d.member!==actor)throw new ApiError(403,'Cet appareil appartient à un autre compte.');deviceMutation(s,{...p,member:actor});});return json({ok:true});
 }
 return json({error:'Route inconnue.'},404);
 }catch(e){if(e instanceof ApiError||e instanceof MealError)return json({error:e.message},e.status);if(e instanceof SyntaxError||e&&typeof e==='object'&&'issues'in e)return json({error:'Vérifiez les champs du formulaire.'},400);return json({error:'Service temporairement indisponible. Réessayez.'},503);}
}
Deno.serve(handler);
