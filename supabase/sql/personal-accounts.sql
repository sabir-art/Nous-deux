-- Personal credentials; previous shared sessions have no member and are rejected.
create table public.nd_members(member integer primary key check(member in (0,1)),salt text,password_hash text,setup_hash text not null,check((salt is null)=(password_hash is null)));
alter table public.nd_members enable row level security;
revoke all on public.nd_members from public,anon,authenticated;
grant select,insert,update,delete on public.nd_members to service_role;
alter table public.nd_sessions add column member integer references public.nd_members(member);
-- Old payments are attributed to their recorded payer. Other legacy records are
-- left without an owner and remain visible, but cannot be changed by either account.
update public.nd_state set data=jsonb_set(data,'{entries}',coalesce((select jsonb_agg(e || jsonb_build_object('owner',(e->>'member')::integer)) from jsonb_array_elements(data->'entries') e),'[]'::jsonb)),version=version+1;
