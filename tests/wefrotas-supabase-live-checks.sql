-- Read-only acceptance checks for the imported Covre workspace.
with params as (
  select '20345e0b-5969-4824-9ab0-77b32c87bfc8'::uuid as org_id
), expected_counts as (
  select jsonb_build_object('vehicles',10,'drivers',10,'suppliers',29,'central_cities',9,'orders',62,'finance_entries',282,'deleted_orders',2,'notifications',1) value
), actual_counts as (
  select jsonb_build_object(
    'vehicles',(select count(*) from public.wefrotas_vehicles where organization_id=params.org_id),
    'drivers',(select count(*) from public.wefrotas_drivers where organization_id=params.org_id),
    'suppliers',(select count(*) from public.wefrotas_suppliers where organization_id=params.org_id),
    'central_cities',(select count(*) from public.wefrotas_central_cities where organization_id=params.org_id),
    'orders',(select count(*) from public.wefrotas_orders where organization_id=params.org_id),
    'finance_entries',(select count(*) from public.wefrotas_finance_entries where organization_id=params.org_id),
    'deleted_orders',(select count(*) from public.wefrotas_deleted_orders where organization_id=params.org_id),
    'notifications',(select count(*) from public.wefrotas_notifications where organization_id=params.org_id)
  ) value from params
), checks as (
  select 'count.'||e.key name, e.value = a.value passed,
    'expected='||e.value||', actual='||a.value details
  from expected_counts, actual_counts, lateral jsonb_each_text(expected_counts.value) e
  join lateral jsonb_each_text(actual_counts.value) a on a.key=e.key
  union all select 'payload.vehicles.object',not exists(select 1 from public.wefrotas_vehicles,params where organization_id=params.org_id and jsonb_typeof(data)<>'object'),'all payloads are objects'
  union all select 'payload.drivers.object',not exists(select 1 from public.wefrotas_drivers,params where organization_id=params.org_id and jsonb_typeof(data)<>'object'),'all payloads are objects'
  union all select 'payload.suppliers.object',not exists(select 1 from public.wefrotas_suppliers,params where organization_id=params.org_id and jsonb_typeof(data)<>'object'),'all payloads are objects'
  union all select 'payload.central_cities.object',not exists(select 1 from public.wefrotas_central_cities,params where organization_id=params.org_id and jsonb_typeof(data)<>'object'),'all payloads are objects'
  union all select 'payload.orders.object',not exists(select 1 from public.wefrotas_orders,params where organization_id=params.org_id and jsonb_typeof(data)<>'object'),'all payloads are objects'
  union all select 'payload.finance.object',not exists(select 1 from public.wefrotas_finance_entries,params where organization_id=params.org_id and jsonb_typeof(data)<>'object'),'all payloads are objects'
  union all select 'payload.deleted_orders.object',not exists(select 1 from public.wefrotas_deleted_orders,params where organization_id=params.org_id and jsonb_typeof(data)<>'object'),'all payloads are objects'
  union all select 'payload.notifications.object',not exists(select 1 from public.wefrotas_notifications,params where organization_id=params.org_id and jsonb_typeof(data)<>'object'),'all payloads are objects'
  union all select 'identity.vehicles',not exists(select 1 from public.wefrotas_vehicles,params where organization_id=params.org_id and (entity_id='' or data->>'id' is distinct from entity_id)),'entity id matches payload id'
  union all select 'identity.drivers',not exists(select 1 from public.wefrotas_drivers,params where organization_id=params.org_id and (entity_id='' or data->>'id' is distinct from entity_id)),'entity id matches payload id'
  union all select 'identity.suppliers',not exists(select 1 from public.wefrotas_suppliers,params where organization_id=params.org_id and (entity_id='' or data->>'id' is distinct from entity_id)),'entity id matches payload id'
  union all select 'identity.central_cities',not exists(select 1 from public.wefrotas_central_cities,params where organization_id=params.org_id and (entity_id='' or data->>'id' is distinct from entity_id)),'entity id matches payload id'
  union all select 'identity.orders',not exists(select 1 from public.wefrotas_orders,params where organization_id=params.org_id and (entity_id='' or data->>'id' is distinct from entity_id)),'entity id matches payload id'
  union all select 'identity.finance',not exists(select 1 from public.wefrotas_finance_entries,params where organization_id=params.org_id and (entity_id='' or data->>'id' is distinct from entity_id)),'entity id matches payload id'
  union all select 'identity.deleted_orders',not exists(select 1 from public.wefrotas_deleted_orders,params where organization_id=params.org_id and (entity_id='' or data->>'id' is distinct from entity_id)),'entity id matches payload id'
  union all select 'identity.notifications',not exists(select 1 from public.wefrotas_notifications,params where organization_id=params.org_id and (entity_id='' or data->>'id' is distinct from entity_id)),'entity id matches payload id'
  union all select 'rls.'||c.relname,c.relrowsecurity,'row level security enabled'
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname in ('wefrotas_workspace_state','wefrotas_vehicles','wefrotas_drivers','wefrotas_suppliers','wefrotas_central_cities','wefrotas_orders','wefrotas_finance_entries','wefrotas_deleted_orders','wefrotas_notifications','wefrotas_central_records','wefrotas_central_driver_directory','wefrotas_banners','wefrotas_session_presence','wefrotas_audit_events','wefrotas_import_runs')
  union all select 'realtime.'||tablename,true,'published in supabase_realtime'
    from pg_publication_tables where pubname='supabase_realtime' and schemaname='public'
      and tablename in ('wefrotas_workspace_state','wefrotas_vehicles','wefrotas_drivers','wefrotas_suppliers','wefrotas_central_cities','wefrotas_orders','wefrotas_finance_entries','wefrotas_deleted_orders','wefrotas_notifications','wefrotas_central_records','wefrotas_central_driver_directory','wefrotas_banners')
  union all select 'workspace.revision',exists(select 1 from public.wefrotas_workspace_state,params where organization_id=params.org_id and revision>=1),'revision is initialized'
  union all select 'workspace.source_time',exists(select 1 from public.wefrotas_workspace_state,params where organization_id=params.org_id and source_updated_at is not null),'source timestamp retained'
  union all select 'import.logged',exists(select 1 from public.wefrotas_import_runs,params where organization_id=params.org_id and snapshot_sha256='b13c8a4b22e01587c07fce107a0315d6de741e080c30dff9626ebe3e080442d5'),'content hash logged'
  union all select 'audit.import',exists(select 1 from public.wefrotas_audit_events,params where organization_id=params.org_id and entity_type='migration' and action='import'),'import is audited'
  union all select 'orders.unique_number',not exists(select data->>'numero' from public.wefrotas_orders,params where organization_id=params.org_id and coalesce(data->>'numero','')<>'' group by data->>'numero' having count(*)>1),'OS numbers are unique'
  union all select 'finance.order_reference',not exists(select 1 from public.wefrotas_finance_entries f,params where f.organization_id=params.org_id and coalesce(f.data->>'orderId','')<>'' and not exists(select 1 from public.wefrotas_orders o where o.organization_id=f.organization_id and o.entity_id=f.data->>'orderId')),'finance order references resolve'
)
select row_number() over(order by name) test_number,name,passed,details from checks order by name;
