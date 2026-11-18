/* No caching of authenticated pages or household data. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{};}catch{}
 const url=typeof data.url==='string'&&data.url.startsWith('/Nous-deux/?view=')?data.url:'/Nous-deux/';
 const callId=typeof data.callId==='string'&&/^[0-9a-f-]{36}$/i.test(data.callId)?data.callId:null;
 // One logo only (18 November 2026): the app's own mark shows on the left (badge, a white silhouette as Android
 // expects); a large picture on the right appears only for the sender's photo of a message or a call.
 let icon;
 if(['chat','calls'].includes(data.category)&&typeof data.icon==='string'){try{const u=new URL(data.icon);if(u.origin==='https://jvjwyalusdygvkyzmiez.supabase.co'&&u.pathname==='/functions/v1/house-api'&&u.searchParams.get('route')==='notification-photo')icon=u.href;}catch{}}
 const expired=callId&&Number(data.expiresAt)<Date.now();
 event.waitUntil((async()=>{
  if(callId){const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clients)client.postMessage({type:'nousdeux-call',callId});}
  // A Web Push must remain user-visible on iOS. A foreground signal is additional.
  await self.registration.showNotification(expired?'📞 Un appel dans Nous deux':data.title||'Nous deux',{body:expired?'Une invitation d’appel est arrivée plus tôt. Consultez votre historique.':data.body||'Une nouveauté dans votre maison.',...(icon?{icon}:{}),badge:'/Nous-deux/badge-96.png?v=1',tag:callId?'nousdeux-call-'+callId:data.tag,renotify:false,data:{url,callId}});
 })());
});
// The browser renewed the push address: subscribe again with the same key. The service worker has no session,
// so the app hands the new subscription to house-api at its next opening (lib/push-client.ts, action 'refresh').
self.addEventListener('pushsubscriptionchange',event=>{
 const key=event.oldSubscription?.options?.applicationServerKey;if(!key)return;
 event.waitUntil(self.registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key}).catch(()=>{}));
});
// A tap always brings the app forward (18 November 2026, v2): an open window of the app is focused and told which
// page to show; when there is none, or the browser refuses to focus it, the app opens on that page. Every step is
// guarded so that one refusal never leaves the tap without effect.
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const data=event.notification.data||{},scope=self.registration.scope;
 let target=scope;try{const u=new URL(data.url||scope,self.location.origin);if(u.href.startsWith(scope))target=u.href;}catch{}
 const view=new URL(target).searchParams.get('view');
 event.waitUntil((async()=>{
  let clients=[];try{clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});}catch{}
  for(const client of clients.filter(c=>typeof c.url==='string'&&c.url.startsWith(scope))){
   try{const focused=await client.focus();if(focused){try{focused.postMessage(data.callId?{type:'nousdeux-call',open:true,callId:data.callId}:{type:'nousdeux-open',view});}catch{}return;}}catch{}
  }
  try{await self.clients.openWindow(target);}catch{}
 })());
});
