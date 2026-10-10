-- Custom house sessions are checked by the Edge Function. No browser role may
-- select these tables or call these service-only routines with a forged actor.
alter table public.nd_messages add column deleted_at timestamptz;
alter table public.nd_messages add column removed_for smallint[] not null default '{}';
alter table public.nd_messages add column hidden_for smallint[] not null default '{}';
alter table public.nd_messages drop constraint nd_messages_content_check;
alter table public.nd_messages add constraint nd_messages_content_check check (
 (deleted_at is not null and text = '' and voice_id is null and attachment_id is null)
 or (deleted_at is null and (
  (char_length(text) between 1 and 2000 and voice_id is null and attachment_id is null)
  or (text = '' and voice_id is not null and voice_duration between 300 and 180000 and attachment_id is null)
  or (voice_id is null and attachment_id is not null and char_length(text) <= 2000 and attachment_name is not null and attachment_mime is not null and attachment_bytes between 1 and 31457280)
 )));
create table public.nd_chat_preferences (
 member smallint primary key check(member in (0,1)),
 theme text not null default 'rose' check(theme in ('rose','lavande','menthe','beurre','peche','neutre'))
);
alter table public.nd_chat_preferences enable row level security;
revoke all on public.nd_chat_preferences from public, anon, authenticated;
grant select, insert, update on public.nd_chat_preferences to service_role;

create function public.nd_chat_read(p_actor integer, p_before timestamptz default null, p_before_id uuid default null, p_ids uuid[] default '{}') returns jsonb
language sql stable security invoker set search_path = '' as $$
 with recent as (
  select * from public.nd_messages m where p_actor in (0,1) and not p_actor = any(m.hidden_for)
  and (p_before is null or (m.created_at,m.id) < (p_before,p_before_id))
  order by m.created_at desc,m.id desc limit 60
 ), selected as (
  select * from recent union select * from public.nd_messages m
  where p_actor in (0,1) and m.id = any(p_ids) and not p_actor = any(m.hidden_for)
 ), projected as (
  select m.created_at,m.id,jsonb_build_object('id',m.id,'member',m.member,'created_at',m.created_at,'version',m.version,
   'deleted',case when m.deleted_at is not null then 'everyone' when p_actor = any(m.removed_for) then 'me' else null end,
   'text',case when m.deleted_at is not null or p_actor = any(m.removed_for) then '' else m.text end,
   'edited_at',case when m.deleted_at is not null or p_actor = any(m.removed_for) then null else m.edited_at end,
   'editable_until',case when m.member=p_actor and m.deleted_at is null and not p_actor = any(m.removed_for) and m.voice_id is null and m.attachment_id is null then m.created_at + interval '15 minutes' else null end,
   'voice_id',case when m.deleted_at is null and not p_actor = any(m.removed_for) then m.voice_id else null end,
   'voice_duration',case when m.deleted_at is null and not p_actor = any(m.removed_for) then m.voice_duration else null end,
   'attachment_id',case when m.deleted_at is null and not p_actor = any(m.removed_for) then m.attachment_id else null end,
   'attachment_name',case when m.deleted_at is null and not p_actor = any(m.removed_for) then m.attachment_name else null end,
   'attachment_mime',case when m.deleted_at is null and not p_actor = any(m.removed_for) then m.attachment_mime else null end,
   'attachment_bytes',case when m.deleted_at is null and not p_actor = any(m.removed_for) then m.attachment_bytes else null end
  ) as data from selected m
 ) select jsonb_build_object('messages',coalesce((select jsonb_agg(data order by created_at,id) from projected),'[]'::jsonb),'hasMore',(select count(*)=60 from recent),'serverNow',clock_timestamp());
$$;

