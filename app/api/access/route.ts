import {env} from 'cloudflare:workers';
import {cookie,cookieToken,digest,equal,MAX_AGE,ownerId,passwordHash,randomToken,setupAllowed} from '../../../lib/house-auth';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200,extra:Record<string,string>={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
export async function GET(){return json({configured:!!await env.DB!.prepare('SELECT id FROM house_access WHERE id = 1').first()});}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Origine non autorisée.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Format invalide.'},415);
 try{
 const raw=await request.text();if(raw.length>2048)return json({error:'Contenu trop long.'},413);
 const {action,password,setupToken}=JSON.parse(raw);
 if(action==='logout'){const token=cookieToken(request.headers);if(token)await env.DB!.prepare('DELETE FROM house_sessions WHERE token_hash = ?').bind(await digest(token)).run();return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
 if(!ownerId())return json({error:'La maison est en cours de préparation.'},503);
 // Persistent per-IP throttling, including concurrent attempts. No raw IP retained.
 const ipHash=await digest(request.headers.get('cf-connecting-ip')||'unknown');const bucket=Math.floor(Date.now()/900000);const rateKey=ipHash+':'+bucket;
 const rate=await env.DB!.prepare('INSERT INTO house_login_limits (key, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1 RETURNING attempts').bind(rateKey,Date.now()+1800000).first<{attempts:number}>();
 if(!rate||rate.attempts>15)return json({error:'Trop de tentatives. Réessayez dans 15 minutes.'},429,{'Retry-After':'900'});
 if(typeof password!=='string'||password.length<12||password.length>128)return json({error:'Utilisez entre 12 et 128 caractères.'},400);
 let access=await env.DB!.prepare('SELECT salt, password_hash FROM house_access WHERE id = 1').first<{salt:string,password_hash:string}>();
 if(action==='setup'){
  if(access)return json({error:'Le mot de passe est déjà défini. Connectez-vous.'},409);
  if(typeof setupToken!=='string'||!await setupAllowed(setupToken))return json({error:'Le lien de préparation est invalide.'},403);
  const salt=randomToken();const hash=await passwordHash(password,salt);
  const result=await env.DB!.prepare('INSERT INTO house_access (id, salt, password_hash) VALUES (1, ?, ?) ON CONFLICT(id) DO NOTHING').bind(salt,hash).run();
  if(result.meta.changes!==1)return json({error:'La maison vient d’être configurée. Connectez-vous.'},409);
 }else if(action==='login'){
  if(!access||!equal(await passwordHash(password,access.salt),access.password_hash))return json({error:'Mot de passe incorrect.'},401);
 }else return json({error:'Action inconnue.'},400);
 const token=randomToken();await env.DB!.prepare('INSERT INTO house_sessions (token_hash, expires_at) VALUES (?, ?)').bind(await digest(token),Date.now()+MAX_AGE*1000).run();
 await env.DB!.batch([env.DB!.prepare('DELETE FROM house_sessions WHERE expires_at < ?').bind(Date.now()),env.DB!.prepare('DELETE FROM house_login_limits WHERE expires_at < ?').bind(Date.now())]);
 return json({ok:true},200,{'Set-Cookie':cookie(token)});
 }catch{return json({error:'Connexion impossible. Réessayez dans un instant.'},503);}
}
