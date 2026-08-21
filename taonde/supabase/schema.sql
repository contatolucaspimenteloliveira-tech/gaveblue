create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  subscription jsonb not null,
  city text default 'Pinheiros',
  state text default 'ES',
  audience text default 'todos',
  user_agent text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.push_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  link text default '/eventos',
  audience text default 'todos',
  sent_count integer default 0,
  failed_count integer default 0,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
alter table public.push_notifications enable row level security;

create policy "Service role manages push subscriptions"
  on public.push_subscriptions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role manages push notifications"
  on public.push_notifications
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
