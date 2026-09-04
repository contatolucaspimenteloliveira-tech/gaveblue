-- The browser listens for tenant-scoped row changes and for the workspace
-- revision that closes each atomic write. Adding the tables is idempotent.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'wefrotas_workspace_state',
    'wefrotas_vehicles',
    'wefrotas_drivers',
    'wefrotas_suppliers',
    'wefrotas_central_cities',
    'wefrotas_orders',
    'wefrotas_finance_entries',
    'wefrotas_deleted_orders',
    'wefrotas_notifications',
    'wefrotas_central_records',
    'wefrotas_central_driver_directory',
    'wefrotas_banners'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;
