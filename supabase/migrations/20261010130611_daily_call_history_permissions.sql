-- Supabase default privileges grant ALL to service_role on new tables.
-- Keep call history append/update-only for the application server.
revoke all on public.nd_daily_calls from service_role;
grant select, insert, update on public.nd_daily_calls to service_role;
