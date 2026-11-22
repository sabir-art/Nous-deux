// Android app (Capacitor) side of notifications: Firebase Cloud Messaging instead of Web Push (22 November 2026).
// Swapped for lib/push-client.ts by vite.android.config.ts, with the same exports, so app/house-notifications.tsx
// and app/house-app.tsx stay shared with the site. Nothing here decides who receives a notification: house-api
// checks the session for every call and applies the same rules as for Web Push.
import {PushNotifications} from '@capacitor/push-notifications';
import {apiFetch,hasSession} from './api-client';
import {deviceId} from './device';
import type {Permission} from './push-client';
export * from './push-client';

let last:Permission='default';
const asPermission=(state:string):Permission=>state==='granted'?'granted':state==='denied'?'denied':'default';
export const pushSupported=()=>true;
export const isInstalled=()=>true;
// Last known state; permissionState() asks Android for the current one.
export const permission=():Permission=>last;
export async function permissionState():Promise<Permission>{
 try{last=asPermission((await PushNotifications.checkPermissions()).receive);}catch{last='unsupported';}
 return last;
}

// The FCM token of this phone. register() answers through the 'registration' event (or 'registrationError').
let token='';
function fcmToken():Promise<string>{
 return new Promise((resolve,reject)=>{
  let done=false;const handles:Promise<{remove:()=>Promise<void>}>[]=[];
  const finish=(fn:()=>void)=>{if(done)return;done=true;clearTimeout(timer);for(const h of handles)void h.then(x=>x.remove()).catch(()=>{});fn();};
  const timer=setTimeout(()=>finish(()=>reject(new Error('timeout'))),15000);
  handles.push(PushNotifications.addListener('registration',t=>finish(()=>{token=t.value;resolve(t.value);})));
  handles.push(PushNotifications.addListener('registrationError',()=>finish(()=>reject(new Error('registration')))));
  PushNotifications.register().catch(()=>finish(()=>reject(new Error('registration'))));
 });
}
// For « Vérifier mes notifications »: the same fingerprint as house-api computes ('fcm:' + token).
export async function localSubscription():Promise<{endpoint:string}|null>{
 if(await permissionState()!=='granted')return null;
 try{return {endpoint:'fcm:'+(token||await fcmToken())};}catch{return null;}
}

// « Activer sur cet appareil »: the Android 13+ permission prompt comes right after the tap, never at launch.
export async function subscribeDevice(_key:string):Promise<{fcm:{token:string}}>{
 let state=await permissionState();
 if(state!=='granted'){try{state=asPermission((await PushNotifications.requestPermissions()).receive);}catch{state='denied';}last=state;}
 if(state!=='granted')throw new Error(state==='denied'?'Notifications bloquées. Vous pouvez les autoriser dans les réglages du téléphone (Applis › Nous deux › Notifications).':'Les notifications restent désactivées.');
 try{return {fcm:{token:await fcmToken()}};}catch{throw new Error('Le service de notification n’est pas disponible. Réessayez.');}
}
// « Désactiver sur cet appareil »: the server forgets the device first (app/house-notifications.tsx), then Firebase
// drops the token; a later « Activer » gets a new one.
export async function unsubscribeDevice(){try{await PushNotifications.unregister();}catch{}token='';}

// On each opening (app/house-app.tsx) and whenever Firebase renews the token: give the server the current token.
// Silent: never asks for the permission, never registers a phone that is not already allowed.
let sent='';
async function sendRefresh(value:string){
 if(!value||value===sent||!hasSession())return;
 try{const r=await apiFetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'refresh',deviceId:deviceId(),fcm:{token:value}})});if(r.ok)sent=value;}catch{/* Offline: the next opening tries again. */}
}
export async function refreshPushSubscription(){
 try{if(await permissionState()!=='granted')return;await sendRefresh(await fcmToken());}catch{/* Next opening. */}
}
// Firebase may renew the token while the app runs (web/android.ts calls this once at start).
export function watchTokenRenewal(){
 void PushNotifications.addListener('registration',t=>{if(t.value!==token){token=t.value;void sendRefresh(t.value);}}).catch(()=>{});
}
