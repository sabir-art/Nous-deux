import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
// The cron migration on an isolated PGlite, with a stand-in for pg_cron's cron.job / cron.alter_job.
// The job is created from the real historical script, so the filter text is the one in production.
const {PGlite}=createRequire(import.meta.url)(process.env.PGLITE_MODULE||'@electric-sql/pglite');
const db=new PGlite();
const migration=readFileSync('supabase/migrations/20261118090000_reminders_every_half_hour.sql','utf8');
try{
 // Without pg_cron: only a notice.
 await db.exec(migration);
 await db.exec(`create schema cron;create table cron.job(jobid bigserial primary key,jobname text,schedule text,command text,active boolean default true);
 create function cron.schedule(name text,sched text,cmd text) returns bigint language sql as $$insert into cron.job(jobname,schedule,command) values(name,sched,cmd) returning jobid$$;
 create function cron.alter_job(job_id bigint,schedule text default null,command text default null,database text default null,username text default null,active boolean default null) returns void language sql as
 $$update cron.job set schedule=coalesce(alter_job.schedule,job.schedule),command=coalesce(alter_job.command,job.command),active=coalesce(alter_job.active,job.active) where jobid=job_id$$;`);
 // Without the job: only a notice.
 await db.exec(migration);
 const script=readFileSync('supabase/sql/photos-and-plant-reminders.sql','utf8');
 await db.exec(script.slice(script.indexOf("select cron.schedule('nous-deux-plant-reminders'")));
 const before=(await db.query("select schedule,command from cron.job where jobname='nous-deux-plant-reminders'")).rows[0];
 assert.match(before.command,/=9;/,'the historical job is filtered on 09:00');
 await db.exec(migration);
 const after=(await db.query("select schedule,command,active from cron.job where jobname='nous-deux-plant-reminders'")).rows[0];
 assert.equal(after.schedule,'0,30 * * * *');assert.equal(after.active,true);
 assert.doesNotMatch(after.command,/extract\s*\(\s*hour/i,'hour filter removed');
 assert.equal(after.command,before.command.replace(/\s*where extract\(hour from now\(\) at time zone 'Europe\/Paris'\)=9/,''),'nothing else changes');
 assert.match(after.command,/vault\.decrypted_secrets where name='nous_deux_plant_reminders'/,'the credential is still read from Vault at each run');
 assert.match(after.command,/timeout_milliseconds:=30000\s*\n?\s*\);\s*$/,'the statement stays complete');
 // Idempotent: a second run changes nothing.
 await db.exec(migration);
 assert.equal((await db.query("select command from cron.job where jobname='nous-deux-plant-reminders'")).rows[0].command,after.command);
 assert.doesNotMatch(migration,/[a-f0-9]{64}/,'no credential in the migration');
 console.log('PASS: cron migration removes only the 09:00 filter, keeps schedule, Vault credential and command, and is idempotent.');
}finally{await db.close();}
