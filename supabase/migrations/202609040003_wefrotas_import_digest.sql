-- pgcrypto is installed in Supabase's extensions schema. The importer remains
-- security-definer, but can resolve digest() only from the two explicit schemas.
alter function public.wefrotas_import_snapshot(uuid, text, timestamptz, jsonb)
  set search_path = public, extensions;
