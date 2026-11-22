// Android app notifications through Firebase Cloud Messaging HTTP v1 (22 November 2026).
// Who receives what is decided before, exactly as for Web Push (index.ts, reminders.ts, model.ts): this module only
// turns one notification for one Android device into an FCM request.
// The service account comes from the FCM_SERVICE_ACCOUNT secret of the Edge runtime. It is never logged, returned,
// stored or sent anywhere but to Google's token endpoint (signed assertion only, not the key itself).
export type ServiceAccount={project_id:string;client_email:string;private_key:string};
export type FcmResult={ok:boolean;status:number|null;removed:boolean;reason?:string;error?:'network'|'config'};
type Fetch=(input:string,init?:RequestInit)=>Promise<Response>;

export function serviceAccount(raw:string|undefined|null):ServiceAccount|null{
 if(!raw)return null;
 try{const v=JSON.parse(raw);
  if(typeof v?.project_id!=='string'||!/^[a-z0-9-]{4,40}$/.test(v.project_id))return null;
  if(typeof v.client_email!=='string'||!/^[^@\s]+@[^@\s]+$/.test(v.client_email))return null;
  if(typeof v.private_key!=='string'||!v.private_key.includes('PRIVATE KEY'))return null;
  return {project_id:v.project_id,client_email:v.client_email,private_key:v.private_key};
 }catch{return null;}
}

// The app creates these Android channels (web/android.ts): calls ring loudest, then messages, then reminders.
export const fcmChannels={messages:'messages',calls:'appels',reminders:'rappels'} as const;
export function channelFor(category:string){
 if(category==='calls')return fcmChannels.calls;
 if(['chat','ideas','shopping','test'].includes(category))return fcmChannels.messages;
 return fcmChannels.reminders;
}

// Same content and lifetimes as the Web Push of index.ts (deliver): title, body, page to open, call id.
export function fcmMessage(token:string,data:Record<string,unknown>){
 const category=typeof data.category==='string'?data.category:'';
 const callId=typeof data.callId==='string'?data.callId:'';
 const view=callId?'calls':typeof data.view==='string'&&data.view?data.view:category||'settings';
 const ttl=category==='calls'?90:category==='test'?600:3600;
 const payload:Record<string,string>={view};
 if(category)payload.category=category;
 if(callId)payload.callId=callId;
 if(typeof data.expiresAt==='number'||typeof data.expiresAt==='string')payload.expiresAt=String(data.expiresAt);
 const title=(typeof data.title==='string'&&data.title?data.title:'Nous deux').slice(0,200);
 const body=(typeof data.body==='string'&&data.body?data.body:'Une nouveauté dans votre maison.').slice(0,1000);
 return {message:{token,notification:{title,body},data:payload,android:{priority:'HIGH',ttl:ttl+'s',
  notification:{channel_id:channelFor(category),icon:'ic_stat_nousdeux',color:'#D60B52',...(typeof data.tag==='string'&&data.tag?{tag:data.tag}:{})}}}};
}

const enc=new TextEncoder();
const b64url=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const json64=(value:unknown)=>b64url(enc.encode(JSON.stringify(value)));
function pkcs8(pem:string){const body=pem.replace(/-----[^-]+-----/g,'').replace(/\s+/g,'');return Uint8Array.from(atob(body),c=>c.charCodeAt(0));}

// OAuth access token for FCM, kept in memory until a minute before it expires. Parallel sends (both phones of
// the partner) share one request.
let cached:{email:string;token:string;exp:number}|null=null,pending:{email:string;promise:Promise<string>}|null=null;
export function forgetAccessToken(){cached=null;pending=null;}
export function accessToken(sa:ServiceAccount,fetchImpl:Fetch=fetch,now=Date.now()):Promise<string>{
 if(cached&&cached.email===sa.client_email&&cached.exp-60000>now)return Promise.resolve(cached.token);
 if(pending&&pending.email===sa.client_email)return pending.promise;
 const promise=requestToken(sa,fetchImpl,now).finally(()=>{if(pending?.promise===promise)pending=null;});
 pending={email:sa.client_email,promise};return promise;
}
async function requestToken(sa:ServiceAccount,fetchImpl:Fetch,now:number):Promise<string>{
 const iat=Math.floor(now/1000);
 const unsigned=json64({alg:'RS256',typ:'JWT'})+'.'+json64({iss:sa.client_email,scope:'https://www.googleapis.com/auth/firebase.messaging',aud:'https://oauth2.googleapis.com/token',iat,exp:iat+3600});
 const key=await crypto.subtle.importKey('pkcs8',pkcs8(sa.private_key),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
 const assertion=unsigned+'.'+b64url(new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,enc.encode(unsigned))));
 const r=await fetchImpl('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}).toString(),redirect:'manual',signal:AbortSignal.timeout(5000)});
 if(!r.ok)throw new Error('token');
 const d=await r.json() as {access_token?:unknown;expires_in?:unknown};
 if(typeof d.access_token!=='string'||!d.access_token)throw new Error('token');
 cached={email:sa.client_email,token:d.access_token,exp:now+(typeof d.expires_in==='number'?d.expires_in:3600)*1000};
 return d.access_token;
}

// One FCM request. removed: the token no longer exists (app uninstalled, data cleared): the device record goes away,
// like an expired Web Push subscription. reason: FCM's short error code (UNREGISTERED, QUOTA_EXCEEDED…).
export async function sendFcm(sa:ServiceAccount,token:string,data:Record<string,unknown>,fetchImpl:Fetch=fetch):Promise<FcmResult>{
 let bearer:string;try{bearer=await accessToken(sa,fetchImpl);}catch{return {ok:false,status:null,removed:false,error:'config'};}
 let r:Response;
 try{r=await fetchImpl('https://fcm.googleapis.com/v1/projects/'+encodeURIComponent(sa.project_id)+'/messages:send',{method:'POST',headers:{Authorization:'Bearer '+bearer,'Content-Type':'application/json'},body:JSON.stringify(fcmMessage(token,data)),redirect:'manual',signal:AbortSignal.timeout(5000)});}
 catch{return {ok:false,status:null,removed:false,error:'network'};}
 let reason:string|undefined;
 if(!r.ok)try{const e=JSON.parse((await r.text()).slice(0,4000))?.error;const code=(Array.isArray(e?.details)?e.details.find((x:any)=>typeof x?.errorCode==='string')?.errorCode:undefined)||e?.status;if(typeof code==='string'&&/^[A-Z_]{1,40}$/.test(code))reason=code;}catch{}
 if(r.status===401)forgetAccessToken();
 const removed=r.status===404||reason==='UNREGISTERED';
 return {ok:r.ok,status:r.status,removed,...(reason?{reason}:{})};
}
