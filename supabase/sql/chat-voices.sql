-- Custom household sessions are authorized by house-api. No browser table or bucket access.
create table if not exists public.nd_voices (
 id uuid primary key,
 owner smallint not null check (owner in (0,1)),
 path text not null unique,
 mime text not null check (mime in ('audio/mp4','audio/webm','audio/ogg')),
 bytes integer not null check (bytes between 12 and 8388608),
 duration_ms integer not null check (duration_ms between 300 and 180000),
 sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
 ready boolean not null default false,
 created_at timestamptz not null default clock_timestamp()
);
alter table public.nd_voices enable row level security;
revoke all on public.nd_voices from public, anon, authenticated;
grant all on public.nd_voices to service_role;
alter table public.nd_messages add column if not exists voice_id uuid references public.nd_voices(id);
alter table public.nd_messages add column if not exists voice_duration integer;
alter table public.nd_messages drop constraint if exists nd_messages_text_check;
alter table public.nd_messages add constraint nd_messages_content_check check (
 (voice_id is null and voice_duration is null and char_length(btrim(text)) between 1 and 2000)
 or (voice_id is not null and voice_duration is not null and text = '' and voice_duration between 300 and 180000)
);
create unique index if not exists nd_messages_voice_id_idx on public.nd_messages (voice_id) where voice_id is not null;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('nous-deux-voices','nous-deux-voices',false,8388608,array['audio/mp4','audio/webm','audio/ogg'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
