-- Private compressed shopping photos; only the authenticated server can access them.
create table if not exists public.nd_photos (
 id uuid primary key,
 owner smallint not null check (owner in (0,1)),
 data text not null check (length(data) <= 360000 and data like 'data:image/jpeg;base64,%'),
 created_at timestamptz not null default now()
);
create index if not exists nd_photos_owner_idx on public.nd_photos(owner);
alter table public.nd_photos enable row level security;
revoke all on public.nd_photos from public, anon, authenticated;
grant all on public.nd_photos to service_role;
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
-- Generate the scheduler credential in the database: plaintext stays in Vault.
do $$
declare token text;
begin
 select decrypted_secret into token from vault.decrypted_secrets where name='nous_deux_plant_reminders' limit 1;
 if token is null then
  token:=encode(extensions.gen_random_bytes(32),'hex');
  perform vault.create_secret(token,'nous_deux_plant_reminders','Private plant reminder scheduler');
 end if;
 update public.nd_config set data=jsonb_set(data,'{plantReminderHash}',to_jsonb(encode(extensions.digest(token,'sha256'),'hex'))) where id=1;
end $$;
-- 09:00 in Paris, DST-aware. 09:30 is a retry for failed push requests only.
select cron.schedule('nous-deux-plant-reminders','0,30 * * * *',$cron$
 select net.http_post(
  url:='https://jvjwyalusdygvkyzmiez.supabase.co/functions/v1/house-api?route=plant-reminders',
  headers:=jsonb_build_object('Content-Type','application/json','apikey','sb_publishable_Ypq0tRBQvFG8ULhxRTIcEQ_GADD-nYn','x-plant-reminder',(select decrypted_secret from vault.decrypted_secrets where name='nous_deux_plant_reminders' limit 1)),
  body:='{}'::jsonb,timeout_milliseconds:=30000
 ) where extract(hour from now() at time zone 'Europe/Paris')=9;
$cron$);
