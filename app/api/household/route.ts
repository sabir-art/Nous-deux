import {getHouseUser} from '../../../lib/house-auth';
import {getDb} from '../../../db';
import {households,entries,items,appointments} from '../../../db/schema';
import {and,eq,desc,sql} from 'drizzle-orm';
import {entryInput,itemInput,householdInput,deleteInput,appointmentInput} from '../../../lib/validation';
import {recordChange} from '../../../lib/push';
import {changeDescription} from '../../../lib/communication';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store, private','Vary':'Cookie','X-Content-Type-Options':'nosniff'}});
const conflict=()=>json({error:'Cet élément a changé sur un autre appareil. Fermez ce formulaire puis rouvrez-le pour vérifier la dernière version.'},409);
export async function GET(){
 const user=await getHouseUser();if(!user)return json({error:'Connectez-vous pour accéder à votre maison.'},401);
 try{const db=getDb();const[home,ledger,lists,events]=await Promise.all([
 db.select().from(households).where(eq(households.userId,user.userId)),
 db.select().from(entries).where(eq(entries.userId,user.userId)).orderBy(desc(entries.date),desc(entries.createdAt)),
 db.select().from(items).where(eq(items.userId,user.userId)).orderBy(desc(items.createdAt)),
 db.select().from(appointments).where(eq(appointments.userId,user.userId)).orderBy(desc(appointments.createdAt))]);
 return json({household:home[0]??null,entries:ledger,items:lists,appointments:events});
 }catch{return json({error:'Impossible de charger votre maison. Réessayez dans un instant.'},503);}
}
export async function POST(request:Request){
 const user=await getHouseUser();if(!user)return json({error:'Votre session a expiré. Reconnectez-vous.'},401);
 if(request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Requête non autorisée.'},403);
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'Origine non autorisée.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Format non valide.'},415);
 try{const raw=await request.text();if(raw.length>8192)return json({error:'Contenu trop volumineux.'},413);
 const{action,payload}=JSON.parse(raw);const db=getDb();const userId=user.userId;
 if(action==='household'){
  const{version,...values}=householdInput.parse(payload);
  if(version===0){const saved=await db.insert(households).values({...values,userId,version:1}).onConflictDoNothing().returning({id:households.userId});if(!saved.length)return conflict();}
  else{const saved=await db.update(households).set({...values,version:sql`${households.version}+1`}).where(and(eq(households.userId,userId),eq(households.version,version))).returning({id:households.userId});if(!saved.length)return conflict();}
 }else{
  const home=await db.select({id:households.userId}).from(households).where(eq(households.userId,userId)).limit(1);if(!home.length)return json({error:'Configurez votre maison avant de commencer.'},400);
  if(action==='entry'){
   const{version,...p}=entryInput.parse(payload);
   if(version===0){const saved=await db.insert(entries).values({...p,userId,version:1,createdAt:new Date().toISOString()}).onConflictDoNothing().returning({id:entries.id});if(!saved.length)return conflict();}
   else{const saved=await db.update(entries).set({...p,version:sql`${entries.version}+1`}).where(and(eq(entries.id,p.id),eq(entries.userId,userId),eq(entries.version,version))).returning({id:entries.id});if(!saved.length)return conflict();}
  }else if(action==='item'){
   const{version,...p}=itemInput.parse(payload);
   if(version===0){const saved=await db.insert(items).values({...p,userId,version:1,createdAt:new Date().toISOString()}).onConflictDoNothing().returning({id:items.id});if(!saved.length)return conflict();}
   else{const saved=await db.update(items).set({...p,version:sql`${items.version}+1`}).where(and(eq(items.id,p.id),eq(items.userId,userId),eq(items.version,version))).returning({id:items.id});if(!saved.length)return conflict();}
  }else if(action==='appointment'){
   const{version,...p}=appointmentInput.parse(payload);
   if(version===0){const saved=await db.insert(appointments).values({...p,userId,version:1,createdAt:new Date().toISOString()}).onConflictDoNothing().returning({id:appointments.id});if(!saved.length)return conflict();}
   else{const saved=await db.update(appointments).set({...p,version:sql`${appointments.version}+1`}).where(and(eq(appointments.id,p.id),eq(appointments.userId,userId),eq(appointments.version,version))).returning({id:appointments.id});if(!saved.length)return conflict();}
  }else if(action==='delete-appointment'){
   const p=deleteInput.parse(payload);
   const saved=await db.delete(appointments).where(and(eq(appointments.id,p.id),eq(appointments.userId,userId),eq(appointments.version,p.version))).returning({id:appointments.id});if(!saved.length)return conflict();
  }else if(action==='delete-entry'||action==='delete-item'){
   const p=deleteInput.parse(payload);const table=action==='delete-entry'?entries:items;
   const saved=await db.delete(table).where(and(eq(table.id,p.id),eq(table.userId,userId),eq(table.version,p.version))).returning({id:table.id});if(!saved.length)return conflict();
  }else{return json({error:'Action inconnue.'},400);}
 }
 const actor=Number(request.headers.get('x-adeux-member'));const description=changeDescription(action,payload||{});
 if(description&&request.headers.has('x-adeux-member')&&(actor===0||actor===1)){
  try{await recordChange(userId,actor,description.category,description.message,request.headers.get('x-adeux-device')||'');}catch{/* The underlying change is saved. Notification failure must not invite a duplicate write. */}
 }
 return json({ok:true});
 }catch(error){if(error instanceof SyntaxError)return json({error:'Données invalides.'},400);if(error&&typeof error==='object'&&'issues' in error)return json({error:'Vérifiez les champs : prénom, montant, intitulé ou date invalide.'},400);return json({error:'Enregistrement impossible. Vérifiez votre connexion puis réessayez.'},503);}
}
