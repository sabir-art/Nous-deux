import {buildPushPayload} from 'npm:@block65/webcrypto-web-push@2.0.0';
import {visibleAppointments,ApiError,householdMutation,callMutation,deviceMutation,type State} from './model.ts';
import {defaultPreferences,deviceInput,allowedPushEndpoint} from './communication.ts';
const ORIGIN='https://sabir-art.github.io',BASE='/Nous-deux/';
const enc=new TextEncoder();
const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s))),b=>b.toString(16).padStart(2,'0')).join('');
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const equal=(a:string,b:string)=>{let v=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)v|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return v===0;};
const passwordHash=async(p:string,s:string)=>{const k=await crypto.subtle.importKey('raw',enc.encode(p),'PBKDF2',false,['deriveBits']);return Array.from(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(s),iterations:100000,hash:'SHA-256'},k,256)),b=>b.toString(16).padStart(2,'0')).join('');};
// Service credentials only exist inside the Supabase Edge runtime, never in client code.
const secret=()=>{const keys=Deno.env.get('SUPABASE_SECRET_KEYS');return keys?JSON.parse(keys).default:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');};
async function db(path:string,method='GET',body?:unknown){const key=secret();if(!key)throw new Error('Missing server configuration');const r=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/'+path,{method,headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{}),'Content-Type':'application/json',Prefer:'return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)})});if(!r.ok)throw new Error('Database request failed');const text=await r.text();return text?JSON.parse(text):null;}
async function state(){const rows=await db('nd_state?id=eq.1&select=version,data');if(!rows[0])throw new Error('Household missing');return rows[0] as {version:number;data:State};}
async function mutate<T>(fn:(s:State)=>T){for(let i=0;i<4;i++){const snapshot=await state();const result=fn(snapshot.data);const rows=await db('nd_state?id=eq.1&version=eq.'+snapshot.version,'PATCH',{data:snapshot.data,version:snapshot.version+1});if(rows.length)return {result,data:snapshot.data};}throw new ApiError(409,'Modification simultanée. Réessayez.');}
async function config(){return (await db('nd_config?id=eq.1&select=data'))[0].data;}
async function send(device:any,data:any){if(!allowedPushEndpoint(device.subscription.endpoint))return false;const keys=(await config()).vapid;const payload=await buildPushPayload({data:JSON.stringify({...data,url:BASE+'?view='+(data.category||'settings')}),options:{ttl:data.category==='calls'?90:3600}},device.subscription,{...keys,subject:ORIGIN+BASE});const r=await fetch(device.subscription.endpoint,{...payload,redirect:'manual',signal:AbortSignal.timeout(5000)});if(r.status===404||r.status===410)await mutate(s=>{s.devices=s.devices.filter(d=>d.deviceId!==device.deviceId);});return r.ok;}
async function notify(s:State,actor:number,category:string,message:string,originDevice=''){await Promise.allSettled(s.devices.filter(d=>d.member!==actor&&d.deviceId!==originDevice&&(d.preferences||defaultPreferences)[category]).map(d=>send(d,{title:'À deux',body:message,category,tag:category==='calls'?'adeux-call':undefined})));}
const cors={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'content-type,apikey,x-house-session,x-adeux-member,x-adeux-device','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Vary':'Origin','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export async function handler(req:Request):Promise<Response>{
 const json=(body:unknown,status=200)=>Response.json(body,{status,headers:cors});
 if(req.headers.get('origin')&&req.headers.get('origin')!==ORIGIN)return json({error:'Origine non autorisée.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(!['GET','POST'].includes(req.method))return json({error:'Méthode non autorisée.'},405);
 try{
 const url=new URL(req.url),route=url.searchParams.get('route')||'',token=req.headers.get('x-house-session')||'';
 let p:any={};if(req.method==='POST'){if(!req.headers.get('content-type')?.includes('application/json'))return json({error:'Format invalide.'},415);const raw=await req.text();if(raw.length>36000)return json({error:'Contenu trop long.'},413);p=JSON.parse(raw);}
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
 if(route==='household'){
  if(req.method==='GET'){const {data:s}=await state();return json({member:actor,household:s.household,entries:s.entries,items:s.items,appointments:visibleAppointments(s,actor)});}
  const {result,data}=await mutate(s=>householdMutation(s,p,actor));if(result)try{await notify(data,actor,result.category,'Votre moitié '+result.message,req.headers.get('x-adeux-device')||'');}catch{}return json({ok:true});
 }
 if(route==='calls'){
  if(req.method==='GET'){const {data:s}=await state();return json({call:s.call&&s.call.state!=='ended'&&s.call.expiresAt>Date.now()?s.call:null});}
  const {result,data}=await mutate(s=>callMutation(s,{...p,member:actor}));if(p.action==='start')try{await notify(data,actor,'calls','Votre moitié vous appelle. Ouvrez À deux pour répondre.');}catch{}return json(result);
 }
 if(route==='notifications'){
  if(req.method==='GET'){const device=deviceInput.parse(url.searchParams.get('device'));const {data:s}=await state();const d=s.devices.find(d=>d.deviceId===device&&d.member===actor);return json({publicKey:(await config()).vapid.publicKey,enabled:!!d,preferences:d?.preferences||defaultPreferences,activity:s.activity.slice(0,50)});}
  if(p.action==='test'){const device=deviceInput.parse(p.deviceId);const {data:s}=await state();const d=s.devices.find(d=>d.deviceId===device&&d.member===actor);if(!d)return json({error:'Activez les notifications.'},400);return await send(d,{title:'À deux',body:'Les notifications de votre maison sont activées.'})?json({ok:true}):json({error:'Le service de notification a refusé le test.'},502);}
  await mutate(s=>{const d=s.devices.find(d=>d.deviceId===p.deviceId);if(d&&d.member!==actor)throw new ApiError(403,'Cet appareil appartient à un autre compte.');deviceMutation(s,{...p,member:actor});});return json({ok:true});
 }
 return json({error:'Route inconnue.'},404);
 }catch(e){if(e instanceof ApiError)return json({error:e.message},e.status);if(e instanceof SyntaxError||e&&typeof e==='object'&&'issues'in e)return json({error:'Vérifiez les champs du formulaire.'},400);return json({error:'Service temporairement indisponible. Réessayez.'},503);}
}
Deno.serve(handler);
