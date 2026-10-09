// Chat files stay in a private bucket. Only authenticated household members receive expiring URLs.
export class AttachmentError extends Error{constructor(public status:number,message:string){super(message);}}
export const MAX_ATTACHMENT_BYTES=30*1024*1024;
const BUCKET='nous-deux-chat',uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type DB=(path:string,method?:string,body?:unknown,prefer?:string)=>Promise<any>;
export function attachmentId(value:unknown){if(typeof value!=='string'||!uuid.test(value))throw new AttachmentError(400,'Fichier invalide.');return value;}
export function fileName(value:string){const name=value.normalize('NFC').replace(/[\u0000-\u001f\u007f/\\\u202a-\u202e\u2066-\u2069]/g,'_').trim();if(!name||name.length>180)throw new AttachmentError(400,'Le nom du fichier doit contenir entre 1 et 180 caractères.');return name;}
export function fileFormat(bytes:Uint8Array,name:string){
 if(!bytes.length||bytes.length>MAX_ATTACHMENT_BYTES)throw new AttachmentError(413,'Choisissez un fichier non vide de 30 Mo maximum.');
 const head=new TextDecoder('ascii').decode(bytes.subarray(0,32)),ext=name.split('.').at(-1)?.toLowerCase();
 if(['jpg','jpeg'].includes(ext||'')&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return {mime:'image/jpeg',ext:'jpg'};
 if(ext==='png'&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return {mime:'image/png',ext};
 if(ext==='webp'&&head.startsWith('RIFF')&&head.slice(8,12)==='WEBP')return {mime:'image/webp',ext};
 if(ext==='gif'&&/^GIF8[79]a/.test(head))return {mime:'image/gif',ext};
 if(['heic','heif','avif'].includes(ext||'')&&head.slice(4,8)==='ftyp'&&/^(heic|heix|hevc|hevx|mif1|msf1|avif|avis)$/.test(head.slice(8,12)))return {mime:ext==='avif'?'image/avif':ext==='heic'?'image/heic':'image/heif',ext:ext!};
 if(ext==='pdf'&&head.startsWith('%PDF-'))return {mime:'application/pdf',ext};
 const office:Record<string,string>={docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation'};
 if(ext&&office[ext]&&bytes[0]===80&&bytes[1]===75&&bytes[2]===3&&bytes[3]===4)return {mime:office[ext],ext};
 if(['txt','csv'].includes(ext||'')){try{const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);if(!text.includes('\0'))return {mime:ext==='csv'?'text/csv':'text/plain',ext:ext!};}catch{}}
 throw new AttachmentError(415,'Envoyez une photo (JPG, PNG, GIF, WebP, HEIC, AVIF), un PDF, un document Office récent, TXT ou CSV.');
}
async function boundedBody(req:Request){
 if(Number(req.headers.get('content-length')||0)>MAX_ATTACHMENT_BYTES)throw new AttachmentError(413,'Ce fichier dépasse 30 Mo.');
 if(!req.body)throw new AttachmentError(400,'Le fichier est vide.');
 const reader=req.body.getReader(),chunks:Uint8Array[]=[];let size=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_ATTACHMENT_BYTES){await reader.cancel();throw new AttachmentError(413,'Ce fichier dépasse 30 Mo.');}chunks.push(value);}}finally{reader.releaseLock();}
 const out=new Uint8Array(size);let offset=0;for(const c of chunks){out.set(c,offset);offset+=c.length;}return out;
}
async function storage(base:string,key:string,path:string,method:string,body:BodyInit,extra:Record<string,string>={}){const r=await fetch(base+'/storage/v1/'+path,{method,headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{}),...extra},body,signal:AbortSignal.timeout(90000)});if(!r.ok)throw new AttachmentError(503,'Le fichier n’a pas pu être enregistré. Réessayez sans fermer cet écran.');return r;}
export async function uploadAttachment(req:Request,actor:number,db:DB,base:string,key:string){
 const url=new URL(req.url),id=attachmentId(url.searchParams.get('id')),name=fileName(url.searchParams.get('name')||'');
 const data=await boundedBody(req),{mime,ext}=fileFormat(data,name);
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');
 const record={id,owner:actor,name,path:`${actor}/${id}/${digest}.${ext}`,mime,bytes:data.length,sha256:digest,ready:false};
 let old=(await db('nd_attachments?id=eq.'+id))[0];
 const check=()=>{if(old&&(old.owner!==actor||old.sha256!==digest||old.name!==name||old.mime!==mime))throw new AttachmentError(409,'Cet envoi correspond déjà à un autre fichier. Choisissez à nouveau le fichier.');};check();if(old?.ready)return {id};
 if(!old){const count=await db('rpc/nd_rate_hit','POST',{rate_key:'attachment:'+actor+':'+Math.floor(Date.now()/900000),expiry:Date.now()+1800000});if(count>40)throw new AttachmentError(429,'Beaucoup de fichiers envoyés ! Réessayez dans quelques minutes.');await db('nd_attachments?on_conflict=id','POST',record,'resolution=ignore-duplicates,return=representation');old=(await db('nd_attachments?id=eq.'+id))[0];check();if(!old)throw new AttachmentError(503,'Envoi interrompu. Réessayez.');}
 await storage(base,key,'object/'+BUCKET+'/'+record.path,'POST',data,{'Content-Type':mime,'x-upsert':'true','cache-control':'private, max-age=600'});
 await db('nd_attachments?id=eq.'+id+'&owner=eq.'+actor,'PATCH',{ready:true});return {id};
}
export async function signedAttachment(id:string,actor:number,db:DB,base:string,key:string){
 const row=(await db('nd_attachments?id=eq.'+attachmentId(id)))[0];if(!row?.ready)throw new AttachmentError(404,'Ce fichier n’est plus disponible.');
 if(row.owner!==actor&&!(await db('nd_messages?attachment_id=eq.'+id+'&select=id&limit=1')).length)throw new AttachmentError(403,'Ce fichier n’a pas été partagé.');
 const r=await storage(base,key,'object/sign/'+BUCKET+'/'+row.path,'POST',JSON.stringify({expiresIn:600}),{'Content-Type':'application/json'}),data=await r.json();
 if(typeof data.signedURL!=='string'||!data.signedURL.startsWith('/object/sign/'+BUCKET+'/'))throw new AttachmentError(503,'Ouverture indisponible. Réessayez.');
 const url=base+'/storage/v1'+data.signedURL,download=new URL(url);download.searchParams.set('download',row.name);
 return {url:row.mime.startsWith('image/')||row.mime==='application/pdf'?url:download.href,download:download.href,name:row.name,mime:row.mime,bytes:row.bytes};
}
export async function deleteAttachment(id:string,actor:number,db:DB,base:string,key:string){
 const row=(await db('nd_attachments?id=eq.'+attachmentId(id)))[0];if(!row)return;
 if(row.owner!==actor)throw new AttachmentError(403,'Vous pouvez retirer uniquement vos propres fichiers.');
 if((await db('nd_messages?attachment_id=eq.'+id+'&select=id&limit=1')).length)throw new AttachmentError(409,'Ce fichier est encore dans la discussion.');
 await storage(base,key,'object/'+BUCKET,'DELETE',JSON.stringify({prefixes:[row.path]}),{'Content-Type':'application/json'});
 await db('nd_attachments?id=eq.'+id+'&owner=eq.'+actor,'DELETE');
}
