// Private voice attachments. Paths and signed URLs are built exclusively on the server.
export class VoiceError extends Error{constructor(public status:number,message:string){super(message);}}
export const MAX_VOICE_BYTES=8*1024*1024,MAX_VOICE_MS=180000;
const BUCKET='nous-deux-voices',uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type DB=(path:string,method?:string,body?:unknown,prefer?:string)=>Promise<any>;
export function voiceId(value:unknown){if(typeof value!=='string'||!uuid.test(value))throw new VoiceError(400,'Identifiant vocal invalide.');return value;}
export function voiceFormat(bytes:Uint8Array,declared:string){
 if(bytes.length<12||bytes.length>MAX_VOICE_BYTES)throw new VoiceError(413,'Le vocal doit faire moins de 8 Mo.');
 const mime=declared.split(';')[0].trim().toLowerCase(),head=new TextDecoder('ascii').decode(bytes.subarray(0,12));
 const valid=mime==='audio/mp4'&&head.slice(4,8)==='ftyp'||mime==='audio/webm'&&bytes[0]===0x1a&&bytes[1]===0x45&&bytes[2]===0xdf&&bytes[3]===0xa3||mime==='audio/ogg'&&head.startsWith('OggS');
 if(!valid)throw new VoiceError(415,'Format audio non pris en charge. Réenregistrez votre message.');
 return {mime,ext:mime==='audio/mp4'?'m4a':mime==='audio/webm'?'webm':'ogg'};
}
async function boundedBody(req:Request){
 if(Number(req.headers.get('content-length')||0)>MAX_VOICE_BYTES)throw new VoiceError(413,'Le vocal doit faire moins de 8 Mo.');
 if(!req.body)throw new VoiceError(400,'Enregistrement vide.');
 const reader=req.body.getReader(),chunks:Uint8Array[]=[];let size=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_VOICE_BYTES){await reader.cancel();throw new VoiceError(413,'Le vocal doit faire moins de 8 Mo.');}chunks.push(value);}}finally{reader.releaseLock();}
 const out=new Uint8Array(size);let offset=0;for(const c of chunks){out.set(c,offset);offset+=c.length;}return out;
}
function headers(key:string){return {apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{})};}
async function storage(base:string,key:string,path:string,method:string,body:BodyInit,extra:Record<string,string>={}){const r=await fetch(base+'/storage/v1/'+path,{method,headers:{...headers(key),...extra},body,signal:AbortSignal.timeout(25000)});if(!r.ok)throw new VoiceError(503,'Le stockage des vocaux est momentanément indisponible. Réessayez.');return r;}
export async function uploadVoice(req:Request,actor:number,db:DB,base:string,key:string){
 const url=new URL(req.url),id=voiceId(url.searchParams.get('id')),duration=Number(url.searchParams.get('duration'));
 if(!Number.isInteger(duration)||duration<300||duration>MAX_VOICE_MS)throw new VoiceError(400,'Enregistrez un message de moins de 3 minutes.');
 const data=await boundedBody(req),{mime,ext}=voiceFormat(data,req.headers.get('content-type')||'');
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');
 const record={id,owner:actor,path:`${actor}/${id}/${digest}.${ext}`,mime,bytes:data.length,duration_ms:duration,sha256:digest,ready:false};
 let old=(await db('nd_voices?id=eq.'+id))[0];
 const check=()=>{if(old&&(old.owner!==actor||old.sha256!==digest||old.duration_ms!==duration||old.mime!==mime))throw new VoiceError(409,'Ce vocal existe déjà. Créez un nouvel enregistrement.');};check();if(old?.ready)return {id};
 if(!old){const count=await db('rpc/nd_rate_hit','POST',{rate_key:'voice:'+actor+':'+Math.floor(Date.now()/900000),expiry:Date.now()+1800000});if(count>25)throw new VoiceError(429,'Une petite pause : réessayez dans quelques minutes.');await db('nd_voices?on_conflict=id','POST',record,'resolution=ignore-duplicates,return=representation');old=(await db('nd_voices?id=eq.'+id))[0];check();if(!old)throw new VoiceError(503,'Vocal non enregistré. Réessayez.');}
 // Retrying writes the exact same verified bytes to an immutable hash path.
 await storage(base,key,'object/'+BUCKET+'/'+record.path,'POST',data,{'Content-Type':mime,'x-upsert':'true','cache-control':'private, max-age=600'});
 await db('nd_voices?id=eq.'+id+'&owner=eq.'+actor,'PATCH',{ready:true});return {id};
}
export async function linkedVoice(id:string,actor:number,db:DB){const row=(await db('nd_voices?id=eq.'+voiceId(id)))[0];if(!row||!row.ready)throw new VoiceError(404,'Ce vocal n’est plus disponible.');if(row.owner!==actor){const linked=await db('nd_messages?voice_id=eq.'+id+'&select=id&limit=1');if(!linked.length)throw new VoiceError(403,'Ce vocal n’a pas été partagé.');}return row;}
export async function signedVoice(id:string,actor:number,db:DB,base:string,key:string){const row=await linkedVoice(id,actor,db);const r=await storage(base,key,'object/sign/'+BUCKET+'/'+row.path,'POST',JSON.stringify({expiresIn:600}),{'Content-Type':'application/json'});const data=await r.json();if(typeof data.signedURL!=='string'||!data.signedURL.startsWith('/object/sign/'+BUCKET+'/'))throw new VoiceError(503,'Lecture indisponible. Réessayez.');return {url:base+'/storage/v1'+data.signedURL,duration:row.duration_ms};}
export async function deleteVoice(id:string,actor:number,db:DB,base:string,key:string){
 const row=(await db('nd_voices?id=eq.'+voiceId(id)))[0];if(!row)return;
 if(row.owner!==actor)throw new VoiceError(403,'Vous pouvez retirer uniquement vos vocaux.');
 if((await db('nd_messages?voice_id=eq.'+id+'&select=id&limit=1')).length)throw new VoiceError(409,'Ce vocal est encore dans la discussion.');
 await storage(base,key,'object/'+BUCKET,'DELETE',JSON.stringify({prefixes:[row.path]}),{'Content-Type':'application/json'});
 await db('nd_voices?id=eq.'+id+'&owner=eq.'+actor,'DELETE');
}
