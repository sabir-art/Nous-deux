import {getChatGPTUser} from '../../chatgpt-auth';
import {getDb} from '../../../db';
import {devices,activity} from '../../../db/schema';
import {eq,desc} from 'drizzle-orm';
import {deviceInput,memberInput,preferenceInput,subscriptionInput,defaultPreferences} from '../../../lib/communication';
import {pushKeys,sendToDevice} from '../../../lib/push';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store, private','Vary':'Cookie'}});
export async function GET(request:Request){
 const user=await getChatGPTUser();if(!user)return json({error:'Connectez-vous à votre maison.'},401);
 const id=deviceInput.safeParse(new URL(request.url).searchParams.get('device'));if(!id.success)return json({error:'Appareil invalide.'},400);
 try{const db=getDb();const [registered,events]=await Promise.all([db.select().from(devices).where(eq(devices.key,`${user.userId}:${id.data}`)),db.select().from(activity).where(eq(activity.userId,user.userId)).orderBy(desc(activity.id)).limit(50)]);
 return json({publicKey:pushKeys().publicKey,enabled:!!registered[0],preferences:registered[0]?JSON.parse(registered[0].preferences):defaultPreferences,activity:events});
 }catch{return json({error:'Notifications indisponibles. Réessayez.'},503);}
}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return json({error:'Connectez-vous à votre maison.'},401);
 if(request.headers.get('sec-fetch-site')==='cross-site'||request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origine non autorisée.'},403);
 try{
 const raw=await request.text();if(raw.length>6000)return json({error:'Contenu trop volumineux.'},413);const p=JSON.parse(raw);const deviceId=deviceInput.parse(p.deviceId),key=`${user.userId}:${deviceId}`;const db=getDb();
 if(p.action==='disable'){await db.delete(devices).where(eq(devices.key,key));return json({ok:true});}
 if(p.action==='test'){
 const rows=await db.select().from(devices).where(eq(devices.key,key));if(!rows[0])return json({error:'Activez d’abord les notifications.'},400);
 // Only this user's registered device; no arbitrary recipient or payload.
 const ok=await sendToDevice(rows[0],{title:'À deux',body:'Les notifications de votre maison sont activées.',url:'/?view=settings',tag:'adeux-test'});return ok?json({ok:true}):json({error:'Le service de notification a refusé le test. Réactivez les notifications.'},502);
 }
 if(p.action!=='subscribe'&&p.action!=='preferences')return json({error:'Action inconnue.'},400);
 const member=memberInput.parse(p.member),preferences=JSON.stringify(preferenceInput.parse(p.preferences));
 if(p.action==='preferences'){await db.update(devices).set({member,preferences,updatedAt:new Date().toISOString()}).where(eq(devices.key,key));return json({ok:true});}
 if(!pushKeys().privateKey)return json({error:'Les notifications ne sont pas encore configurées.'},503);
 const subscription=JSON.stringify(subscriptionInput.parse(p.subscription));
 const existing=await db.select({key:devices.key}).from(devices).where(eq(devices.userId,user.userId));if(existing.length>=12&&!existing.some(d=>d.key===key))return json({error:'La limite de 12 appareils est atteinte. Désactivez un ancien appareil.'},400);
 await db.insert(devices).values({key,userId:user.userId,deviceId,member,subscription,preferences,updatedAt:new Date().toISOString()}).onConflictDoUpdate({target:devices.key,set:{member,subscription,preferences,updatedAt:new Date().toISOString()}});
 return json({ok:true});
 }catch(e){return json({error:'Impossible de modifier les notifications. Vérifiez la connexion et réessayez.'},e instanceof SyntaxError||e&&typeof e==='object'&&'issues'in e?400:503);}
}
