// Android (Capacitor) build only: same API, same session handling as lib/api-client.ts.
// The app is served by Capacitor from https://localhost/, so links and the app base point to the root
// instead of GitHub Pages' /Nous-deux/. Swapped in by vite.android.config.ts; the web build never imports it.
export * from './api-client';
export const APP_BASE='/';
