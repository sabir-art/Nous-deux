import {env} from 'cloudflare:workers';
import {buildPushPayload} from '@block65/webcrypto-web-push';
import {and,eq,lt} from 'drizzle-orm';
import {getDb} from '../db';
import {activity,devices} from '../db/schema';
import {allowedPushEndpoint,defaultPreferences,type NotificationCategory,type Preferences} from './communication';
export function pushKeys(){const e=env as unknown as Record<string,string>;return {publicKey:e.VAPID_PUBLIC_KEY||'',privateKey:e.VAPID_PRIVATE_KEY||'',subject:'https://a-deux-maison.pacienart.chatgpt.site'};}
export async function sendToDevice(device:typeof devices.$inferSelect,data:Record<string,unknown>){
 const subscription=JSON.parse(device.subscription);if(!allowedPushEndpoint(subscription.endpoint))return false;
 const keys=pushKeys();if(!keys.publicKey||!keys.privateKey)return false;
 const payload=await buildPushPayload({data:JSON.stringify(data),options:{ttl:data.category==='calls'?90:3600}},subscription,keys);
 const response=await fetch(subscription.endpoint,{...payload,redirect:'manual',signal:AbortSignal.timeout(5000)});
 if(response.status===404||response.status===410)await getDb().delete(devices).where(eq(devices.key,device.key));
 return response.ok;
}
export async function notifyOthers(userId:string,actor:number,category:NotificationCategory,message:string,originDevice=''){
 const db=getDb();const rows=await db.select().from(devices).where(eq(devices.userId,userId));
 await Promise.allSettled(rows.filter(d=>d.member!==actor&&d.deviceId!==originDevice).map(async d=>{
 const prefs:Preferences={...defaultPreferences,...JSON.parse(d.preferences)};if(!prefs[category])return;
 return sendToDevice(d,{title:'À deux',body:message,category,url:category==='calls'?'/?view=calls':`/?view=${category}`,tag:category==='calls'?'adeux-call':undefined});
 }));
}
export async function recordChange(userId:string,actor:number,category:NotificationCategory,message:string,originDevice=''){
 const db=getDb();await db.insert(activity).values({userId,actor,category,message,createdAt:new Date().toISOString()});
 await db.delete(activity).where(and(eq(activity.userId,userId),lt(activity.createdAt,new Date(Date.now()-90*86400000).toISOString())));
 await notifyOthers(userId,actor,category,'Votre moitié '+message,originDevice);
}
