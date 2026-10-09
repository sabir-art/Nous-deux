/* No caching of authenticated pages or household data. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{};}catch{}
 const url=typeof data.url==='string'&&data.url.startsWith('/Nous-deux/?view=')?data.url:'/Nous-deux/';
 event.waitUntil(self.registration.showNotification(data.title||'À deux',{body:data.body||'Une nouveauté dans votre maison.',icon:'/Nous-deux/icon-192.png?v=3',badge:'/Nous-deux/icon-192.png?v=3',tag:data.tag,data:{url}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const target=new URL(event.notification.data?.url||'/Nous-deux/',self.location.origin).href;
 event.waitUntil((async()=>{const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clients){if(new URL(client.url).origin===self.location.origin){await client.navigate(target);return client.focus();}}return self.clients.openWindow(target);})());
});
