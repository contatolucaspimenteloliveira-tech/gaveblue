create extension if not exists pgcrypto;

-- Operational data is stored by entity, never as one giant snapshot.  The
-- jsonb payload preserves every legacy field while expression indexes serve
-- the queries the current UI actually performs.
create table if not exists public.wefrotas_workspace_state (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  revision bigint not null default 0 check (revision >= 0),
  order_counter integer not null default 1 check (order_counter > 0),
  settings jsonb not null default '{}'::jsonb,
  source_updated_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.wefrotas_vehicles (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_id text not null,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, entity_id)
);
create table if not exists public.wefrotas_drivers (like public.wefrotas_vehicles including all);
alter table public.wefrotas_drivers drop constraint if exists wefrotas_drivers_organization_id_fkey;
alter table public.wefrotas_drivers add constraint wefrotas_drivers_organization_id_fkey foreign key (organization_id) references public.organizations(id) on delete cascade;
create table if not exists public.wefrotas_suppliers (like public.wefrotas_vehicles including all);
alter table public.wefrotas_suppliers drop constraint if exists wefrotas_suppliers_organization_id_fkey;
alter table public.wefrotas_suppliers add constraint wefrotas_suppliers_organization_id_fkey foreign key (organization_id) references public.organizations(id) on delete cascade;
create table if not exists public.wefrotas_central_cities (like public.wefrotas_vehicles including all);
alter table public.wefrotas_central_cities drop constraint if exists wefrotas_central_cities_organization_id_fkey;
alter table public.wefrotas_central_cities add constraint wefrotas_central_cities_organization_id_fkey foreign key (organization_id) references public.organizations(id) on delete cascade;
create table if not exists public.wefrotas_orders (like public.wefrotas_vehicles including all);
alter table public.wefrotas_orders drop constraint if exists wefrotas_orders_organization_id_fkey;
alter table public.wefrotas_orders add constraint wefrotas_orders_organization_id_fkey foreign key (organization_id) references public.organizations(id) on delete cascade;
create table if not exists public.wefrotas_finance_entries (like public.wefrotas_vehicles including all);
alter table public.wefrotas_finance_entries drop constraint if exists wefrotas_finance_entries_organization_id_fkey;
alter table public.wefrotas_finance_entries add constraint wefrotas_finance_entries_organization_id_fkey foreign key (organization_id) references public.organizations(id) on delete cascade;
create table if not exists public.wefrotas_deleted_orders (like public.wefrotas_vehicles including all);
alter table public.wefrotas_deleted_orders drop constraint if exists wefrotas_deleted_orders_organization_id_fkey;
alter table public.wefrotas_deleted_orders add constraint wefrotas_deleted_orders_organization_id_fkey foreign key (organization_id) references public.organizations(id) on delete cascade;
create table if not exists public.wefrotas_notifications (like public.wefrotas_vehicles including all);
alter table public.wefrotas_notifications drop constraint if exists wefrotas_notifications_organization_id_fkey;
alter table public.wefrotas_notifications add constraint wefrotas_notifications_organization_id_fkey foreign key (organization_id) references public.organizations(id) on delete cascade;

create table if not exists public.wefrotas_central_records (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_id text not null,
  record_type text not null default '',
  status text not null default 'pendente',
  occurred_at timestamptz,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, entity_id)
);

create table if not exists public.wefrotas_central_driver_directory (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_id text not null,
  driver_id text not null,
  vehicle_id text not null default '',
  active boolean not null default true,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (organization_id, entity_id)
);

create table if not exists public.wefrotas_banners (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_id text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, entity_id)
);

create table if not exists public.wefrotas_session_presence (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  connection_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  browser text not null default '',
  system text not null default '',
  active boolean not null default true,
  opened_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  closed_at timestamptz,
  primary key (organization_id, connection_id)
);

create table if not exists public.wefrotas_audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text not null default '',
  entity_type text not null,
  entity_id text not null default '',
  action text not null check (action in ('create','update','delete','import','login','logout')),
  before_data jsonb,
  after_data jsonb,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.wefrotas_import_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  import_key text not null,
  snapshot_sha256 text not null,
  source_updated_at timestamptz,
  counts jsonb not null default '{}'::jsonb,
  imported_by uuid references auth.users(id) on delete set null,
  imported_at timestamptz not null default now(),
  unique (organization_id, import_key)
);

