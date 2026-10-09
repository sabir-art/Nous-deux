-- Backfill dated invitations already accepted by both partners. Preserve all existing events.
-- The API maintains future invitation/event changes atomically inside nd_state.
do $$
declare
 snapshot jsonb;
 idea jsonb;
 events jsonb;
 event jsonb;
 changed boolean := false;
begin
 select data into snapshot from public.nd_state where id=1 for update;
 if snapshot is null then return; end if;
 events := coalesce(snapshot->'appointments','[]'::jsonb);
 for idea in select value from jsonb_array_elements(coalesce(snapshot->'ideas','[]'::jsonb)) loop
  if idea->>'status'='accepted' and idea->>'owner' in ('0','1') and coalesce(idea->>'date','') ~ '^\d{4}-\d{2}-\d{2}$'
     and not exists(select 1 from jsonb_array_elements(events) a where a->>'sourceIdeaId'=idea->>'id') then
   event := jsonb_build_object(
    'id',gen_random_uuid()::text,'sourceIdeaId',idea->>'id','sourceIdeaVersion',(idea->>'version')::integer,
    'owner',(idea->>'owner')::integer,'visibility','shared','person',-1,'title',idea->>'title',
    'category',case idea->>'category' when 'restaurant' then 'party' when 'outing' then 'party' when 'home' then 'home' when 'trip' then 'travel' else 'personal' end,
    'status','scheduled','date',idea->>'date','time',coalesce(idea->>'time',''),
    'endDate','','recurrence','none','repeatUntil','','bookBy','',
    'location',left(concat_ws(' · ',nullif(idea#>>'{place,name}',''),nullif(idea#>>'{place,address}',''),nullif(idea->>'location','')),150),
    'place',coalesce(idea->'place','null'::jsonb),'note',left(coalesce(idea->>'description',''),500),
    'createdAt',coalesce(nullif(idea->>'respondedAt',''),to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),'version',1
   );
   events := events || jsonb_build_array(event);changed := true;
  end if;
 end loop;
 if changed then update public.nd_state set data=jsonb_set(snapshot,'{appointments}',events),version=version+1 where id=1; end if;
end $$;
