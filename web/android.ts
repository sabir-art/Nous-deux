// Android app (Capacitor) only: injected into index.html by vite.android.config.ts before web/main.tsx.
// The web build (GitHub Pages) never loads this file.
import {SystemBars,SystemBarsStyle} from '@capacitor/core';
import {App} from '@capacitor/app';
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
 const dialog=[...document.querySelectorAll<HTMLDialogElement>('dialog[open]')].at(-1);
 if(dialog){dialog.dispatchEvent(new Event('cancel',{cancelable:true}));return;}
 const layer=[...document.querySelectorAll<HTMLElement>('[data-back-dismiss]')].at(-1);
 if(layer){layer.dispatchEvent(new Event('nd-back-dismiss'));return;}
 if(canGoBack)history.back();else App.minimizeApp().catch(()=>{});
}).catch(()=>{});
