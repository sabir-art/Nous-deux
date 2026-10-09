import {env} from 'cloudflare:workers';
import {headers} from 'next/headers';
export const COOKIE='__Host-nousdeux';
export const MAX_AGE=90*24*60*60;
const config=()=>env as unknown as Record<string,string>;
export const ownerId=()=>config().HOUSEHOLD_OWNER_ID;
export function randomToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');}
export async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
export async function passwordHash(password:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return Array.from(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256)),b=>b.toString(16).padStart(2,'0')).join('');}
export function equal(a:string,b:string){let difference=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)difference|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return difference===0;}
export function cookieToken(h:Headers){return (h.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';}
export async function getHouseUser(){const token=cookieToken(await headers());if(!/^[a-f0-9]{64}$/.test(token)||!ownerId())return null;const row=await env.DB!.prepare('SELECT token_hash FROM house_sessions WHERE token_hash = ? AND expires_at > ?').bind(await digest(token),Date.now()).first();return row?{userId:ownerId(),displayName:'Notre maison',email:'',fullName:null}:null;}
export async function setupAllowed(token:string){return !!config().HOUSE_SETUP_HASH && equal(await digest(token),config().HOUSE_SETUP_HASH);}
export function cookie(value:string,age=MAX_AGE){return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;}
