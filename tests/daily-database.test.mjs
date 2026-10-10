// Execute the real SQL in an isolated PostgreSQL engine, never the live project.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const {PGlite}=createRequire(import.meta.url)(process.env.PGLITE_MODULE||'@electric-sql/pglite');
const db=new PGlite();
try{
 await db.exec('create role anon;create role authenticated;create role service_role bypassrls;alter default privileges in schema public grant all on tables to service_role;');
 await db.exec(readFileSync('supabase/migrations/20261010130433_daily_private_calls.sql','utf8'));
 await db.exec(readFileSync('supabase/migrations/20261010130611_daily_call_history_permissions.sql','utf8'));
 const id=crypto.randomUUID(),t=Date.UTC(2026,9,10),device='a'.repeat(64);
 const insert=(id,state='ringing')=>db.query(`insert into public.nd_daily_calls (id,caller,mode,state,caller_device,room_name,created_at,expires_at,max_expires_at,caller_seen) values ($1,0,'audio',$2,$3,$4,$5,$6,$7,$5)`,[id,state,device,'nd-'+id,t,t+90000,t+7200000]);
 await db.exec('set role service_role');await insert(id);
 await assert.rejects(insert(crypto.randomUUID()),e=>e.code==='23505');
 const first=await db.query(`update public.nd_daily_calls set state='connecting',callee_device=$1,version=1 where id=$2 and version=0 returning id`,['b'.repeat(64),id]);assert.equal(first.rows.length,1);
 const second=await db.query(`update public.nd_daily_calls set callee_device=$1,version=1 where id=$2 and version=0 returning id`,['c'.repeat(64),id]);assert.equal(second.rows.length,0);
 const usage=await db.query('select public.nd_daily_usage($1,$2) as minutes',[t,t+60000]);assert.equal(Number(usage.rows[0].minutes),2);
 await assert.rejects(db.query('delete from public.nd_daily_calls where id=$1',[id]),e=>e.code==='42501');
 await db.query(`update public.nd_daily_calls set state='ended',ended_at=$1 where id=$2`,[t+60000,id]);await insert(crypto.randomUUID());
 for(const role of ['anon','authenticated']){
  await db.exec('reset role;set role '+role);
  await assert.rejects(db.query('select * from public.nd_daily_calls'),e=>e.code==='42501');
  await assert.rejects(db.query('select public.nd_daily_usage($1,$2)',[t,t+60000]),e=>e.code==='42501');
 }
 await db.exec('reset role');const security=await db.query("select relrowsecurity from pg_class where oid='public.nd_daily_calls'::regclass");assert.equal(security.rows[0].relrowsecurity,true);
 console.log('PASS: real PostgreSQL migration, single active call, atomic answer, minute estimate, RLS and direct-access restrictions.');
}finally{await db.close();}
