// Android app (Capacitor) only: injected into index.html by vite.android.config.ts before web/main.tsx.
// The web build (GitHub Pages) never loads this file.
import {SystemBars,SystemBarsStyle} from '@capacitor/core';
import {App} from '@capacitor/app';
import {PushNotifications} from '@capacitor/push-notifications';
import {dismissTopLayer} from '../app/back-layers';
import {watchTokenRenewal} from '../lib/android-push-client';
import '../app/android.css';

const root=document.documentElement;
root.classList.add('native-app');

// Edge to edge: the WebView draws under the status and navigation bars (viewport-fit=cover, safe areas in
// app/android.css). Their icons follow the app theme (light or dark, chosen in Notre espace or by the phone).
function syncBars(){
 const style=root.dataset.theme==='dark'?SystemBarsStyle.Dark:SystemBarsStyle.Light;
 SystemBars.setStyle({style}).catch(()=>{});
}
new MutationObserver(syncBars).observe(root,{attributes:true,attributeFilter:['data-theme']});
syncBars();

// Android Back (@capacitor/app): same order as the installed web app (app/use-house-navigation.ts, pop()):
// the top sheet, then a panel standing in for the keyboard (emoji picker), then the previous page. With nothing
// left, the app goes to the background like any Android 12+ app, keeping its state (and, later, an ongoing call).
// The sheets are handled here because Chromium skips history entries created without a user gesture.
App.addListener('backButton',({canGoBack})=>{
 if(dismissTopLayer())return;
 if(canGoBack)history.back();else App.minimizeApp().catch(()=>{});
}).catch(()=>{});

// Notifications (Firebase Cloud Messaging, step 2). The channels are the ones house-api names (fcm.ts):
// each can be tuned or silenced in the phone's settings. Creating them again changes nothing.
const channels=[
 {id:'messages',name:'Messages et invitations',description:'Messages de ta moitié, invitations, liste de courses terminée',importance:4 as const},
 {id:'appels',name:'Appels',description:'Quand ta moitié t’appelle',importance:5 as const},
 {id:'rappels',name:'Rappels',description:'Agenda, missions du jour, plantes et compagnons',importance:3 as const},
];
for(const c of channels)PushNotifications.createChannel({...c,visibility:1,vibration:true,lights:true,lightColor:'#D60B52'}).catch(()=>{});
watchTokenRenewal();

// A tapped notification opens its page, like public/sw.js does on the site: the app receives the same messages
// (nousdeux-open, nousdeux-call) through navigator.serviceWorker, so navigation and calls react as on the site.
// On a cold start the app may still be loading: wait for it (signed in) for a few seconds.
function tell(data:Record<string,unknown>){
 const sw=navigator.serviceWorker;if(!sw)return;
 let tries=0;const attempt=()=>{if(document.querySelector('.app-shell')){sw.dispatchEvent(new MessageEvent('message',{data}));return;}if(++tries<40)setTimeout(attempt,250);};attempt();
}
PushNotifications.addListener('pushNotificationActionPerformed',({notification})=>{
 const d=(notification.data||{}) as Record<string,string>;
 if(d.callId)tell({type:'nousdeux-call',open:true,callId:d.callId});else tell({type:'nousdeux-open',view:d.view||'notifications'});
}).catch(()=>{});
// Received while the app is open: Android shows it (presentationOptions in capacitor.config.ts); a call also wakes the
// call screen right away, like the site's service worker does.
PushNotifications.addListener('pushNotificationReceived',notification=>{
 const d=(notification.data||{}) as Record<string,string>;if(d.callId)tell({type:'nousdeux-call',callId:d.callId});
}).catch(()=>{});
