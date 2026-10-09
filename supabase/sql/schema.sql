-- Single-household application. Only the authenticated Edge Function service may access these tables.
create table public.nd_state (id integer primary key check(id=1), version bigint not null default 1, data jsonb not null);
create table public.nd_access (id integer primary key check(id=1), salt text, password_hash text, setup_hash text not null, check ((salt is null) = (password_hash is null)));
create table public.nd_sessions (token_hash text primary key, expires_at bigint not null);
create index nd_sessions_expiry on public.nd_sessions(expires_at);
create table public.nd_rate (key text primary key, attempts integer not null, expires_at bigint not null);
create index nd_rate_expiry on public.nd_rate(expires_at);
create table public.nd_config (id integer primary key check(id=1), data jsonb not null);
alter table public.nd_state enable row level security;
alter table public.nd_access enable row level security;
alter table public.nd_sessions enable row level security;
alter table public.nd_rate enable row level security;
alter table public.nd_config enable row level security;
revoke all on public.nd_state,public.nd_access,public.nd_sessions,public.nd_rate,public.nd_config from public,anon,authenticated;
grant select,insert,update,delete on public.nd_state,public.nd_access,public.nd_sessions,public.nd_rate,public.nd_config to service_role;
create function public.nd_rate_hit(rate_key text,expiry bigint) returns integer language sql security invoker set search_path='' as $$
 insert into public.nd_rate(key,attempts,expires_at) values(rate_key,1,expiry)
 on conflict(key) do update set attempts=public.nd_rate.attempts+1 returning attempts;
$$;
revoke all on function public.nd_rate_hit(text,bigint) from public,anon,authenticated;
grant execute on function public.nd_rate_hit(text,bigint) to service_role;
