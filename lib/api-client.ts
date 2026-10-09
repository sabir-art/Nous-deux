export const APP_BASE='/Nous-deux/';
const API='https://jvjwyalusdygvkyzmiez.supabase.co/functions/v1/house-api';
const PUBLIC_KEY='sb_publishable_Ypq0tRBQvFG8ULhxRTIcEQ_GADD-nYn';
const TOKEN_KEY='nous-deux-session-v1';
export function hasSession(){try{return !!localStorage.getItem(TOKEN_KEY);}catch{return false;}}
export async function apiFetch(path:string,init:RequestInit={}){
 const parsed=new URL(path,'https://local.invalid');const url=new URL(API);if(parsed.pathname==='/api/access')url.searchParams.set('member',localStorage.getItem('nous-deux-member')||'0');url.searchParams.set('route',parsed.pathname.replace('/api/',''));for(const [k,v] of parsed.searchParams)url.searchParams.set(k,v);
 const headers=new Headers(init.headers);headers.set('apikey',PUBLIC_KEY);try{const token=localStorage.getItem(TOKEN_KEY);if(token)headers.set('x-house-session',token);}catch{}
 const r=await fetch(url,{...init,headers,credentials:'omit',cache:'no-store'});
 if(parsed.pathname==='/api/access'&&init.method==='POST'&&r.ok){const d=await r.clone().json() as {token?:string};if(d.token){localStorage.setItem(TOKEN_KEY,d.token);localStorage.setItem('adeux-device',crypto.randomUUID());}else if(typeof init.body==='string'&&JSON.parse(init.body).action==='logout')localStorage.removeItem(TOKEN_KEY);}
 if(r.status===401&&parsed.pathname!=='/api/access'){try{localStorage.removeItem(TOKEN_KEY);}catch{}window.dispatchEvent(new Event('nousdeux-signed-out'));}
 return r;
}
