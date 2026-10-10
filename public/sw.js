/* No caching of authenticated pages or household data. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{};}catch{}
 const url=typeof data.url==='string'&&data.url.startsWith('/Nous-deux/?view=')?data.url:'/Nous-deux/';
 const callId=typeof data.callId==='string'&&/^[0-9a-f-]{36}$/i.test(data.callId)?data.callId:null;
 const expired=callId&&Number(data.expiresAt)<Date.now();
 event.waitUntil((async()=>{
  if(callId){const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clients)client.postMessage({type:'nousdeux-call',callId});}
  // A Web Push must remain user-visible on iOS. A foreground signal is additional.
  await self.registration.showNotification(expired?'📞 Un appel dans Nous deux':data.title||'Nous deux',{body:expired?'Une invitation d’appel est arrivée plus tôt. Consultez votre historique.':data.body||'Une nouveauté dans votre maison.',icon:'/Nous-deux/icon-192.png?v=4',badge:'/Nous-deux/icon-192.png?v=4',tag:callId?'nousdeux-call-'+callId:data.tag,renotify:false,data:{url,callId}});
 })());
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const target=new URL(event.notification.data?.url||'/Nous-deux/',self.location.origin).href;
 event.waitUntil((async()=>{const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clients){if(new URL(client.url).origin===self.location.origin){if(event.notification.data?.callId){client.postMessage({type:'nousdeux-call',open:true,callId:event.notification.data.callId});return client.focus();}await client.navigate(target);return client.focus();}}return self.clients.openWindow(target);})());
});
