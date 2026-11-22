import type {CapacitorConfig} from '@capacitor/cli';

// Android app (step 1): the Vite interface built by `pnpm run build:android` into dist-android/.
// The WebView serves it from https://localhost (androidScheme https, Capacitor's default).
const config:CapacitorConfig={
 appId:'fr.nousdeux.app',
 appName:'Nous deux',
 webDir:'dist-android',
 backgroundColor:'#f6f3ef',
 android:{allowMixedContent:false},
};

export default config;