create index if not exists wefrotas_vehicle_plate_idx on public.wefrotas_vehicles (organization_id, upper(data->>'placa'));
create index if not exists wefrotas_vehicle_fleet_idx on public.wefrotas_vehicles (organization_id, (data->>'numeroFrota'));
create index if not exists wefrotas_driver_name_idx on public.wefrotas_drivers (organization_id, lower(data->>'nome'));
create index if not exists wefrotas_driver_document_idx on public.wefrotas_drivers (organization_id, (data->>'cpf'));
create index if not exists wefrotas_supplier_name_idx on public.wefrotas_suppliers (organization_id, lower(data->>'nome'));
create unique index if not exists wefrotas_order_number_idx on public.wefrotas_orders (organization_id, (data->>'numero')) where coalesce(data->>'numero','') <> '';
create index if not exists wefrotas_order_status_date_idx on public.wefrotas_orders (organization_id, (data->>'status'), (data->>'dataInicio') desc);
create index if not exists wefrotas_order_vehicle_idx on public.wefrotas_orders (organization_id, (data->>'vehicleId'));
create index if not exists wefrotas_finance_order_idx on public.wefrotas_finance_entries (organization_id, (data->>'orderId'));
create index if not exists wefrotas_finance_vehicle_idx on public.wefrotas_finance_entries (organization_id, (data->>'vehicleId'));
create index if not exists wefrotas_finance_status_date_idx on public.wefrotas_finance_entries (organization_id, (data->>'workflowStatus'), (data->>'dataAbastecimento') desc);
create index if not exists wefrotas_central_status_date_idx on public.wefrotas_central_records (organization_id, status, occurred_at desc);
create index if not exists wefrotas_audit_org_date_idx on public.wefrotas_audit_events (organization_id, occurred_at desc);
create index if not exists wefrotas_presence_org_seen_idx on public.wefrotas_session_presence (organization_id, last_seen_at desc);

