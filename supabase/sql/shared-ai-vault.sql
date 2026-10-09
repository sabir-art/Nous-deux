-- Only the Edge Function's service role can read/write this encrypted secret.
-- No credential belongs in this migration, in nd_state, or in browser storage.
create or replace function public.nd_openai_key_get()
returns text language sql stable security invoker set search_path = '' as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'nous_deux_openai_key' limit 1;
$$;
create or replace function public.nd_openai_key_set(api_key text)
returns void language plpgsql security invoker set search_path = '' as $$
declare secret_id uuid;
begin
  if api_key is null or length(api_key) < 23 or length(api_key) > 503 or api_key !~ '^sk-[A-Za-z0-9_-]+$' then
    raise exception 'Invalid API key format';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('nous_deux_openai_key'));
  select id into secret_id from vault.secrets where name = 'nous_deux_openai_key';
  if secret_id is null then
    perform vault.create_secret(api_key, 'nous_deux_openai_key', 'Shared Nous deux recipe discovery');
  else
    perform vault.update_secret(secret_id, api_key);
  end if;
end;
$$;
revoke all on function public.nd_openai_key_get() from public, anon, authenticated;
revoke all on function public.nd_openai_key_set(text) from public, anon, authenticated;
grant execute on function public.nd_openai_key_get() to service_role;
grant execute on function public.nd_openai_key_set(text) to service_role;
