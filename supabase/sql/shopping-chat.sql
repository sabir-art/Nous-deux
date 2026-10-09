-- Authenticated Edge Function is the only gateway; browser roles have no table access.
create table if not exists public.nd_messages (
 id uuid primary key,
 member smallint not null check (member in (0,1)),
 text text not null check (char_length(btrim(text)) between 1 and 2000),
 created_at timestamptz not null default clock_timestamp(),
 edited_at timestamptz,
 version integer not null default 1 check (version > 0)
);
create index if not exists nd_messages_created_idx on public.nd_messages(created_at desc, id desc);
alter table public.nd_messages enable row level security;
revoke all on public.nd_messages from public, anon, authenticated;
grant all on public.nd_messages to service_role;
-- Assign existing shopping items once. No owner or purchaser is inferred.
update public.nd_state set version=version+1, data=jsonb_set(data,'{items}',coalesce((
 select jsonb_agg(case when item->>'kind'='shopping' and not (item ? 'weekStart')
 then item || jsonb_build_object('weekStart',to_char(date_trunc('week',now() at time zone 'Europe/Paris'),'YYYY-MM-DD')) else item end)
 from jsonb_array_elements(data->'items') item
),'[]'::jsonb)) where id=1;
