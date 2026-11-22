// Browser side of Web Push: what this device can do, its subscription, and how to keep the server in step.
// Nothing here decides who receives a notification: house-api checks the session for every call.
import {apiFetch,APP_BASE} from './api-client';
import {deviceId} from './device';

export type Permission='granted'|'denied'|'default'|'unsupported';
export type Platform='ios'|'android'|'other';
export const pushSupported=()=>typeof window!=='undefined'&&'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window;
export const permission=():Permission=>typeof Notification==='undefined'?'unsupported':Notification.permission as Permission;
// iPhone and iPad only offer Web Push to the app opened from its Home Screen icon (iOS/iPadOS 16.4 or later).
export const isInstalled=()=>{try{return matchMedia('(display-mode: standalone)').matches||(navigator as {standalone?:boolean}).standalone===true;}catch{return false;}};
export function platform():Platform{
 const ua=navigator.userAgent||'';
 if(/iPhone|iPad|iPod/.test(ua)||/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)return 'ios';
 return /Android/.test(ua)?'android':'other';
}
export async function localSubscription(){
 if(!pushSupported())return null;
 try{const registration=await navigator.serviceWorker.getRegistration(APP_BASE);return await registration?.pushManager.getSubscription()||null;}catch{return null;}
}
export const keyBytes=(key:string)=>Uint8Array.from(atob(key.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-key.length%4)%4)),c=>c.charCodeAt(0));
// A subscription made with another server key (keys changed since) is refused by the push service: it must be renewed.
export function sameKey(subscription:PushSubscription,key:string){
 const current=subscription.options?.applicationServerKey;if(!current||!key)return true;
 const a=new Uint8Array(current),b=keyBytes(key);return a.length===b.length&&a.every((v,i)=>v===b[i]);
}
// Same short fingerprint as house-api (first 16 hex characters of SHA-256 of the push address).
export async function endpointHash(endpoint:string){
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(endpoint));
 return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('').slice(0,16);
}
export const permissionState=async():Promise<Permission>=>permission();
// « Activer sur cet appareil »: asks the permission (right after the tap, required on iPhone), then returns what the
// server needs to reach this browser. The Android app has its own version (lib/android-push-client.ts).
export async function subscribeDevice(key:string):Promise<{subscription:PushSubscriptionJSON}>{
 const answer=await Notification.requestPermission();if(answer!=='granted')throw new Error(answer==='denied'?'Notifications bloquées. Vous pouvez les autoriser dans les réglages de votre appareil.':'Les notifications restent désactivées.');
 if(!key)throw new Error('Le service de notification n’est pas disponible. Réessayez.');
 const registration=await navigator.serviceWorker.register(APP_BASE+'sw.js',{scope:APP_BASE});await navigator.serviceWorker.ready;
 // An old subscription made with another key would be refused by the push service: renew it.
 let sub=await registration.pushManager.getSubscription();if(sub&&!sameKey(sub,key)){await sub.unsubscribe();sub=null;}
 sub??=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(key)});
 return {subscription:sub.toJSON()};
}
export async function unsubscribeDevice(){const registration=await navigator.serviceWorker.getRegistration(APP_BASE);await(await registration?.pushManager.getSubscription())?.unsubscribe();}
// On each opening: give the server this browser's current subscription. A push address renewed by the browser,
// or a new device id after logging in again, then replaces the old record (no dead or duplicate device).
// Silent: it never asks for a permission and never subscribes a browser that was not already subscribed.
export async function refreshPushSubscription(){
 try{
  if(permission()!=='granted')return;const subscription=await localSubscription();if(!subscription)return;
  await apiFetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'refresh',deviceId:deviceId(),subscription:subscription.toJSON()})});
 }catch{/* Offline or unavailable: the next opening tries again. */}
}