create or replace function public.wefrotas_can_read(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_platform_admin() or exists (
    select 1 from public.organization_members m
    where m.organization_id = target_organization_id
      and m.user_id = auth.uid() and m.status = 'active'
  );
$$;

create or replace function public.wefrotas_can_write(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_platform_admin(array['owner','support']) or exists (
    select 1 from public.organization_members m
    where m.organization_id = target_organization_id
      and m.user_id = auth.uid() and m.status = 'active'
      and m.role in ('admin','manager','approver')
  );
$$;

create or replace function public.wefrotas_touch_entity()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end;
$$;

create or replace function public.wefrotas_audit_entity()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  org_id uuid := coalesce(new.organization_id, old.organization_id);
  item_id text := coalesce(new.entity_id, old.entity_id, '');
  verb text := case tg_op when 'INSERT' then 'create' when 'UPDATE' then 'update' else 'delete' end;
begin
  if tg_op = 'UPDATE' and to_jsonb(new) = to_jsonb(old) then return new; end if;
  insert into public.wefrotas_audit_events
    (organization_id, actor_user_id, actor_email, entity_type, entity_id, action, before_data, after_data)
  values
    (org_id, auth.uid(), coalesce(auth.jwt()->>'email',''), tg_table_name, item_id, verb,
     case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
     case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'wefrotas_vehicles','wefrotas_drivers','wefrotas_suppliers','wefrotas_central_cities',
    'wefrotas_orders','wefrotas_finance_entries','wefrotas_deleted_orders','wefrotas_notifications',
    'wefrotas_central_records','wefrotas_central_driver_directory','wefrotas_banners'
  ] loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.wefrotas_touch_entity()', t, t);
    execute format('drop trigger if exists %I_audit on public.%I', t, t);
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function public.wefrotas_audit_entity()', t, t);
  end loop;
end $$;

-- Links a pre-authorized company member when that email creates its Supabase
-- Auth account. Unknown emails receive no tenant and therefore no data access.
create or replace function public.wefrotas_link_auth_member()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.organization_members
  set user_id = new.id, updated_at = now()
  where user_id is null and status = 'active' and lower(email) = lower(new.email);
  return new;
end;
$$;
drop trigger if exists wefrotas_link_auth_member_after_signup on auth.users;
create trigger wefrotas_link_auth_member_after_signup
after insert or update of email on auth.users
for each row execute function public.wefrotas_link_auth_member();

create or replace function public.wefrotas_apply_table_delta(
  target_table text, target_organization_id uuid, upserts jsonb, deletes jsonb
) returns void language plpgsql security definer set search_path = public as $$
declare item jsonb; item_id text;
begin
  if target_table <> all(array[
    'wefrotas_vehicles','wefrotas_drivers','wefrotas_suppliers','wefrotas_central_cities',
    'wefrotas_orders','wefrotas_finance_entries','wefrotas_deleted_orders','wefrotas_notifications'
  ]) then raise exception 'Unsupported WeFrotas table'; end if;
  for item in select value from jsonb_array_elements(coalesce(upserts, '[]'::jsonb)) loop
    item_id := nullif(item->>'id','');
    if item_id is null then raise exception 'Every entity needs an id'; end if;
    execute format(
      'insert into public.%I (organization_id,entity_id,data) values ($1,$2,$3) '
      'on conflict (organization_id,entity_id) do update set data=excluded.data '
      'where %I.data is distinct from excluded.data', target_table, target_table
    ) using target_organization_id, item_id, item;
  end loop;
  for item_id in select value #>> '{}' from jsonb_array_elements(coalesce(deletes, '[]'::jsonb)) loop
    execute format('delete from public.%I where organization_id=$1 and entity_id=$2', target_table)
      using target_organization_id, item_id;
  end loop;
end;
$$;

create or replace function public.wefrotas_apply_snapshot_delta(
  target_organization_id uuid,
  expected_revision bigint,
  delta jsonb,
  next_state jsonb default '{}'::jsonb
) returns bigint language plpgsql security definer set search_path = public as $$
declare current_revision bigint; next_revision bigint; spec jsonb;
declare mapping jsonb := jsonb_build_object(
  'vehicles','wefrotas_vehicles','drivers','wefrotas_drivers','suppliers','wefrotas_suppliers',
  'centralCities','wefrotas_central_cities','orders','wefrotas_orders','finance','wefrotas_finance_entries',
  'deletedOrders','wefrotas_deleted_orders','notifications','wefrotas_notifications'
);
declare entity_key text; table_name text;
begin
  if not public.wefrotas_can_write(target_organization_id) then raise exception 'Tenant write denied' using errcode='42501'; end if;
  insert into public.wefrotas_workspace_state (organization_id) values (target_organization_id) on conflict do nothing;
  select revision into current_revision from public.wefrotas_workspace_state where organization_id=target_organization_id for update;
  if current_revision <> expected_revision then raise exception 'WEFROTAS_REVISION_CONFLICT expected %, current %', expected_revision, current_revision using errcode='40001'; end if;
  for entity_key, table_name in select key, value #>> '{}' from jsonb_each(mapping) loop
    spec := coalesce(delta->entity_key, '{}'::jsonb);
    perform public.wefrotas_apply_table_delta(table_name, target_organization_id, spec->'upserts', spec->'deletes');
  end loop;
  next_revision := current_revision + 1;
  update public.wefrotas_workspace_state set
    revision=next_revision,
    order_counter=greatest(1,coalesce((next_state->>'orderCounter')::integer,order_counter)),
    settings=coalesce(next_state->'settings',settings), updated_at=now(), updated_by=auth.uid()
  where organization_id=target_organization_id;
  return next_revision;
end;
$$;

create or replace function public.wefrotas_load_snapshot(target_organization_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare result jsonb; state_row public.wefrotas_workspace_state%rowtype;
begin
  if not public.wefrotas_can_read(target_organization_id) then raise exception 'Tenant read denied' using errcode='42501'; end if;
  select * into state_row from public.wefrotas_workspace_state where organization_id=target_organization_id;
  select jsonb_build_object(
    'revision',coalesce(state_row.revision,0),
    'updatedAt',coalesce(state_row.updated_at,now()),
    'snapshot',coalesce(state_row.settings,'{}'::jsonb) || jsonb_build_object(
      'orderCounter',coalesce(state_row.order_counter,1),
      'vehicles',coalesce((select jsonb_agg(data order by entity_id) from public.wefrotas_vehicles where organization_id=target_organization_id),'[]'::jsonb),
      'drivers',coalesce((select jsonb_agg(data order by entity_id) from public.wefrotas_drivers where organization_id=target_organization_id),'[]'::jsonb),
      'suppliers',coalesce((select jsonb_agg(data order by entity_id) from public.wefrotas_suppliers where organization_id=target_organization_id),'[]'::jsonb),
      'centralCities',coalesce((select jsonb_agg(data order by entity_id) from public.wefrotas_central_cities where organization_id=target_organization_id),'[]'::jsonb),
      'orders',coalesce((select jsonb_agg(data order by entity_id) from public.wefrotas_orders where organization_id=target_organization_id),'[]'::jsonb),
      'finance',coalesce((select jsonb_agg(data order by entity_id) from public.wefrotas_finance_entries where organization_id=target_organization_id),'[]'::jsonb),
      'deletedOrders',coalesce((select jsonb_agg(data order by entity_id) from public.wefrotas_deleted_orders where organization_id=target_organization_id),'[]'::jsonb),
      'notifications',coalesce((select jsonb_agg(data order by entity_id) from public.wefrotas_notifications where organization_id=target_organization_id),'[]'::jsonb)
    )
  ) into result;
  return result;
end;
$$;

create or replace function public.wefrotas_import_snapshot(
  target_organization_id uuid, p_import_key text, source_updated_at timestamptz, snapshot jsonb
) returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare digest_value text := encode(digest(snapshot::text,'sha256'),'hex');
declare prior public.wefrotas_import_runs%rowtype; counts jsonb; state_settings jsonb;
begin
  if not public.is_platform_admin(array['owner','support']) and auth.role() <> 'service_role' then
    raise exception 'Platform admin required' using errcode='42501';
  end if;
  select * into prior from public.wefrotas_import_runs where organization_id=target_organization_id and import_key=p_import_key;
  if prior.id is not null then
    if prior.snapshot_sha256 <> digest_value then raise exception 'Import key already used with different content'; end if;
    return jsonb_build_object('idempotent',true,'counts',prior.counts,'sha256',prior.snapshot_sha256);
  end if;
  perform public.wefrotas_apply_table_delta('wefrotas_vehicles',target_organization_id,snapshot->'vehicles','[]');
  perform public.wefrotas_apply_table_delta('wefrotas_drivers',target_organization_id,snapshot->'drivers','[]');
  perform public.wefrotas_apply_table_delta('wefrotas_suppliers',target_organization_id,snapshot->'suppliers','[]');
  perform public.wefrotas_apply_table_delta('wefrotas_central_cities',target_organization_id,snapshot->'centralCities','[]');
  perform public.wefrotas_apply_table_delta('wefrotas_orders',target_organization_id,snapshot->'orders','[]');
  perform public.wefrotas_apply_table_delta('wefrotas_finance_entries',target_organization_id,snapshot->'finance','[]');
  perform public.wefrotas_apply_table_delta('wefrotas_deleted_orders',target_organization_id,snapshot->'deletedOrders','[]');
  perform public.wefrotas_apply_table_delta('wefrotas_notifications',target_organization_id,snapshot->'notifications','[]');
  state_settings := snapshot - array['vehicles','drivers','suppliers','centralCities','orders','finance','deletedOrders','notifications','orderCounter'];
  insert into public.wefrotas_workspace_state (organization_id,revision,order_counter,settings,source_updated_at,updated_by)
  values (target_organization_id,1,greatest(1,coalesce((snapshot->>'orderCounter')::integer,1)),state_settings,source_updated_at,auth.uid())
  on conflict (organization_id) do update set
    revision=wefrotas_workspace_state.revision+1, order_counter=excluded.order_counter,
    settings=excluded.settings, source_updated_at=excluded.source_updated_at, updated_at=now(), updated_by=auth.uid();
  counts := jsonb_build_object(
    'vehicles',jsonb_array_length(coalesce(snapshot->'vehicles','[]')),
    'drivers',jsonb_array_length(coalesce(snapshot->'drivers','[]')),
    'suppliers',jsonb_array_length(coalesce(snapshot->'suppliers','[]')),
    'centralCities',jsonb_array_length(coalesce(snapshot->'centralCities','[]')),
    'orders',jsonb_array_length(coalesce(snapshot->'orders','[]')),
    'finance',jsonb_array_length(coalesce(snapshot->'finance','[]')),
    'deletedOrders',jsonb_array_length(coalesce(snapshot->'deletedOrders','[]')),
    'notifications',jsonb_array_length(coalesce(snapshot->'notifications','[]'))
  );
  insert into public.wefrotas_import_runs (organization_id,import_key,snapshot_sha256,source_updated_at,counts,imported_by)
  values (target_organization_id,p_import_key,digest_value,source_updated_at,counts,auth.uid());
  insert into public.wefrotas_audit_events (organization_id,actor_user_id,actor_email,entity_type,action,details)
  values (target_organization_id,auth.uid(),coalesce(auth.jwt()->>'email',''),'migration','import',jsonb_build_object('importKey',p_import_key,'counts',counts,'sha256',digest_value));
  return jsonb_build_object('idempotent',false,'counts',counts,'sha256',digest_value);
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'wefrotas_workspace_state','wefrotas_vehicles','wefrotas_drivers','wefrotas_suppliers',
    'wefrotas_central_cities','wefrotas_orders','wefrotas_finance_entries','wefrotas_deleted_orders',
    'wefrotas_notifications','wefrotas_central_records','wefrotas_central_driver_directory',
    'wefrotas_banners','wefrotas_session_presence','wefrotas_audit_events','wefrotas_import_runs'
  ] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('drop policy if exists %I on public.%I',t||'_read',t);
    execute format('create policy %I on public.%I for select to authenticated using (public.wefrotas_can_read(organization_id))',t||'_read',t);
  end loop;
  foreach t in array array[
    'wefrotas_workspace_state','wefrotas_vehicles','wefrotas_drivers','wefrotas_suppliers',
    'wefrotas_central_cities','wefrotas_orders','wefrotas_finance_entries','wefrotas_deleted_orders',
    'wefrotas_notifications','wefrotas_central_records','wefrotas_central_driver_directory','wefrotas_banners','wefrotas_session_presence'
  ] loop
    execute format('drop policy if exists %I on public.%I',t||'_write',t);
    execute format('create policy %I on public.%I for all to authenticated using (public.wefrotas_can_write(organization_id)) with check (public.wefrotas_can_write(organization_id))',t||'_write',t);
    execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  end loop;
end $$;

grant select on public.wefrotas_audit_events, public.wefrotas_import_runs to authenticated;
grant usage, select on sequence public.wefrotas_audit_events_id_seq to authenticated;
revoke all on function public.wefrotas_apply_table_delta(text,uuid,jsonb,jsonb) from public, anon, authenticated;
revoke all on function public.wefrotas_import_snapshot(uuid,text,timestamptz,jsonb) from public, anon;
grant execute on function public.wefrotas_import_snapshot(uuid,text,timestamptz,jsonb) to authenticated, service_role;
revoke all on function public.wefrotas_apply_snapshot_delta(uuid,bigint,jsonb,jsonb) from public, anon;
grant execute on function public.wefrotas_apply_snapshot_delta(uuid,bigint,jsonb,jsonb) to authenticated;
revoke all on function public.wefrotas_load_snapshot(uuid) from public, anon;
grant execute on function public.wefrotas_load_snapshot(uuid) to authenticated;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('wefrotas-assets','wefrotas-assets',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

drop policy if exists "wefrotas members read assets" on storage.objects;
create policy "wefrotas members read assets" on storage.objects for select to authenticated using (
  bucket_id='wefrotas-assets' and public.wefrotas_can_read(
    case when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then ((storage.foldername(name))[1])::uuid end
  )
);
drop policy if exists "wefrotas writers manage assets" on storage.objects;
create policy "wefrotas writers manage assets" on storage.objects for all to authenticated using (
  bucket_id='wefrotas-assets' and public.wefrotas_can_write(
    case when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then ((storage.foldername(name))[1])::uuid end
  )
) with check (
  bucket_id='wefrotas-assets' and public.wefrotas_can_write(
    case when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then ((storage.foldername(name))[1])::uuid end
  )
);

comment on table public.wefrotas_workspace_state is 'Version and non-entity settings for the relational WeFrotas backend.';
comment on function public.wefrotas_import_snapshot is 'Idempotent, non-destructive importer for one explicitly selected legacy snapshot.';
