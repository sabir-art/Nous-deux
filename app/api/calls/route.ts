import {getHouseUser} from '../../../lib/house-auth';
import {getDb} from '../../../db';
import {calls,households} from '../../../db/schema';
import {and,eq,sql} from 'drizzle-orm';
import {z} from 'zod';
import {deviceInput,memberInput} from '../../../lib/communication';
import {notifyOthers} from '../../../lib/push';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store, private','Vary':'Cookie'}});
const description=z.string().min(20).max(30000).refine(s=>s.startsWith('v=0')&&s.includes('m=audio')&&!s.includes('m=video'));
export async function GET(){
 const user=await getHouseUser();if(!user)return json({error:'Connectez-vous à votre maison.'},401);
 try{const rows=await getDb().select().from(calls).where(eq(calls.userId,user.userId));const call=rows[0];return json({call:call&&call.expiresAt>Date.now()&&call.state!=='ended'?call:null});}catch{return json({error:'Appels indisponibles. Réessayez.'},503);}
}
export async function POST(request:Request){
 const user=await getHouseUser();if(!user)return json({error:'Connectez-vous à votre maison.'},401);
 if(request.headers.get('sec-fetch-site')==='cross-site'||request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origine non autorisée.'},403);
 try{
 const raw=await request.text();if(raw.length>35000)return json({error:'Contenu trop volumineux.'},413);
 const p=JSON.parse(raw),id=deviceInput.parse(p.id),session=deviceInput.parse(p.session),member=memberInput.parse(p.member),db=getDb(),now=Date.now();
 if(p.action==='start'){
 const offer=description.parse(p.offer);const home=await db.select().from(households).where(eq(households.userId,user.userId));if(!home.length)return json({error:'Configurez votre maison.'},400);
 const values={userId:user.userId,id,caller:member,callerDevice:session,calleeDevice:'',offer,answer:'',state:'ringing',expiresAt:now+120000,createdAt:new Date().toISOString()};
 const result=await db.insert(calls).values(values).onConflictDoUpdate({target:calls.userId,set:values,setWhere:sql`${calls.state} = 'ended' OR ${calls.expiresAt} <= ${now}`}).returning();
 if(!result.length)return json({error:'Un appel est déjà en cours dans votre maison.'},409);
 try{await notifyOthers(user.userId,member,'calls','Votre moitié vous appelle. Ouvrez À deux pour répondre.');}catch{}
 return json({call:result[0]});
 }
 const rows=await db.select().from(calls).where(and(eq(calls.userId,user.userId),eq(calls.id,id)));const call=rows[0];if(!call||call.state==='ended'||call.expiresAt<=now)return json({error:'Cet appel est terminé.'},410);
 const caller=call.callerDevice===session&&call.caller===member;const callee=call.calleeDevice===session&&call.caller!==member;
 if(p.action==='answer'){
 if(member===call.caller||call.state!=='ringing')return json({error:'Cet appel a déjà été pris ou ne vous est pas destiné.'},409);
 const answer=description.parse(p.answer);const result=await db.update(calls).set({calleeDevice:session,answer,state:'connected',expiresAt:now+60000}).where(and(eq(calls.userId,user.userId),eq(calls.id,id),eq(calls.state,'ringing'))).returning();
 return result.length?json({call:result[0]}):json({error:'Cet appel a déjà été pris sur un autre appareil.'},409);
 }
 if(p.action==='end'){
 if(!caller&&!callee&&!(call.state==='ringing'&&member!==call.caller))return json({error:'Cet appel est ouvert sur un autre appareil.'},403);
 // Compare the snapshot so a late decline cannot terminate a call answered elsewhere.
 await db.update(calls).set({state:'ended',offer:'',answer:'',expiresAt:now}).where(and(eq(calls.userId,user.userId),eq(calls.id,id),eq(calls.state,call.state),eq(calls.calleeDevice,call.calleeDevice)));return json({ok:true});
 }
 if(p.action==='heartbeat'&&(caller||callee)){
 if(call.state==='connected')await db.update(calls).set({expiresAt:now+60000}).where(and(eq(calls.userId,user.userId),eq(calls.id,id),eq(calls.state,'connected')));return json({ok:true});
 }
 return json({error:'Action non autorisée.'},403);
 }catch(e){return json({error:'Impossible de préparer l’appel. Vérifiez votre connexion.'},e instanceof SyntaxError||e&&typeof e==='object'&&'issues'in e?400:503);}
}
