-- Private files; custom household sessions are checked by house-api before every upload/read/delete.
create table if not exists public.nd_attachments (
 id uuid primary key,
 owner smallint not null check(owner in (0,1)),
 name text not null check(char_length(name) between 1 and 180),
 path text not null unique,
 mime text not null,
 bytes integer not null check(bytes between 1 and 31457280),
 sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
 ready boolean not null default false,
 created_at timestamptz not null default clock_timestamp()
);
alter table public.nd_attachments enable row level security;
revoke all on public.nd_attachments from public,anon,authenticated;
grant all on public.nd_attachments to service_role;
alter table public.nd_messages add column if not exists attachment_id uuid references public.nd_attachments(id);
alter table public.nd_messages add column if not exists attachment_name text;
alter table public.nd_messages add column if not exists attachment_mime text;
alter table public.nd_messages add column if not exists attachment_bytes integer;
alter table public.nd_messages drop constraint if exists nd_messages_content_check;
alter table public.nd_messages add constraint nd_messages_content_check check (
 (voice_id is null and voice_duration is null and attachment_id is null and char_length(btrim(text)) between 1 and 2000)
 or (voice_id is not null and voice_duration is not null and attachment_id is null and text='' and voice_duration between 300 and 180000)
 or (voice_id is null and voice_duration is null and attachment_id is not null and char_length(text)<=2000 and attachment_name is not null and attachment_mime is not null and attachment_bytes is not null and attachment_bytes between 1 and 31457280)
);
create unique index if not exists nd_messages_attachment_id_idx on public.nd_messages(attachment_id) where attachment_id is not null;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('nous-deux-chat','nous-deux-chat',false,31457280,array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif','image/avif','application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain','text/csv'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
