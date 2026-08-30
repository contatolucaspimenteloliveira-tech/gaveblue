create extension if not exists pgcrypto;

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'support', 'commercial', 'viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9]{2,36}$'),
  name text not null,
  description text not null default '',
  monthly_price numeric(12,2) not null default 0 check (monthly_price >= 0),
  max_users integer not null default 5 check (max_users > 0),
  max_vehicles integer not null default 20 check (max_vehicles > 0),
  max_devices integer not null default 20 check (max_devices > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  legal_name text not null default '',
  document text not null default '',
  status text not null default 'active' check (status in ('trial', 'active', 'past_due', 'suspended', 'archived')),
  logo_url text not null default '',
  primary_color text not null default '#2563eb' check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color text not null default '#7c3aed' check (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  appwrite_workspace_id text not null unique check (length(appwrite_workspace_id) between 2 and 36),
  appwrite_team_id text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_subscriptions (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  status text not null default 'trial' check (status in ('trial', 'active', 'past_due', 'suspended', 'cancelled')),
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  max_users integer check (max_users is null or max_users > 0),
  max_vehicles integer check (max_vehicles is null or max_vehicles > 0),
  max_devices integer check (max_devices is null or max_devices > 0),
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_modules (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  module_key text not null check (module_key in ('wefrotas', 'central')),
  enabled boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (organization_id, module_key)
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  appwrite_user_id text not null default '',
  role text not null default 'viewer' check (role in ('admin', 'manager', 'approver', 'viewer', 'driver')),
  status text not null default 'invited' check (status in ('invited', 'active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists public.platform_audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  action text not null,
  target_type text not null default '',
  target_id text not null default '',
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists organization_members_user_idx on public.organization_members(user_id) where user_id is not null;
create index if not exists organization_members_appwrite_idx on public.organization_members(appwrite_user_id) where appwrite_user_id <> '';
create unique index if not exists organization_members_org_appwrite_unique_idx
  on public.organization_members(organization_id, appwrite_user_id) where appwrite_user_id <> '';
create index if not exists organizations_status_idx on public.organizations(status);
create index if not exists platform_audit_org_created_idx on public.platform_audit_logs(organization_id, created_at desc);

create or replace function public.is_platform_admin(required_roles text[] default null)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.platform_admins pa
    where pa.user_id = auth.uid() and pa.active
      and (required_roles is null or pa.role = any(required_roles))
  );
$$;

create or replace function public.is_organization_manager(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = target_organization_id and m.user_id = auth.uid()
      and m.status = 'active' and m.role in ('admin','manager')
  );
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists plans_touch_updated_at on public.plans;
create trigger plans_touch_updated_at before update on public.plans for each row execute function public.touch_updated_at();
drop trigger if exists organizations_touch_updated_at on public.organizations;
create trigger organizations_touch_updated_at before update on public.organizations for each row execute function public.touch_updated_at();
drop trigger if exists subscriptions_touch_updated_at on public.organization_subscriptions;
create trigger subscriptions_touch_updated_at before update on public.organization_subscriptions for each row execute function public.touch_updated_at();
drop trigger if exists members_touch_updated_at on public.organization_members;
create trigger members_touch_updated_at before update on public.organization_members for each row execute function public.touch_updated_at();

alter table public.platform_admins enable row level security;
alter table public.plans enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_subscriptions enable row level security;
alter table public.organization_modules enable row level security;
alter table public.organization_members enable row level security;
alter table public.platform_audit_logs enable row level security;

create policy "platform admins read admins" on public.platform_admins for select using (public.is_platform_admin());
create policy "platform owners manage admins" on public.platform_admins for all using (public.is_platform_admin(array['owner'])) with check (public.is_platform_admin(array['owner']));
create policy "platform admins manage plans" on public.plans for all using (public.is_platform_admin()) with check (public.is_platform_admin(array['owner','commercial']));
create policy "platform admins manage organizations" on public.organizations for all using (public.is_platform_admin()) with check (public.is_platform_admin(array['owner','support','commercial']));
create policy "members read own organization" on public.organizations for select using (
  exists (select 1 from public.organization_members m where m.organization_id = id and m.user_id = auth.uid() and m.status = 'active')
);
create policy "platform admins manage subscriptions" on public.organization_subscriptions for all using (public.is_platform_admin()) with check (public.is_platform_admin(array['owner','commercial']));
create policy "members read own subscription" on public.organization_subscriptions for select using (
  exists (select 1 from public.organization_members m
    where m.organization_id = organization_subscriptions.organization_id and m.user_id = auth.uid() and m.status = 'active')
);
create policy "platform admins manage modules" on public.organization_modules for all using (public.is_platform_admin()) with check (public.is_platform_admin(array['owner','support','commercial']));
create policy "members read own modules" on public.organization_modules for select using (
  exists (select 1 from public.organization_members m
    where m.organization_id = organization_modules.organization_id and m.user_id = auth.uid() and m.status = 'active')
);
create policy "platform admins manage members" on public.organization_members for all using (public.is_platform_admin()) with check (public.is_platform_admin(array['owner','support']));
create policy "members read organization peers" on public.organization_members for select using (
  user_id = auth.uid() or public.is_organization_manager(organization_id)
);
create policy "platform admins read audit" on public.platform_audit_logs for select using (public.is_platform_admin());

insert into public.plans (code, name, description, monthly_price, max_users, max_vehicles, max_devices)
values
  ('starter', 'Inicial', 'WeFrotas para operações menores.', 0, 5, 20, 20),
  ('business', 'Empresarial', 'WeFrotas e Central de Registros.', 0, 25, 100, 100),
  ('enterprise', 'Personalizado', 'Limites e módulos negociados.', 0, 250, 2000, 2000)
on conflict (code) do nothing;

insert into public.organizations (slug, name, legal_name, document, status, appwrite_workspace_id)
values ('covre-e-cia', 'Covre & Cia', 'COVRE & CIA LTDA', '28.419.232/0001-06', 'active', 'covre-e-cia')
on conflict (slug) do nothing;

insert into public.organization_modules (organization_id, module_key, enabled)
select id, module_key, true from public.organizations cross join (values ('wefrotas'), ('central')) as modules(module_key)
where slug = 'covre-e-cia'
on conflict (organization_id, module_key) do nothing;

insert into public.organization_subscriptions (organization_id, plan_id, status)
select o.id, p.id, 'active' from public.organizations o cross join public.plans p
where o.slug = 'covre-e-cia' and p.code = 'business'
on conflict (organization_id) do nothing;

comment on table public.organizations is 'Empresas clientes da plataforma GaveBlue; fonte oficial do tenant.';
comment on table public.organization_members is 'Vínculo entre Supabase Auth, Appwrite Auth e a empresa autorizada.';
