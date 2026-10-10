// A notification renderer cannot send a house session header. Grant narrowly
// scoped, short-lived access to this photo only, never to the profile or session.
type DB=(path:string,method?:string,body?:unknown)=>Promise<any>;
const encoder=new TextEncoder();
async function signature(value:string,secret:string){
 const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function notificationPhotoURL(state:any,actor:number,base:string,secret:string){
 const photo=state.profiles?.[actor];if(!photo)return undefined;
 const expires=Math.floor(Date.now()/1000)+3600,value=`${actor}:${photo}:${expires}`;
 return `${base}/functions/v1/house-api?route=notification-photo&member=${actor}&photo=${photo}&expires=${expires}&signature=${await signature(value,secret)}`;
}
export async function serveNotificationPhoto(url:URL,secret:string,db:DB,getState:()=>Promise<any>,headers:Record<string,string>){
 const actor=Number(url.searchParams.get('member')),photo=url.searchParams.get('photo')||'',expires=Number(url.searchParams.get('expires')),sig=url.searchParams.get('signature')||'';
 const denied=()=>new Response(null,{status:404,headers});
 if(![0,1].includes(actor)||!/^\d$/.test(url.searchParams.get('member')||'')||! /^[0-9a-f-]{36}$/i.test(photo)||!Number.isInteger(expires)||expires<=Date.now()/1000||expires>Date.now()/1000+3601||! /^[0-9a-f]{64}$/.test(sig))return denied();
 const expected=await signature(`${actor}:${photo}:${expires}`,secret);let difference=0;for(let i=0;i<64;i++)difference|=sig.charCodeAt(i)^expected.charCodeAt(i);if(difference)return denied();
 if((await getState()).profiles?.[actor]!==photo)return denied();
 const row=(await db('nd_photos?id=eq.'+photo+'&select=data'))[0];if(!row?.data?.startsWith('data:image/jpeg;base64,'))return denied();
 return new Response(Uint8Array.from(atob(row.data.slice(23)),c=>c.charCodeAt(0)),{headers:{...headers,'Content-Type':'image/jpeg','Cache-Control':'private, max-age=60'}});
}
