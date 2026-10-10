import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const {PGlite}=createRequire(import.meta.url)(process.env.PGLITE_MODULE||'@electric-sql/pglite');
const db=new PGlite();
try{
 await db.exec('create table nd_state(id integer,version integer,data jsonb);create role anon;create role authenticated;create role service_role bypassrls;alter default privileges in schema public grant all on tables to service_role;');
 for(const path of ['supabase/sql/shopping-chat.sql','supabase/sql/chat-voices.sql','supabase/sql/chat-attachments.sql'])await db.exec(readFileSync(path,'utf8').split('insert into storage.buckets')[0]);
 await db.exec(readFileSync('supabase/migrations/20261010173819_chat_controls_and_preferences.sql','utf8'));
 await db.exec('set role service_role');
 const add=async(member,text='Bonjour',age=0)=>{const id=crypto.randomUUID();await db.query("insert into nd_messages(id,member,text,created_at) values($1,$2,$3,clock_timestamp()-($4::text||' seconds')::interval)",[id,member,text,age]);return id;};
 const change=async(actor,action,id=null,version=1,text=null,scope='me')=>(await db.query('select nd_chat_change($1,$2,$3,$4,$5,$6) as result',[actor,action,id,version,text,scope])).rows[0].result;
 const read=async actor=>(await db.query('select nd_chat_read($1) as result',[actor])).rows[0].result.messages;
 const id=await add(0),received=await add(1);
 assert.equal((await change(1,'edit',id,1,'Spoof')).status,403);
 assert.equal((await change(0,'edit',id,1,'Corrigé')).ok,true);
 assert.equal((await change(0,'edit',id,1,'Stale')).status,409);
 const expired=await add(0,'Un ancien message',901);
 assert.equal((await change(0,'edit',expired,1,'Too late')).status,403);
 assert.equal((await change(0,'delete',id,2)).ok,true);
 assert.equal((await read(0)).find(m=>m.id===id).text,'');assert.equal((await read(0)).find(m=>m.id===id).deleted,'me');
 assert.equal((await read(1)).find(m=>m.id===id).text,'Corrigé');assert.equal((await read(1)).find(m=>m.id===id).deleted,null);
 assert.equal((await change(0,'hide',id)).ok,true);assert(!(await read(0)).some(m=>m.id===id));assert((await read(1)).some(m=>m.id===id));
 assert.equal((await change(0,'delete',received,1,null,'everyone')).status,403);
 assert.equal((await change(0,'delete',expired,1,null,'everyone')).ok,true);assert.equal((await read(1)).find(m=>m.id===expired).deleted,'everyone');
 const own=await add(0,'À effacer');await change(0,'clear',null,1,null,'me');assert((await read(0)).every(m=>m.member===1));assert.equal((await read(1)).find(m=>m.id===own).text,'À effacer');
 await change(0,'clear',null,1,null,'everyone');assert.equal((await read(1)).find(m=>m.id===own).deleted,'everyone');assert.equal((await read(0)).find(m=>m.id===received).text,'Bonjour');
 const attachment=crypto.randomUUID(),message=crypto.randomUUID();await db.query("insert into nd_attachments(id,owner,name,path,mime,bytes,sha256,ready) values($1,0,'p.pdf','test','application/pdf',10,$2,true)",[attachment,'a'.repeat(64)]);await db.query("insert into nd_messages(id,member,text,attachment_id,attachment_name,attachment_mime,attachment_bytes) values($1,0,'',$2,'p.pdf','application/pdf',10)",[message,attachment]);
 const result=await change(0,'delete',message,1,null,'everyone');assert.equal(result.cleanup[0].attachmentId,attachment);assert.equal((await db.query('select ready from nd_attachments where id=$1',[attachment])).rows[0].ready,false);assert.equal((await read(1)).find(m=>m.id===message).attachment_id,null);
 const boundary=await add(0,'exactly 15 minutes',900);assert.equal((await change(0,'edit',boundary,1,'Late')).status,403);
 for(const role of ['anon','authenticated']){await db.exec('reset role;set role '+role);for(const query of ['select * from nd_messages','select * from nd_chat_preferences','select nd_chat_read(0)',"select nd_chat_change(0,'clear')"])await assert.rejects(db.query(query),e=>e.code==='42501');}
 console.log('PASS: PostgreSQL chat edit deadline, ownership, private deletion, tombstones, own-message bulk clearing, media revocation, RLS and RPC permissions.');
}finally{await db.close();}
