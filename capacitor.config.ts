import type {CapacitorConfig} from '@capacitor/cli';

// Android app: the Vite interface built by `pnpm run build:android` into dist-android/.
// The WebView serves it from https://localhost (androidScheme https, Capacitor's default): this is the
// Origin accepted by house-api (ORIGINS in supabase/functions/house-api/index.ts).
// The trial build (dist-android-essai/) is synced only by `pnpm run sync:android:essai`
// (scripts/cap-sync-essai.mjs sets NOUS_DEUX_ESSAI=1); a plain `cap sync` always takes the real app.
const config:CapacitorConfig={
 appId:'fr.nousdeux.app',
 appName:'Nous deux',
 webDir:process.env.NOUS_DEUX_ESSAI==='1'?'dist-android-essai':'dist-android',
 backgroundColor:'#f6f3ef',
 android:{allowMixedContent:false},
 plugins:{
  // Edge to edge: the page draws under the system bars (index.html has viewport-fit=cover) and gets the
  // safe areas through env(safe-area-inset-*) and --safe-area-inset-*. Icons are set by web/android.ts.
  SystemBars:{insetsHandling:'css',initialViewportFitValueHint:'cover',style:'DEFAULT'},
  // A notification arriving while the app is open is still shown by Android (FCM, house-api fcm.ts).
  PushNotifications:{presentationOptions:['badge','sound','alert']},
 },
};

export default config;
