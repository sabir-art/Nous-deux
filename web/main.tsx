import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import HouseApp from '../app/house-app';
import AccessForm from '../app/access-form';
import {hasSession,APP_BASE} from '../lib/api-client';
import '../design-system/tokens/tokens.css';
import '../design-system/components/bundle.css';
import '../app/application.css';
import '../app/invitation-envelope.css';
import {ThemeSync} from '../app/theme';
import {captureSharedRecipe} from '../app/share-target';
function App(){const [signedIn,setSignedIn]=useState(hasSession);useEffect(()=>{const logout=()=>setSignedIn(false);window.addEventListener('nousdeux-signed-out',logout);if('serviceWorker'in navigator)navigator.serviceWorker.register(APP_BASE+'sw.js',{scope:APP_BASE}).catch(()=>{});return()=>window.removeEventListener('nousdeux-signed-out',logout);},[]);return <><ThemeSync/>{signedIn?<HouseApp/>:<AccessForm/>}</>;}
// Before navigation reads the address: a shared recipe link opens « À table ».
captureSharedRecipe();
createRoot(document.getElementById('root')!).render(<App/>);