create function public.nd_chat_change(p_actor integer,p_action text,p_id uuid default null,p_version integer default null,p_text text default null,p_scope text default 'me') returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare m public.nd_messages; cleanup jsonb := '[]'; cutoff timestamptz := clock_timestamp();
begin
 if p_actor not in (0,1) or p_actor is null or p_action not in ('edit','delete','hide','clear') or p_scope not in ('me','everyone') then
  return jsonb_build_object('status',400,'error','Action invalide.');
 end if;
 if p_action='clear' then
  -- Lock precisely the sender's existing messages. Never erase the partner's messages.
  for m in select * from public.nd_messages where member=p_actor and created_at<=cutoff order by id for update loop
   if p_scope='everyone' and m.deleted_at is null then
    cleanup := cleanup || jsonb_build_array(jsonb_build_object('voiceId',m.voice_id,'attachmentId',m.attachment_id));
    update public.nd_voices set ready=false where id=m.voice_id;
    update public.nd_attachments set ready=false where id=m.attachment_id;
    update public.nd_messages set deleted_at=cutoff,text='',voice_id=null,voice_duration=null,attachment_id=null,attachment_name=null,attachment_mime=null,attachment_bytes=null,edited_at=null,version=version+1 where id=m.id;
   end if;
   update public.nd_messages set hidden_for=array(select distinct unnest(hidden_for || p_actor::smallint)) where id=m.id;
  end loop;
  return jsonb_build_object('ok',true,'cleanup',cleanup);
 end if;
 select * into m from public.nd_messages where id=p_id for update;
 if not found or p_actor=any(m.hidden_for) then return jsonb_build_object('status',404,'error','Ce message n’est plus visible.'); end if;
 if p_action='hide' then
  if m.deleted_at is null and not p_actor=any(m.removed_for) then return jsonb_build_object('status',400,'error','Supprimez d’abord le message pour vous.'); end if;
  update public.nd_messages set hidden_for=array(select distinct unnest(hidden_for || p_actor::smallint)) where id=m.id;
 elsif p_action='delete' and p_scope='me' then
  update public.nd_messages set removed_for=array(select distinct unnest(removed_for || p_actor::smallint)) where id=m.id;
 else
  if m.member<>p_actor then return jsonb_build_object('status',403,'error','Vous contrôlez uniquement vos propres messages.'); end if;
  if m.version is distinct from p_version then return jsonb_build_object('status',409,'error','Ce message a changé. Actualisez la discussion.'); end if;
  if p_action='edit' then
   if m.deleted_at is not null or p_actor=any(m.removed_for) or m.voice_id is not null or m.attachment_id is not null then return jsonb_build_object('status',400,'error','Ce message ne peut pas être modifié.'); end if;
   if clock_timestamp()>=m.created_at+interval '15 minutes' then return jsonb_build_object('status',403,'error','Les 15 minutes sont écoulées. Vous pouvez encore supprimer votre message.'); end if;
   if p_text is null or char_length(trim(p_text)) not between 1 and 2000 then return jsonb_build_object('status',400,'error','Texte invalide.'); end if;
   update public.nd_messages set text=trim(p_text),edited_at=clock_timestamp(),version=version+1 where id=m.id;
  elsif m.deleted_at is null then
   cleanup := jsonb_build_array(jsonb_build_object('voiceId',m.voice_id,'attachmentId',m.attachment_id));
   update public.nd_voices set ready=false where id=m.voice_id;
   update public.nd_attachments set ready=false where id=m.attachment_id;
   update public.nd_messages set deleted_at=cutoff,text='',voice_id=null,voice_duration=null,attachment_id=null,attachment_name=null,attachment_mime=null,attachment_bytes=null,edited_at=null,version=version+1 where id=m.id;
  end if;
 end if;
 return jsonb_build_object('ok',true,'cleanup',cleanup);
end;
$$;
revoke all on function public.nd_chat_read(integer,timestamptz,uuid,uuid[]) from public,anon,authenticated;
revoke all on function public.nd_chat_change(integer,text,uuid,integer,text,text) from public,anon,authenticated;
grant execute on function public.nd_chat_read(integer,timestamptz,uuid,uuid[]) to service_role;
grant execute on function public.nd_chat_change(integer,text,uuid,integer,text,text) to service_role;
