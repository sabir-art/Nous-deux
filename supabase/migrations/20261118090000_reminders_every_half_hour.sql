-- Nous deux — 18 November 2026: let the reminder scheduler call house-api every 30 minutes, all day.
--
-- The cron job « nous-deux-plant-reminders » (supabase/sql/photos-and-plant-reminders.sql) was created when only
-- the 09:00 plant reminder existed: its command ends with
--   where extract(hour from now() at time zone 'Europe/Paris')=9
-- so the route plant-reminders only ran at 09:00 and 09:30 (Paris). The agenda reminders (the day before at 19:00,
-- the same morning at 08:00), the missions of the day, the pet cares and, since this version, the plant reminder
-- at 08:00 and every time a person chooses (reminder-settings.ts) need a call every 30 minutes; house-api itself
-- decides what is due and answers « skipped » without any write when nothing is.
--
-- What this migration does, and only that:
--   * removes that hour filter from the job's command with cron.alter_job + regexp_replace(command, …);
--   * keeps the schedule '0,30 * * * *', the URL, the headers and the body exactly as they are.
-- The scheduler credential is never written here: the command keeps reading it from Vault
-- (vault.decrypted_secrets, name 'nous_deux_plant_reminders') at each run, as before.
--
-- Additive and idempotent: running it again (or on a job already without the filter) changes nothing;
-- without pg_cron or without the job, it only raises a notice. Nothing is created, deleted or reset.
-- To apply after house-api has been redeployed with this branch (an older house-api would only send plants at 09:00
-- and is still safe: it skips every other half hour without writing).
do $migration$
declare
 job record;
 filter constant text:='\s*where\s+extract\s*\(\s*hour\s+from\s+now\s*\(\s*\)\s+at\s+time\s+zone\s+''Europe/Paris''\s*\)\s*=\s*9\s*(?=;|$)';
 changed int:=0;
begin
 if to_regclass('cron.job') is null then
  raise notice 'pg_cron is not installed: nothing to change.';
  return;
 end if;
 for job in select jobid,schedule,command from cron.job where jobname='nous-deux-plant-reminders' loop
  if job.command ~* filter then
   perform cron.alter_job(job_id:=job.jobid,command:=regexp_replace(job.command,filter,'','gi'));
   changed:=changed+1;
  end if;
  if job.schedule<>'0,30 * * * *' then
   raise notice 'Job % runs on schedule %, expected 0,30 * * * * (left unchanged).',job.jobid,job.schedule;
  end if;
 end loop;
 if not found then
  raise notice 'No cron job named nous-deux-plant-reminders: nothing to change.';
 else
  raise notice 'Hour filter removed from % job(s).',changed;
 end if;
end
$migration$;

-- Check afterwards (shows no secret: the command only names the Vault entry):
--   select jobname,schedule,active,command ~* 'extract\s*\(\s*hour' as still_filtered from cron.job where jobname='nous-deux-plant-reminders';
--   -- expected: schedule 0,30 * * * *, active true, still_filtered false
--   select status,start_time from cron.job_run_details where jobid=(select jobid from cron.job where jobname='nous-deux-plant-reminders') order by start_time desc limit 4;
