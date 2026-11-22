// Android app (Capacitor) only: injected into index.html by vite.android.config.ts before web/main.tsx.
// The web build (GitHub Pages) never loads this file.
import {SystemBars,SystemBarsStyle} from '@capacitor/core';
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
