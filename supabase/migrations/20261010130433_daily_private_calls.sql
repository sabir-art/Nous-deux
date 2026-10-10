-- Additive only: no existing household records or history are changed.
create table public.nd_daily_calls (
 id uuid primary key,
 household_id smallint not null default 1 check (household_id=1),
 caller smallint not null check(caller in (0,1)),
 mode text not null check(mode in ('audio','video')),
 state text not null check(state in ('preparing','ringing','connecting','connected','ended','declined','missed','failed')),
 caller_device text not null check(length(caller_device)=64),
 callee_device text check(callee_device is null or length(callee_device)=64),
 room_name text not null unique,
 room_url text,
 created_at bigint not null,
 expires_at bigint not null,
 max_expires_at bigint not null,
 caller_seen bigint not null,
 callee_seen bigint,
 connected_at bigint,
 ended_at bigint,
 end_reason text,
 version integer not null default 0,
 notified boolean not null default false,
 cleanup_pending boolean not null default false,
 cleanup_after bigint not null default 0
);
-- Only one active invitation or call, including during remote room creation.
create unique index nd_daily_one_active on public.nd_daily_calls(household_id)
 where state in ('preparing','ringing','connecting','connected');
create index nd_daily_history on public.nd_daily_calls(created_at desc);
create index nd_daily_cleanup on public.nd_daily_calls(cleanup_after) where cleanup_pending;
alter table public.nd_daily_calls enable row level security;
revoke all on public.nd_daily_calls from public,anon,authenticated;
grant select,insert,update on public.nd_daily_calls to service_role;
-- Conservative estimate, not Daily's billing meter. Counts both participants from
-- room creation, includes ringing, and caps crashed sessions at their expiry.
create function public.nd_daily_usage(month_start bigint,at_time bigint) returns numeric
language sql stable security invoker set search_path='' as $$
 select coalesce(ceil(sum(greatest(0,least(coalesce(ended_at,at_time),max_expires_at,case when ended_at is null then expires_at else ended_at end)-greatest(created_at,month_start)))/30000.0),0)
 from public.nd_daily_calls where max_expires_at>=month_start;
$$;
revoke all on function public.nd_daily_usage(bigint,bigint) from public,anon,authenticated;
grant execute on function public.nd_daily_usage(bigint,bigint) to service_role;
